/**
 * useShiftDragDrop Hook
 *
 * Provides drag-and-drop functionality for shift scheduling.
 * Features:
 * - Drag shifts to reschedule
 * - Optimistic updates for instant feedback
 * - Conflict detection before saving
 * - Undo/redo capability
 */

import { useState, useCallback, useRef } from 'react';
import { updateShift } from '@/api/schedules';
import { detectConflicts, hasBlockingConflicts, ShiftData } from '@/lib/shift-conflicts';
import { logger } from '@/utils/logger';
import { showSuccess, showError } from '@/utils/toast';

interface ShiftUpdate {
  shiftId: string;
  previousData: {
    start_time: string;
    end_time: string;
    employee_id: string | null;
  };
  newData: {
    start_time: string;
    end_time: string;
    employee_id: string | null;
  };
}

interface UseShiftDragDropProps {
  shifts: ShiftData[];
  onShiftUpdate?: (shiftId: string, updates: Partial<ShiftData>) => void;
  onConflictDetected?: (conflicts: ReturnType<typeof detectConflicts>) => boolean; // Return true to allow anyway
}

const MAX_HISTORY = 10;

export function useShiftDragDrop({
  shifts,
  onShiftUpdate,
  onConflictDetected,
}: UseShiftDragDropProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedShiftId, setDraggedShiftId] = useState<string | null>(null);
  const [history, setHistory] = useState<ShiftUpdate[]>([]);
  const [redoStack, setRedoStack] = useState<ShiftUpdate[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Start dragging a shift
   */
  const handleDragStart = useCallback((shiftId: string) => {
    logger.debug('Starting drag for shift:', shiftId);
    setIsDragging(true);
    setDraggedShiftId(shiftId);
  }, []);

  /**
   * End dragging
   */
  const handleDragEnd = useCallback(() => {
    logger.debug('Ending drag');
    setIsDragging(false);
    setDraggedShiftId(null);
  }, []);

  /**
   * Handle dropping a shift at a new time
   */
  const handleDrop = useCallback(
    async (shiftId: string, newStartTime: Date, newEndTime?: Date): Promise<boolean> => {
      logger.debug('Dropping shift:', shiftId, 'at', newStartTime);

      // Find the shift being moved
      const shift = shifts.find((s) => s.id === shiftId);
      if (!shift) {
        logger.error('Shift not found:', shiftId);
        showError('Shift not found');
        return false;
      }

      // Calculate new end time if not provided (maintain duration)
      const originalStart = new Date(shift.start_time);
      const originalEnd = new Date(shift.end_time);
      const duration = originalEnd.getTime() - originalStart.getTime();
      const calculatedEndTime = newEndTime || new Date(newStartTime.getTime() + duration);

      // Create updated shift for conflict check
      const updatedShift: ShiftData = {
        ...shift,
        start_time: newStartTime,
        end_time: calculatedEndTime,
      };

      // Check for conflicts (excluding the current shift)
      const conflicts = detectConflicts(updatedShift, shifts, shiftId);

      if (conflicts.length > 0) {
        logger.warn('Conflicts detected:', conflicts);

        // If there are blocking conflicts and no handler, or handler returns false, abort
        const allowAnyway = onConflictDetected?.(conflicts);
        if (hasBlockingConflicts(conflicts) && !allowAnyway) {
          showError('Cannot move shift: conflicts detected');
          return false;
        }

        // If warnings only or user allowed, show toast but continue
        if (conflicts.length > 0 && allowAnyway) {
          logger.info('User chose to proceed despite conflicts');
        }
      }

      // Store previous state for undo
      const previousData = {
        start_time:
          typeof shift.start_time === 'string' ? shift.start_time : shift.start_time.toISOString(),
        end_time:
          typeof shift.end_time === 'string' ? shift.end_time : shift.end_time.toISOString(),
        employee_id: shift.employee_id,
      };

      // Optimistically update local state
      onShiftUpdate?.(shiftId, {
        start_time: newStartTime,
        end_time: calculatedEndTime,
      });

      try {
        // Cancel any pending request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        // Save to database
        await updateShift(shiftId, {
          start_time: newStartTime.toISOString(),
          end_time: calculatedEndTime.toISOString(),
        });

        // Add to history for undo
        const update: ShiftUpdate = {
          shiftId,
          previousData,
          newData: {
            start_time: newStartTime.toISOString(),
            end_time: calculatedEndTime.toISOString(),
            employee_id: shift.employee_id,
          },
        };

        setHistory((prev) => [...prev.slice(-MAX_HISTORY + 1), update]);
        setRedoStack([]); // Clear redo stack on new action

        logger.info('Shift updated successfully:', shiftId);
        showSuccess('Shift updated');
        return true;
      } catch (error) {
        // Roll back optimistic update on error
        logger.error('Failed to update shift:', error);
        onShiftUpdate?.(shiftId, previousData);
        showError('Failed to update shift');
        return false;
      }
    },
    [shifts, onShiftUpdate, onConflictDetected]
  );

  /**
   * Undo last shift move
   */
  const handleUndo = useCallback(async (): Promise<boolean> => {
    if (history.length === 0) {
      logger.debug('No actions to undo');
      return false;
    }

    const lastUpdate = history[history.length - 1];
    logger.debug('Undoing shift update:', lastUpdate.shiftId);

    try {
      // Revert in database
      await updateShift(lastUpdate.shiftId, {
        start_time: lastUpdate.previousData.start_time,
        end_time: lastUpdate.previousData.end_time,
        employee_id: lastUpdate.previousData.employee_id,
      });

      // Update local state
      onShiftUpdate?.(lastUpdate.shiftId, lastUpdate.previousData);

      // Move to redo stack
      setRedoStack((prev) => [...prev, lastUpdate]);
      setHistory((prev) => prev.slice(0, -1));

      logger.info('Undo successful');
      showSuccess('Undone');
      return true;
    } catch (error) {
      logger.error('Failed to undo:', error);
      showError('Failed to undo');
      return false;
    }
  }, [history, onShiftUpdate]);

  /**
   * Redo last undone action
   */
  const handleRedo = useCallback(async (): Promise<boolean> => {
    if (redoStack.length === 0) {
      logger.debug('No actions to redo');
      return false;
    }

    const lastUndo = redoStack[redoStack.length - 1];
    logger.debug('Redoing shift update:', lastUndo.shiftId);

    try {
      // Reapply in database
      await updateShift(lastUndo.shiftId, {
        start_time: lastUndo.newData.start_time,
        end_time: lastUndo.newData.end_time,
        employee_id: lastUndo.newData.employee_id,
      });

      // Update local state
      onShiftUpdate?.(lastUndo.shiftId, lastUndo.newData);

      // Move back to history
      setHistory((prev) => [...prev, lastUndo]);
      setRedoStack((prev) => prev.slice(0, -1));

      logger.info('Redo successful');
      showSuccess('Redone');
      return true;
    } catch (error) {
      logger.error('Failed to redo:', error);
      showError('Failed to redo');
      return false;
    }
  }, [redoStack, onShiftUpdate]);

  /**
   * Clear history
   */
  const clearHistory = useCallback(() => {
    setHistory([]);
    setRedoStack([]);
    logger.debug('History cleared');
  }, []);

  return {
    isDragging,
    draggedShiftId,
    handleDragStart,
    handleDragEnd,
    handleDrop,
    handleUndo,
    handleRedo,
    clearHistory,
    canUndo: history.length > 0,
    canRedo: redoStack.length > 0,
  };
}

export default useShiftDragDrop;

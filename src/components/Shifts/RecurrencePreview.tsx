/**
 * RecurrencePreview Component
 *
 * Shows a preview of the next occurrences for a recurring shift.
 */

import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { Calendar, Clock } from 'lucide-react';
import { generateOccurrences, stringifyRecurrenceRule } from '@/lib/recurrence-parser';
import type { RecurrenceRule } from '@/types/database';

interface RecurrencePreviewProps {
  recurrenceRule: RecurrenceRule | null;
  startDate: Date | null;
  maxOccurrences?: number;
}

export const RecurrencePreview: React.FC<RecurrencePreviewProps> = ({
  recurrenceRule,
  startDate,
  maxOccurrences = 10,
}) => {
  const occurrences = useMemo(() => {
    if (!recurrenceRule || !startDate) {
      return [];
    }

    try {
      return generateOccurrences(recurrenceRule, startDate, maxOccurrences);
    } catch (error) {
      console.error('Failed to generate occurrences:', error);
      return [];
    }
  }, [recurrenceRule, startDate, maxOccurrences]);

  const ruleDescription = useMemo(() => {
    if (!recurrenceRule) {
      return null;
    }

    try {
      const ruleString = stringifyRecurrenceRule(recurrenceRule);
      const parts: string[] = [];

      // Frequency
      const freqMap = {
        DAILY: 'day',
        WEEKLY: 'week',
        MONTHLY: 'month',
      };
      const freq = freqMap[recurrenceRule.freq];
      parts.push(
        recurrenceRule.interval === 1
          ? `Every ${freq}`
          : `Every ${recurrenceRule.interval} ${freq}s`
      );

      // Days (for weekly)
      if (recurrenceRule.freq === 'WEEKLY' && recurrenceRule.byDay) {
        const dayLabels = {
          MO: 'Mon',
          TU: 'Tue',
          WE: 'Wed',
          TH: 'Thu',
          FR: 'Fri',
          SA: 'Sat',
          SU: 'Sun',
        };
        const days = recurrenceRule.byDay.map((d) => dayLabels[d]).join(', ');
        parts.push(`on ${days}`);
      }

      // End condition
      if (recurrenceRule.until) {
        parts.push(`until ${format(new Date(recurrenceRule.until), 'MMM d, yyyy')}`);
      } else if (recurrenceRule.count) {
        parts.push(`for ${recurrenceRule.count} occurrences`);
      }

      return parts.join(' ');
    } catch (error) {
      return 'Invalid recurrence rule';
    }
  }, [recurrenceRule]);

  if (!recurrenceRule || !startDate) {
    return (
      <div className="rounded-lg border p-4 bg-muted/30">
        <p className="text-sm text-muted-foreground text-center">
          Configure recurrence settings to see preview
        </p>
      </div>
    );
  }

  if (occurrences.length === 0) {
    return (
      <div className="rounded-lg border p-4 bg-muted/30">
        <p className="text-sm text-destructive text-center">Invalid recurrence configuration</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border p-4 bg-background">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-semibold text-sm">Preview</h3>
      </div>

      {ruleDescription && <p className="text-sm text-muted-foreground italic">{ruleDescription}</p>}

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {occurrences.map((date, index) => (
          <div key={index} className="flex items-center gap-3 rounded-md bg-muted/50 p-2 text-sm">
            <span className="font-mono text-xs text-muted-foreground w-6">{index + 1}.</span>
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span>{format(date, 'EEE, MMM d, yyyy')}</span>
          </div>
        ))}
      </div>

      {occurrences.length >= maxOccurrences && (
        <p className="text-xs text-muted-foreground text-center pt-2">
          Showing first {maxOccurrences} occurrences
        </p>
      )}
    </div>
  );
};

export default RecurrencePreview;

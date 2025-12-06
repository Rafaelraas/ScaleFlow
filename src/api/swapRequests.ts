/**
 * Swap Requests API
 * 
 * Typed API layer for shift swap request operations.
 * All operations enforce RLS policies defined in the database.
 */

import { supabase } from '@/integrations/supabase/client.ts';
import { SwapRequest } from '@/types/database';

/**
 * Get swap requests the current user is involved in
 * RLS Policy: employees can view swap requests they're involved in
 */
export async function getMySwapRequests() {
  const { data, error } = await supabase
    .from('swap_requests')
    .select(`
      *,
      shift:shifts(*),
      requester:profiles!swap_requests_requester_id_fkey(first_name, last_name),
      target:profiles!swap_requests_target_id_fkey(first_name, last_name),
      requested_shift:shifts!swap_requests_requested_shift_id_fkey(*)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Get all swap requests in the company (manager only)
 * RLS Policy: managers can view all swap requests in their company
 */
export async function getCompanySwapRequests() {
  const { data, error } = await supabase
    .from('swap_requests')
    .select(`
      *,
      shift:shifts(*),
      requester:profiles!swap_requests_requester_id_fkey(first_name, last_name),
      target:profiles!swap_requests_target_id_fkey(first_name, last_name),
      requested_shift:shifts!swap_requests_requested_shift_id_fkey(*)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Get a specific swap request by ID
 * RLS Policy: employees can view swap requests they're involved in, managers can view all
 */
export async function getSwapRequestById(swapRequestId: string) {
  const { data, error } = await supabase
    .from('swap_requests')
    .select(`
      *,
      shift:shifts(*),
      requester:profiles!swap_requests_requester_id_fkey(first_name, last_name),
      target:profiles!swap_requests_target_id_fkey(first_name, last_name),
      requested_shift:shifts!swap_requests_requested_shift_id_fkey(*)
    `)
    .eq('id', swapRequestId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create a new swap request
 * RLS Policy: employees can create swap requests for their own shifts
 */
export async function createSwapRequest(request: {
  shift_id: string;
  requester_id: string;
  target_id: string | null;
  requested_shift_id: string | null;
  message?: string | null;
}) {
  const { data, error } = await supabase
    .from('swap_requests')
    .insert({
      ...request,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return data as SwapRequest;
}

/**
 * Update swap request status
 * RLS Policy: employees can update their own requests, managers can update any in their company
 */
export async function updateSwapRequestStatus(
  swapRequestId: string,
  status: 'pending' | 'approved' | 'rejected' | 'completed',
  reviewedBy?: string
) {
  const updates: {
    status: string;
    reviewed_by?: string;
    reviewed_at?: string;
  } = { status };

  if (reviewedBy) {
    updates.reviewed_by = reviewedBy;
    updates.reviewed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('swap_requests')
    .update(updates)
    .eq('id', swapRequestId)
    .select()
    .single();

  if (error) throw error;
  return data as SwapRequest;
}

/**
 * Cancel a swap request (requester only)
 * RLS Policy: employees can update their own swap requests
 */
export async function cancelSwapRequest(swapRequestId: string) {
  return updateSwapRequestStatus(swapRequestId, 'rejected');
}

/**
 * Approve a swap request (manager only)
 * RLS Policy: managers can update swap requests in their company
 */
export async function approveSwapRequest(swapRequestId: string, managerId: string) {
  return updateSwapRequestStatus(swapRequestId, 'approved', managerId);
}

/**
 * Reject a swap request (manager only)
 * RLS Policy: managers can update swap requests in their company
 */
export async function rejectSwapRequest(swapRequestId: string, managerId: string) {
  return updateSwapRequestStatus(swapRequestId, 'rejected', managerId);
}

/**
 * Delete a swap request
 * RLS Policy: No explicit delete policy exists. This function will fail unless a delete policy is added.
 * Recommendation: Add RLS policy or use status update ('cancelled') instead of delete.
 */
export async function deleteSwapRequest(swapRequestId: string) {
  const { error } = await supabase
    .from('swap_requests')
    .delete()
    .eq('id', swapRequestId);

  if (error) throw error;
}

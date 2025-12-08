/**
 * Database type definitions for ScaleFlow
 *
 * These types represent the database schema and provide type safety
 * for Supabase queries throughout the application.
 */

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'id'>;
        Update: Partial<Omit<Profile, 'id'>>;
      };
      companies: {
        Row: Company;
        Insert: Omit<Company, 'id' | 'created_at'>;
        Update: Partial<Omit<Company, 'id' | 'created_at'>>;
      };
      roles: {
        Row: Role;
        Insert: Omit<Role, 'id'>;
        Update: Partial<Omit<Role, 'id'>>;
      };
      shifts: {
        Row: Shift;
        Insert: Omit<Shift, 'id' | 'created_at'>;
        Update: Partial<Omit<Shift, 'id' | 'created_at'>>;
      };
      shift_templates: {
        Row: ShiftTemplate;
        Insert: Omit<ShiftTemplate, 'id' | 'created_at'>;
        Update: Partial<Omit<ShiftTemplate, 'id' | 'created_at'>>;
      };
      preferences: {
        Row: Preference;
        Insert: Omit<Preference, 'id' | 'created_at'>;
        Update: Partial<Omit<Preference, 'id' | 'created_at'>>;
      };
      swap_requests: {
        Row: SwapRequest;
        Insert: Omit<SwapRequest, 'id' | 'created_at'>;
        Update: Partial<Omit<SwapRequest, 'id' | 'created_at'>>;
      };
      workload_metrics: {
        Row: WorkloadMetric;
        Insert: Omit<WorkloadMetric, 'id' | 'created_at' | 'utilization_rate' | 'staffing_gap'>;
        Update: Partial<Omit<WorkloadMetric, 'id' | 'created_at' | 'utilization_rate' | 'staffing_gap'>>;
      };
      demand_forecasts: {
        Row: DemandForecast;
        Insert: Omit<DemandForecast, 'id' | 'created_at'>;
        Update: Partial<Omit<DemandForecast, 'id' | 'created_at'>>;
      };
      workload_templates: {
        Row: WorkloadTemplate;
        Insert: Omit<WorkloadTemplate, 'id' | 'created_at'>;
        Update: Partial<Omit<WorkloadTemplate, 'id' | 'created_at'>>;
      };
    };
  };
}

// Core entity types
export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  company_id: string | null;
  role_id: string;
  created_at?: string;
}

export interface Company {
  id: string;
  name: string;
  settings: CompanySettings | null;
  created_at: string;
}

export interface CompanySettings {
  timezone?: string;
  work_week?: string[];
  default_shift_duration?: number;
  [key: string]: unknown;
}

export interface Role {
  id: string;
  name: string;
  description: string | null;
}

export interface Shift {
  id: string;
  company_id: string;
  employee_id: string | null;
  role_id: string | null;
  start_time: string;
  end_time: string;
  notes: string | null;
  published: boolean;
  created_at: string;
  // Recurring shift fields
  is_recurring?: boolean;
  recurrence_rule?: string | null;
  recurrence_parent_id?: string | null;
  recurrence_exception_dates?: string[] | null;
}

export interface ShiftTemplate {
  id: string;
  company_id: string;
  name: string;
  role_id: string | null;
  duration_hours: number;
  default_start_time: string | null;
  notes: string | null;
  created_at: string;
}

export interface Preference {
  id: string;
  employee_id: string;
  company_id: string;
  preference_date: string;
  preference_type: 'available' | 'unavailable' | 'preferred';
  start_time: string | null;
  end_time: string | null;
  notes: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface SwapRequest {
  id: string;
  requester_id: string;
  shift_id: string;
  target_employee_id: string | null;
  status: 'pending' | 'approved' | 'rejected';
  notes: string | null;
  created_at: string;
}

export interface WorkloadMetric {
  id: string;
  company_id: string;
  date: string;
  department: string | null;
  planned_capacity_hours: number;
  scheduled_hours: number;
  actual_hours: number | null;
  required_staff_count: number;
  scheduled_staff_count: number;
  actual_staff_count: number | null;
  utilization_rate: number; // Auto-calculated
  staffing_gap: number; // Auto-calculated
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DemandForecast {
  id: string;
  company_id: string;
  forecast_date: string;
  department: string | null;
  predicted_demand_hours: number;
  predicted_staff_count: number;
  confidence_level: number;
  is_holiday: boolean;
  is_weekend: boolean;
  special_event: string | null;
  historical_average: number | null;
  expected_volume: number | null;
  expected_revenue: number | null;
  recommended_action: string | null;
  recommendation_priority: 'low' | 'medium' | 'high' | 'critical' | null;
  forecast_method: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface WorkloadTemplate {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  department: string | null;
  template_capacity_hours: number;
  template_staff_count: number;
  applies_to_days: string[];
  applies_to_months: number[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

// Recurrence rule types (based on iCalendar RFC 5545)
export type RecurrenceFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY';

export type WeekDay = 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA' | 'SU';

export interface RecurrenceRule {
  freq: RecurrenceFrequency;
  interval: number; // 1 = every period, 2 = every 2 periods, etc.
  byDay?: WeekDay[]; // For weekly: ['MO', 'WE', 'FR']
  until?: string; // End date (ISO 8601)
  count?: number; // Or number of occurrences
}

// Joined/extended types for queries with relations
export interface ProfileWithRole extends Profile {
  roles: { name: string } | null;
}

export interface ShiftWithDetails extends Shift {
  profiles: Profile | null;
  roles: Role | null;
}

export interface SwapRequestWithDetails extends SwapRequest {
  requester: Profile | null;
  target_employee: Profile | null;
  shift: Shift | null;
}

export interface PreferenceWithEmployee extends Preference {
  employee: Profile | null;
}

// Query result types
export type QueryResult<T> = {
  data: T | null;
  error: Error | null;
};

export type QueryResultArray<T> = {
  data: T[] | null;
  error: Error | null;
  count?: number;
};

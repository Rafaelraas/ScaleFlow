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

// Joined/extended types for queries with relations
export interface ProfileWithRole extends Profile {
  roles: Role | null;
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

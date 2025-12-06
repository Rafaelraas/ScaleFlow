import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client.ts";
import { showError } from "@/utils/toast";

export interface Role {
  id: string;
  name: string;
}

interface UseRolesOptions {
  excludeSystemAdmin?: boolean;
}

export function useRoles(options: UseRolesOptions = {}) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoles = async () => {
      setLoading(true);
      setError(null);

      let query = supabase.from('roles').select('id, name');

      if (options.excludeSystemAdmin) {
        query = query.neq('name', 'system_admin');
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        const errorMessage = "Failed to fetch roles: " + fetchError.message;
        setError(errorMessage);
        showError(errorMessage);
      } else {
        setRoles(data || []);
      }
      setLoading(false);
    };

    fetchRoles();
  }, [options.excludeSystemAdmin]);

  return { roles, loading, error };
}

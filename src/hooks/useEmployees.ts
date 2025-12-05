import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";

export interface Employee {
  id: string;
  first_name: string | null;
  last_name: string | null;
}

export function useEmployees(companyId?: string) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      if (!companyId) {
        setEmployees([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('company_id', companyId);

      if (fetchError) {
        const errorMessage = "Failed to fetch employees: " + fetchError.message;
        setError(errorMessage);
        showError(errorMessage);
      } else {
        setEmployees(data || []);
      }
      setLoading(false);
    };

    fetchEmployees();
  }, [companyId]);

  return { employees, loading, error };
}

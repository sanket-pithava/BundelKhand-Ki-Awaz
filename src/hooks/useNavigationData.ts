import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useNavigationData() {
  return useQuery({
    queryKey: ["navigation-data"],
    queryFn: async () => {
      const [districtsRes, categoriesRes, relationsRes] = await Promise.all([
        supabase.from("districts").select("*").eq("status", true).order("sort_order", { ascending: true }),
        supabase.from("categories").select("*").eq("status", true).order("sort_order", { ascending: true }),
        supabase.from("district_categories").select("*"),
      ]);

      if (districtsRes.error) throw districtsRes.error;
      if (categoriesRes.error) throw categoriesRes.error;
      if (relationsRes.error) throw relationsRes.error;

      return {
        districts: districtsRes.data,
        categories: categoriesRes.data,
        district_categories: relationsRes.data,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useNavigationData() {
  return useQuery({
    queryKey: ["navigation-data"],
    queryFn: async () => {
      const [districtsRes, categoriesRes, relationsRes, subDistrictsRes] =
        await Promise.all([
          supabase
            .from("districts")
            .select("*")
            .eq("status", true)
            .order("sort_order", { ascending: true }),
          supabase
            .from("categories")
            .select("*")
            .eq("status", true)
            .order("sort_order", { ascending: true }),
          supabase.from("district_categories").select("*"),
          supabase.from("sub_districts").select("*").eq("status", true),
        ]);

      if (districtsRes.error) throw districtsRes.error;
      if (categoriesRes.error) throw categoriesRes.error;
      if (relationsRes.error) throw relationsRes.error;
      if (subDistrictsRes.error) throw subDistrictsRes.error;

      return {
        districts: districtsRes.data,
        categories: categoriesRes.data,
        district_categories: relationsRes.data,
        sub_districts: subDistrictsRes.data,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

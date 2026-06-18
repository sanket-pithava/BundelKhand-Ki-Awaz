import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useArticles(districtSlug?: string, subDistrictSlug?: string, categorySlug?: string) {
  return useQuery({
    queryKey: ["articles", districtSlug, subDistrictSlug, categorySlug],
    queryFn: async () => {
      // Base select logic depending on what we are filtering
      let selectStr = "*";
      
      if (districtSlug && subDistrictSlug) {
        selectStr = "*, districts!inner(slug), sub_districts!inner(slug)";
      } else if (districtSlug) {
        selectStr = "*, districts!inner(slug)";
      }
      
      let query = supabase.from("articles").select(selectStr).eq("status", "published");

      if (categorySlug) {
        query = query.eq("category_slug", categorySlug);
      }

      if (districtSlug) {
        query = query.eq("districts.slug", districtSlug);
      }
      
      if (subDistrictSlug) {
        query = query.eq("sub_districts.slug", subDistrictSlug);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Sort in memory: newest-first
      return (data || []).sort((a: any, b: any) => {
        const dateA = new Date(a.publish_at || a.created_at || 0).getTime();
        const dateB = new Date(b.publish_at || b.created_at || 0).getTime();
        return dateB - dateA;
      });
    },
  });
}

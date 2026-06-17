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
      
      // Sort in memory: 1, 2, 3 at the top, 0 or null pushed to bottom (999999), then by date newest-first
      return (data || []).sort((a: any, b: any) => {
        const orderA = a.sort_order && a.sort_order > 0 ? a.sort_order : 999999;
        const orderB = b.sort_order && b.sort_order > 0 ? b.sort_order : 999999;
        if (orderA !== orderB) return orderA - orderB;
        
        const dateA = new Date(a.publish_at || a.created_at || 0).getTime();
        const dateB = new Date(b.publish_at || b.created_at || 0).getTime();
        return dateB - dateA;
      });
    },
  });
}

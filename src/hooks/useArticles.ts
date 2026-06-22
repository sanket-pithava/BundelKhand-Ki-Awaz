import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useArticles(
  districtSlug?: string,
  subDistrictSlug?: string,
  categorySlug?: string,
) {
  return useQuery({
    queryKey: ["articles", districtSlug, subDistrictSlug, categorySlug],
    queryFn: async () => {
      // Base select logic depending on what we are filtering
      let selectStr = "*";

      // We conditionally add inner joins if we need to filter by them.
      // Alternatively, we can just always include categories!inner(slug) if categorySlug is present.
      let joins = [];
      if (districtSlug) joins.push("districts!inner(slug)");
      if (subDistrictSlug) joins.push("sub_districts!inner(slug)");
      if (categorySlug) joins.push("categories!inner(slug)");

      if (joins.length > 0) {
        selectStr = "*, " + joins.join(", ");
      }

      let query = supabase
        .from("articles")
        .select(selectStr)
        .eq("status", "published");

      if (categorySlug) {
        query = query.eq("categories.slug", categorySlug);
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

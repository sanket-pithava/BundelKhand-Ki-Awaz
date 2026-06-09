import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useArticles(districtSlug?: string, categorySlug?: string) {
  return useQuery({
    queryKey: ["articles", districtSlug, categorySlug],
    queryFn: async () => {
      let query = supabase.from("articles").select("*").eq("is_published", true).order("sort_order", { ascending: true });

      if (categorySlug) {
        query = query.eq("category_slug", categorySlug);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

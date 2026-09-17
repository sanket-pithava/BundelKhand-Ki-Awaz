import { useQuery } from "@tanstack/react-query";
import { getArticlesFn } from "@/lib/queries";

export function useArticles(
  districtSlug?: string,
  subDistrictSlug?: string,
  categorySlug?: string,
) {
  return useQuery({
    queryKey: ["articles", districtSlug, subDistrictSlug, categorySlug],
    queryFn: async (): Promise<any[]> => {
      const data = await getArticlesFn({
        data: {
          districtSlug,
          subDistrictSlug,
          categorySlug,
        },
      });
      return (data || []) as any[];
    },
  });
}

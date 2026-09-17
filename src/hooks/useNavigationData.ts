import { useQuery } from "@tanstack/react-query";
import { getNavigationDataFn } from "@/lib/queries";

export function useNavigationData() {
  return useQuery({
    queryKey: ["navigation-data"],
    queryFn: async () => {
      return await getNavigationDataFn();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

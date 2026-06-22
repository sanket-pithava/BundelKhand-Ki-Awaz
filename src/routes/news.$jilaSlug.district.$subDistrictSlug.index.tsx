import { createFileRoute } from "@tanstack/react-router";
import { NewsListingPage } from "@/components/harbole/NewsListingPage";

export const Route = createFileRoute(
  "/news/$jilaSlug/district/$subDistrictSlug/",
)({
  component: () => {
    const { jilaSlug, subDistrictSlug } = Route.useParams();
    return (
      <NewsListingPage jilaSlug={jilaSlug} subDistrictSlug={subDistrictSlug} />
    );
  },
});

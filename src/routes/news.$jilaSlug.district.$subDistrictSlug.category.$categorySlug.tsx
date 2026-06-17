import { createFileRoute } from "@tanstack/react-router";
import { NewsListingPage } from "@/components/harbole/NewsListingPage";

export const Route = createFileRoute("/news/$jilaSlug/district/$subDistrictSlug/category/$categorySlug")({
  component: () => {
    const { jilaSlug, subDistrictSlug, categorySlug } = Route.useParams();
    return <NewsListingPage jilaSlug={jilaSlug} subDistrictSlug={subDistrictSlug} categorySlug={categorySlug} />;
  },
});

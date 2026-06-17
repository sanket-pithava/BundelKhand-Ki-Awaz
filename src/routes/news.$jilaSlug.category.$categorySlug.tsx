import { createFileRoute } from "@tanstack/react-router";
import { NewsListingPage } from "@/components/harbole/NewsListingPage";

export const Route = createFileRoute("/news/$jilaSlug/category/$categorySlug")({
  component: () => {
    const { jilaSlug, categorySlug } = Route.useParams();
    return <NewsListingPage jilaSlug={jilaSlug} categorySlug={categorySlug} />;
  },
});

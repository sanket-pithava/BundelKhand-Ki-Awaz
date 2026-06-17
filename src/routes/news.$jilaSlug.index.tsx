import { createFileRoute } from "@tanstack/react-router";
import { NewsListingPage } from "@/components/harbole/NewsListingPage";

export const Route = createFileRoute("/news/$jilaSlug/")({
  component: () => {
    const { jilaSlug } = Route.useParams();
    return <NewsListingPage jilaSlug={jilaSlug} />;
  },
});

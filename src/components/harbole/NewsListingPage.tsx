import { Link, useNavigate } from "@tanstack/react-router";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { ArticleCard } from "./ArticleCard";
import { useNavigationData } from "@/hooks/useNavigationData";
import { useArticles } from "@/hooks/useArticles";
import { X } from "lucide-react";
import { useMemo } from "react";

interface Props {
  jilaSlug?: string;
  subDistrictSlug?: string;
  categorySlug?: string;
}

export function NewsListingPage({
  jilaSlug,
  subDistrictSlug,
  categorySlug,
}: Props) {
  const { data: navData, isLoading: navLoading } = useNavigationData();
  const { data: articles, isLoading: articlesLoading } = useArticles(
    jilaSlug,
    subDistrictSlug,
    categorySlug,
  );
  const navigate = useNavigate();

  const selectedJila = navData?.districts?.find((d) => d.slug === jilaSlug);
  const selectedSubDistrict = navData?.sub_districts?.find(
    (sd) => sd.slug === subDistrictSlug,
  );
  const selectedCategory = navData?.categories?.find(
    (c) => c.slug === categorySlug,
  );

  const displaySubDistricts = useMemo(() => {
    if (!selectedJila || !navData?.sub_districts) return [];
    return navData.sub_districts.filter((sd) => sd.jila_id === selectedJila.id);
  }, [selectedJila, navData?.sub_districts]);

  const displayCategories = useMemo(() => {
    if (!navData?.categories) return [];
    if (!selectedJila) return navData.categories;
    const mappedCategoryIds = navData.district_categories
      .filter((dc) => dc.district_id === selectedJila.id)
      .map((dc) => dc.category_id);
    return navData.categories.filter((c) => mappedCategoryIds.includes(c.id));
  }, [selectedJila, navData]);

  const removeFilter = (type: "jila" | "subDistrict" | "category") => {
    let url = "";
    if (type === "jila") {
      url = categorySlug
        ? `/category/${encodeURIComponent(categorySlug)}`
        : "/";
    } else if (type === "subDistrict") {
      url = `/news/${encodeURIComponent(jilaSlug!)}`;
      if (categorySlug) url += `/category/${encodeURIComponent(categorySlug)}`;
    } else if (type === "category") {
      if (jilaSlug && subDistrictSlug)
        url = `/news/${encodeURIComponent(jilaSlug)}/district/${encodeURIComponent(subDistrictSlug)}`;
      else if (jilaSlug) url = `/news/${encodeURIComponent(jilaSlug)}`;
      else url = "/";
    }
    navigate({ to: url });
  };

  const getSubDistrictUrl = (sdSlug: string) => {
    let url = `/news/${encodeURIComponent(jilaSlug!)}/district/${encodeURIComponent(sdSlug)}`;
    if (categorySlug) url += `/category/${encodeURIComponent(categorySlug)}`;
    return url;
  };

  const getCategoryUrl = (cSlug: string) => {
    if (jilaSlug && subDistrictSlug)
      return `/news/${encodeURIComponent(jilaSlug)}/district/${encodeURIComponent(subDistrictSlug)}/category/${encodeURIComponent(cSlug)}`;
    if (jilaSlug)
      return `/news/${encodeURIComponent(jilaSlug)}/category/${encodeURIComponent(cSlug)}`;
    return `/category/${encodeURIComponent(cSlug)}`;
  };

  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-[480px] md:max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto bg-paper relative">
        <Header
          activeJilaSlug={jilaSlug}
          activeCategorySlug={categorySlug}
          activeSubDistrictSlug={subDistrictSlug}
        />
        <main className="flex flex-col md:flex-row pb-32 md:pb-16 min-h-[70vh]">
          {/* Left Sidebar */}
          <aside className="w-full md:w-64 lg:w-72 shrink-0 p-4 md:p-6 border-r border-navy/5">
            {/* Active Filters */}
            {(selectedJila || selectedCategory) && (
              <div className="mb-8">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-navy/40 mb-3">
                  Active Filters
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedJila && (
                    <button
                      onClick={() => removeFilter("jila")}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-navy text-paper text-xs font-semibold rounded-full hover:opacity-90"
                    >
                      {selectedJila.name} <X className="size-3" />
                    </button>
                  )}
                  {selectedSubDistrict && (
                    <button
                      onClick={() => removeFilter("subDistrict")}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-navy text-paper text-xs font-semibold rounded-full hover:opacity-90"
                    >
                      {selectedSubDistrict.name} <X className="size-3" />
                    </button>
                  )}
                  {selectedCategory && (
                    <button
                      onClick={() => removeFilter("category")}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-orange text-paper text-xs font-semibold rounded-full hover:opacity-90"
                    >
                      {selectedCategory.name} <X className="size-3" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Districts Filter (Sub-districts) */}
            {selectedJila && displaySubDistricts.length > 0 && (
              <div className="mb-8">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-navy/40 mb-3">
                  Districts
                </h3>
                <div className="flex flex-col gap-1.5">
                  {displaySubDistricts.map((sd) => (
                    <Link
                      key={sd.id}
                      to={getSubDistrictUrl(sd.slug)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${subDistrictSlug === sd.slug ? "bg-navy/10 text-navy font-semibold" : "text-navy/70 hover:bg-navy/5 hover:text-navy"}`}
                    >
                      {sd.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Categories Filter */}
            {displayCategories.length > 0 && (
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-navy/40 mb-3">
                  Categories
                </h3>
                <div className="flex flex-col gap-1.5">
                  {displayCategories.map((c) => (
                    <Link
                      key={c.id}
                      to={getCategoryUrl(c.slug)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${categorySlug === c.slug ? "bg-orange/10 text-orange font-semibold" : "text-navy/70 hover:bg-orange/5 hover:text-orange"}`}
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* Main Content */}
          <div className="flex-1 p-4 md:p-6 lg:p-8">
            <header className="mb-8 pb-6 border-b border-navy/10">
              <h1 className="font-hindi text-3xl md:text-5xl font-medium text-navy leading-none">
                {selectedCategory
                  ? selectedCategory.name
                  : selectedSubDistrict?.name || selectedJila?.name || "News"}
              </h1>
              {selectedJila && selectedCategory && (
                <p className="font-body-hindi text-navy/55 text-sm md:text-base mt-3">
                  {selectedSubDistrict
                    ? `${selectedSubDistrict.name}, ${selectedJila.name}`
                    : selectedJila.name}{" "}
                  की ताज़ा ख़बरें
                </p>
              )}
            </header>

            {articlesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse bg-navy/5 aspect-[4/3] rounded-2xl"
                  ></div>
                ))}
              </div>
            ) : articles?.length === 0 ? (
              <div className="text-center py-20 text-navy/50">
                <p className="text-lg font-medium">कोई ख़बर नहीं मिली</p>
                <p className="text-sm mt-1">कृपया अन्य फ़िल्टर चुनें</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {articles?.map((a) => (
                  <ArticleCard key={a.slug} article={a} />
                ))}
              </div>
            )}
          </div>
        </main>
        <BottomNav />
      </div>
    </div>
  );
}

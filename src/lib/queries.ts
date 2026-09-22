import { createServerFn } from "@tanstack/react-start";
import { getRelativeTimeHindi } from "@/lib/time";
import { extractYouTubeId, getYouTubeThumbnail } from "@/lib/youtubeUtils";

export type DynamicArticle = {
  id: string;
  title: string;
  slug: string;
  district: { name: string; slug: string } | null;
  category: { name: string; slug: string } | null;
  time: string;
  image: string;
  mobileImage?: string;
  authorName: string | null;
  excerpt: string | null;
};

export type HomepageSection = {
  id: string;
  title_hindi: string;
  title_english: string;
  category_id: string;
  category_slug: string;
  article_limit: number;
  articles: DynamicArticle[];
};

export const getNavigationDataFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const { getMongoDb } = await import("@/lib/db");
    const db = await getMongoDb();
    const [districts, categories, districtCategories, subDistricts] =
      await Promise.all([
        db
          .collection("districts")
          .find({ status: true })
          .sort({ sort_order: 1 })
          .toArray(),
        db
          .collection("categories")
          .find({ status: true })
          .sort({ sort_order: 1 })
          .toArray(),
        db.collection("district_categories").find({}).toArray(),
        db.collection("sub_districts").find({ status: true }).toArray(),
      ]);

    return {
      districts: districts.map((d) => ({
        id: (d.id || d._id?.toString() || "") as string,
        name: (d.name || "") as string,
        slug: (d.slug || "") as string,
        image_url: (d.image_url || null) as string | null,
        sort_order: (d.sort_order || 0) as number,
        status: !!d.status,
      })),
      categories: categories.map((c) => ({
        id: (c.id || c._id?.toString() || "") as string,
        name: (c.name || "") as string,
        slug: (c.slug || "") as string,
        icon: (c.icon || null) as string | null,
        sort_order: (c.sort_order || 0) as number,
        status: !!c.status,
      })),
      district_categories: districtCategories.map((dc) => ({
        id: (dc.id || dc._id?.toString() || "") as string,
        district_id: (dc.district_id || "") as string,
        category_id: (dc.category_id || "") as string,
      })),
      sub_districts: subDistricts.map((sd) => ({
        id: (sd.id || sd._id?.toString() || "") as string,
        name: (sd.name || "") as string,
        slug: (sd.slug || "") as string,
        jila_id: (sd.jila_id || "") as string,
        status: !!sd.status,
      })),
    };
  },
);

export const getHomepageDataFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const { getMongoDb } = await import("@/lib/db");
    const db = await getMongoDb();

    // 1. Fetch metadata
    const [
      sectionsRaw,
      adsRaw,
      shakhsiyatRaw,
      reelsRaw,
      showsRaw,
      categoriesList,
      districtsList,
    ] = await Promise.all([
      db
        .collection("homepage_sections")
        .find({ status: { $ne: false } })
        .sort({ sort_order: 1 })
        .toArray(),
      db
        .collection("ads")
        .find({ is_active: true, placement: "home" })
        .sort({ sort_order: 1 })
        .toArray(),
      db
        .collection("shakhsiyat")
        .find({ status: true })
        .sort({ sort_order: 1 })
        .toArray(),
      db
        .collection("reels")
        .find({ is_active: true })
        .sort({ sort_order: 1 })
        .toArray(),
      db
        .collection("show_episodes")
        .find({ status: true })
        .sort({ sort_order: 1 })
        .toArray(),
      db.collection("categories").find({}).toArray(),
      db.collection("districts").find({}).toArray(),
    ]);

    const catMap = new Map(
      categoriesList.map((c) => [c.id || c._id?.toString(), { name: c.name, slug: c.slug }]),
    );
    const distMap = new Map(
      districtsList.map((d) => [d.id || d._id?.toString(), { name: d.name, slug: d.slug }]),
    );

    const transformArticle = (r: any): DynamicArticle => {
      if (!r) return {} as DynamicArticle;
      const cat = r.category_id ? catMap.get(r.category_id) : null;
      const dist = r.district_id ? distMap.get(r.district_id) : null;

      return {
        id: (r.id || r._id?.toString() || "") as string,
        title: (r.title || "") as string,
        slug: (r.slug || "") as string,
        district: dist || (r.district ? { name: r.district.name, slug: r.district.slug } : null),
        category: cat || (r.category ? { name: r.category.name, slug: r.category.slug } : null),
        time: getRelativeTimeHindi(r.publish_at || r.created_at),
        image: (r.image_url || "") as string,
        mobileImage: (r.mobile_image_url || r.image_url || "") as string,
        authorName: (r.author || "हरबोले डेस्क") as string,
        excerpt: (r.excerpt || r.dek || "") as string,
      };
    };

    // 2. Fetch Placements
    const [heroPlacements, breakingPlacements, top10Placements] =
      await Promise.all([
        db
          .collection("homepage_hero")
          .find({})
          .sort({ sort_order: 1 })
          .toArray(),
        db
          .collection("homepage_breaking")
          .find({})
          .sort({ sort_order: 1 })
          .toArray(),
        db
          .collection("homepage_top10")
          .find({})
          .sort({ sort_order: 1 })
          .toArray(),
      ]);

    const allPlacementArticleIds = [
      ...heroPlacements.map((p) => p.article_id),
      ...breakingPlacements.map((p) => p.article_id),
      ...top10Placements.map((p) => p.article_id),
    ].filter(Boolean);

    const placementArticlesRaw = await db
      .collection("articles")
      .find({ id: { $in: allPlacementArticleIds } })
      .toArray();

    const placementArticleMap = new Map(
      placementArticlesRaw.map((a) => [a.id || a._id?.toString(), a]),
    );

    const heroArticles: DynamicArticle[] = heroPlacements
      .map((p) => transformArticle(placementArticleMap.get(p.article_id)))
      .filter((a) => a && a.id);

    const breakingNews: DynamicArticle[] = breakingPlacements
      .map((p) => transformArticle(placementArticleMap.get(p.article_id)))
      .filter((a) => a && a.id);

    const top10Articles: DynamicArticle[] = top10Placements
      .map((p) => transformArticle(placementArticleMap.get(p.article_id)))
      .filter((a) => a && a.id)
      .slice(0, 10);

    // 3. Impact Articles
    const impactRaw = await db
      .collection("articles")
      .find({ status: "published", is_impact: true })
      .sort({ publish_at: -1, created_at: -1 })
      .limit(10)
      .toArray();
    const impactArticles = impactRaw.map(transformArticle);

    // 4. Category sections
    const sectionCategoryIds = sectionsRaw
      .map((s) => s.category_id)
      .filter(Boolean);

    const targetCategoryNames = Array.from(
      new Set([
        ...sectionCategoryIds.map((id) => catMap.get(id)?.name).filter(Boolean),
        ...sectionCategoryIds.map((id) => catMap.get(id)?.name?.trim()).filter(Boolean),
        ...sectionsRaw.map((s) => s.title_hindi).filter(Boolean),
        ...sectionsRaw.map((s) => s.title_hindi?.trim()).filter(Boolean),
        ...sectionsRaw.map((s) => " " + s.title_hindi?.trim()).filter(Boolean),
      ]),
    );

    const targetCategorySlugs = sectionCategoryIds
      .map((id) => catMap.get(id)?.slug)
      .filter(Boolean)
      .flatMap((slug) => [
        slug as string,
        (slug as string).replace(/^#/, ""),
        "#" + (slug as string).replace(/^#/, ""),
      ]);

    const categoryArticlesRaw =
      sectionCategoryIds.length > 0 ||
      targetCategoryNames.length > 0 ||
      targetCategorySlugs.length > 0
        ? await db
            .collection("articles")
            .find({
              status: "published",
              $or: [
                { category_id: { $in: sectionCategoryIds } },
                { category: { $in: targetCategoryNames } },
                { category_slug: { $in: targetCategorySlugs } },
              ],
            })
            .sort({ publish_at: -1, created_at: -1 })
            .limit(500)
            .toArray()
        : [];

    const categorySections: HomepageSection[] = sectionsRaw
      .map((sec) => {
        const catInfo = catMap.get(sec.category_id);
        const cleanSlug = (catInfo?.slug || "").replace(/^#/, "");
        const secHindi = (sec.title_hindi || catInfo?.name || "").trim();
        const catName = (catInfo?.name || "").trim();
        const sectionArticles: DynamicArticle[] = [];

        for (const r of categoryArticlesRaw) {
          const rCat = (r.category || "").trim();
          const rSlug = (r.category_slug || "").replace(/^#/, "").trim();

          const matches =
            (sec.category_id && r.category_id === sec.category_id) ||
            (catName && rCat === catName) ||
            (cleanSlug && rSlug === cleanSlug) ||
            (secHindi && rCat === secHindi);

          if (matches) {
            sectionArticles.push(transformArticle(r));
            if (sectionArticles.length >= (sec.article_limit || 6)) break;
          }
        }

        return {
          id: (sec.id || sec._id?.toString() || "") as string,
          title_hindi: (sec.title_hindi || catInfo?.name || "") as string,
          title_english: (sec.title_english || "") as string,
          category_id: (sec.category_id || "") as string,
          category_slug: cleanSlug ? encodeURIComponent(cleanSlug) : "",
          article_limit: (sec.article_limit || 6) as number,
          articles: sectionArticles,
        };
      })
      .filter((sec) => sec.articles && sec.articles.length > 0);

    // 5. Ads
    const ads = adsRaw.map((ad: any) => ({
      id: (ad.id || ad._id?.toString() || "") as string,
      title: (ad.title || "") as string,
      subtitle: (ad.subtitle || null) as string | null,
      eyebrow: (ad.eyebrow || null) as string | null,
      cta: (ad.cta || null) as string | null,
      sponsor: (ad.sponsor || null) as string | null,
      variant: (ad.variant || "gold") as string,
      placement: (ad.placement || "home") as string,
      image: (ad.image_url || "") as string,
      mobile_image: (ad.mobile_image_url || "") as string,
      mobileImage: (ad.mobile_image_url || "") as string,
      website_url: (ad.website_url || ad.link_url || null) as string | null,
    }));

    // 6. Shakhsiyat
    const shakhsiyat = shakhsiyatRaw.map((p: any) => ({
      id: (p.id || p._id?.toString() || "") as string,
      name: (p.name || "") as string,
      slug: (p.slug || p.id || p._id?.toString() || "") as string,
      designation: (p.designation || "") as string,
      quote: (p.quote || "") as string,
      image: (p.image || "") as string,
      description: (p.description || "") as string,
    }));

    // 7. Reels
    const reels = reelsRaw.map((r: any) => {
      const ytId = extractYouTubeId(r.video_url);
      const autoThumb = getYouTubeThumbnail(ytId);
      return {
        id: (r.id || r._id?.toString() || "") as string,
        title: (r.title || "") as string,
        platform: (r.platform || "YouTube Shorts") as string,
        video_url: (r.video_url || "") as string,
        thumbnail: (r.image_url || autoThumb || "") as string,
        views: (r.views || "") as string,
        duration: (r.duration || "") as string,
      };
    });

    // 8. Episodes
    const episodes = showsRaw.map((e: any) => {
      const ytId = extractYouTubeId(e.youtube_url);
      const autoThumb = getYouTubeThumbnail(ytId);
      return {
        id: (e.id || e._id?.toString() || "") as string,
        title: (e.title || "") as string,
        subtitle: (e.subtitle || "") as string,
        season_number: (e.season_number || 1) as number,
        episode_number: (e.episode_number || null) as number | null,
        youtube_url: (e.youtube_url || "") as string,
        youtube_video_id: (ytId || e.youtube_video_id || "") as string,
        thumbnail: (e.image_url || autoThumb || "") as string,
        description: (e.description || "") as string,
        publish_at: (e.publish_at || e.created_at || "") as string,
        schedule: (e.schedule || "") as string,
        is_featured: !!e.is_featured,
      };
    });

    const featuredEpisode =
      episodes.find((e) => e.is_featured) || episodes[0] || null;
    const pastEpisodes = episodes.filter((e) => e.id !== featuredEpisode?.id);

    return {
      breakingNews,
      heroArticles,
      top10Articles,
      impactArticles,
      categorySections,
      ads,
      shakhsiyat,
      reels,
      featuredEpisode,
      pastEpisodes,
    };
  },
);

export const getArticlesFn = createServerFn({ method: "GET" })
  .validator(
    (params: {
      districtSlug?: string;
      subDistrictSlug?: string;
      categorySlug?: string;
    }) => params,
  )
  .handler(async ({ data: params }) => {
    const { getMongoDb } = await import("@/lib/db");
    const db = await getMongoDb();
    const query: any = { status: "published" };
    const andClauses: any[] = [];

    if (params.categorySlug) {
      const decodedCat = decodeURIComponent(params.categorySlug).trim();
      const cleanCat = decodedCat.replace(/^#/, "");
      const cat = await db.collection("categories").findOne({
        $or: [
          { slug: params.categorySlug },
          { slug: decodedCat },
          { slug: `#${cleanCat}` },
          { slug: cleanCat },
          { name: cleanCat },
          { name: decodedCat },
        ],
      });

      if (cat) {
        andClauses.push({
          $or: [
            { category_id: cat.id || cat._id?.toString() },
            { category: cat.name },
            { category_slug: cat.slug },
            { category_slug: cleanCat },
          ],
        });
      } else {
        andClauses.push({
          $or: [
            { category: cleanCat },
            { category: decodedCat },
            { category_slug: params.categorySlug },
            { category_slug: cleanCat },
          ],
        });
      }
    }

    if (params.districtSlug) {
      const decodedDist = decodeURIComponent(params.districtSlug).trim();
      const cleanDist = decodedDist.replace(/^#/, "");
      const dist = await db.collection("districts").findOne({
        $or: [
          { slug: params.districtSlug },
          { slug: decodedDist },
          { slug: `#${cleanDist}` },
          { slug: cleanDist },
          { name: cleanDist },
          { name: decodedDist },
        ],
      });

      if (dist) {
        andClauses.push({
          $or: [
            { district_id: dist.id || dist._id?.toString() },
            { district: dist.name },
            { "district.name": dist.name },
            { district_slug: dist.slug },
            { district_slug: cleanDist },
          ],
        });
      } else {
        andClauses.push({
          $or: [
            { district: cleanDist },
            { district: decodedDist },
            { district_slug: params.districtSlug },
            { district_slug: cleanDist },
          ],
        });
      }
    }

    if (params.subDistrictSlug) {
      const decodedSub = decodeURIComponent(params.subDistrictSlug).trim();
      const cleanSub = decodedSub.replace(/^#/, "");
      const subDist = await db.collection("sub_districts").findOne({
        $or: [
          { slug: params.subDistrictSlug },
          { slug: decodedSub },
          { slug: `#${cleanSub}` },
          { slug: cleanSub },
          { name: cleanSub },
          { name: decodedSub },
        ],
      });

      if (subDist) {
        andClauses.push({
          $or: [
            { sub_district_id: subDist.id || subDist._id?.toString() },
            { sub_district: subDist.name },
            { "sub_district.name": subDist.name },
          ],
        });
      }
    }

    if (andClauses.length > 0) {
      query.$and = andClauses;
    }

    const [articles, categoriesList, districtsList] = await Promise.all([
      db
        .collection("articles")
        .find(query)
        .sort({ publish_at: -1, created_at: -1 })
        .limit(100)
        .toArray(),
      db.collection("categories").find({}).toArray(),
      db.collection("districts").find({}).toArray(),
    ]);

    const catMap = new Map(
      categoriesList.map((c) => [c.id || c._id?.toString(), { name: c.name, slug: c.slug }]),
    );
    const distMap = new Map(
      districtsList.map((d) => [d.id || d._id?.toString(), { name: d.name, slug: d.slug }]),
    );

    return articles.map((a) => {
      const cat = a.category_id ? catMap.get(a.category_id) : null;
      const dist = a.district_id ? distMap.get(a.district_id) : null;

      return {
        id: (a.id || a._id?.toString() || "") as string,
        title: (a.title || "") as string,
        slug: (a.slug || "") as string,
        dek: (a.dek || null) as string | null,
        excerpt: (a.excerpt || null) as string | null,
        body: (a.body || "") as string,
        image_url: (a.image_url || null) as string | null,
        mobile_image_url: (a.mobile_image_url || null) as string | null,
        author: (a.author || null) as string | null,
        status: (a.status || "published") as string,
        publish_at: (a.publish_at || null) as string | null,
        created_at: (a.created_at || "") as string,
        time: getRelativeTimeHindi(a.publish_at || a.created_at),
        categories: cat || { name: (a.category || "ख़बर") as string, slug: (a.category_slug || "") as string },
        category: cat || { name: (a.category || "ख़बर") as string, slug: (a.category_slug || "") as string },
        districts: dist || null,
      };
    });
  });

export const getArticleBySlugFn = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const { getMongoDb } = await import("@/lib/db");
    const db = await getMongoDb();
    const article = await db.collection("articles").findOne({
      $or: [{ slug }, { id: slug }],
    } as any);

    if (!article) return null;

    const [category, reporter, relatedArticlesRaw, prevArticle, nextArticle] =
      await Promise.all([
        article.category_id
          ? db
              .collection("categories")
              .findOne({ id: article.category_id } as any)
          : null,
        article.reporter_id
          ? db
              .collection("reporters")
              .findOne({ id: article.reporter_id } as any)
          : null,
        article.category_id
          ? db
              .collection("articles")
              .find({
                category_id: article.category_id,
                slug: { $ne: article.slug },
                status: "published",
              })
              .sort({ publish_at: -1, created_at: -1 })
              .limit(3)
              .toArray()
          : Promise.resolve([]),
        db
          .collection("articles")
          .find({
            created_at: { $lt: article.created_at },
            status: "published",
          })
          .sort({ created_at: -1 })
          .limit(1)
          .toArray()
          .then((res) => res[0] || null),
        db
          .collection("articles")
          .find({
            created_at: { $gt: article.created_at },
            status: "published",
          })
          .sort({ created_at: 1 })
          .limit(1)
          .toArray()
          .then((res) => res[0] || null),
      ]);

    const formattedArticle = {
      title: (article.title || "") as string,
      category: (category?.name || article.category_slug || article.category || "ख़बर") as string,
      slug: (article.slug || "") as string,
      time: (article.time_label || getRelativeTimeHindi(article.publish_at || article.created_at) || "Recently") as string,
      image: (article.image_url || "") as string,
      mobileImage: (article.mobile_image_url || "") as string,
      dek: (article.dek || article.excerpt || "") as string,
      content: (article.body || article.content || "") as string,
      author: (article.author || "हरबोले डेस्क") as string,
      reporterProfile: reporter
        ? {
            id: (reporter.id || reporter._id?.toString() || "") as string,
            name: (reporter.name || "") as string,
            email: (reporter.email || "") as string,
            mobile_number: (reporter.mobile_number || null) as string | null,
            aadhaar_number: (reporter.aadhaar_number || null) as string | null,
            pan_number: (reporter.pan_number || null) as string | null,
            youtube_link: (reporter.youtube_link || null) as string | null,
            linkedin_link: (reporter.linkedin_link || null) as string | null,
            instagram_link: (reporter.instagram_link || null) as string | null,
            profile_image: (reporter.profile_image || null) as string | null,
            status: !!reporter.status,
            created_at: (reporter.created_at || "") as string,
          }
        : null,
    };

    const relatedArticles = relatedArticlesRaw.map((a) => ({
      title: (a.title || "") as string,
      slug: (a.slug || "") as string,
      image: (a.image_url || "") as string,
      category: (category?.name || "ख़बर") as string,
    }));

    return {
      article: formattedArticle,
      relatedArticles,
      prevArticle: prevArticle ? { title: (prevArticle.title || "") as string, slug: (prevArticle.slug || "") as string } : null,
      nextArticle: nextArticle ? { title: (nextArticle.title || "") as string, slug: (nextArticle.slug || "") as string } : null,
    };
  });

export const getSakshiyatBySlugFn = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const { getMongoDb } = await import("@/lib/db");
    const db = await getMongoDb();
    const profile = await db.collection("shakhsiyat").findOne({
      $or: [{ slug }, { id: slug }],
      status: true,
    } as any);

    if (!profile) return null;

    const otherProfiles = await db
      .collection("shakhsiyat")
      .find({
        status: true,
        id: { $ne: profile.id },
      })
      .limit(3)
      .toArray();

    return {
      profile: {
        id: (profile.id || profile._id?.toString() || "") as string,
        name: (profile.name || "") as string,
        slug: (profile.slug || profile.id || "") as string,
        designation: (profile.designation || "") as string,
        quote: (profile.quote || "") as string,
        image: (profile.image || "") as string,
        description: (profile.description || "") as string,
      },
      otherProfiles: otherProfiles.map((p) => ({
        name: (p.name || "") as string,
        slug: (p.slug || p.id || "") as string,
        image: (p.image || "") as string,
        designation: (p.designation || "") as string,
      })),
    };
  });

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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

export type DynamicAd = {
  id: string;
  title: string;
  subtitle: string | null;
  eyebrow: string | null;
  cta: string | null;
  sponsor: string | null;
  variant: string;
  placement: string;
  image: string;
};

export type DynamicShakhsiyat = {
  id: string;
  name: string;
  designation: string;
  quote: string;
  image: string;
};

export type DynamicReel = {
  id: string;
  title: string;
  platform: string;
  video_url: string;
  thumbnail: string;
  views: string;
  duration: string;
};

export type DynamicEpisode = {
  id: string;
  title: string;
  subtitle: string;
  season_number: number;
  episode_number: number | null;
  youtube_url: string;
  youtube_video_id: string | null;
  thumbnail: string;
  description: string;
  publish_at: string;
  schedule: string;
  is_featured: boolean;
};

export function useHomepageData() {
  return useQuery({
    queryKey: ["homepage-data"],
    queryFn: async () => {
      // 1. Fetch dynamic sections metadata and active Ads, Shakhsiyat, Reels, Shows
      const sectionsPromise = supabase
        .from("homepage_sections")
        .select("*, category:categories(slug)")
        .eq("status", true)
        .order("sort_order", { ascending: true });

      const adsPromise = supabase
        .from("ads")
        .select("*")
        .eq("is_active", true)
        .eq("placement", "home")
        .order("sort_order", { ascending: true });

      const shakhsiyatPromise = supabase
        .from("shakhsiyat")
        .select("*")
        .eq("status", true)
        .order("sort_order", { ascending: true });

      const reelsPromise = supabase
        .from("reels")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      const showsPromise = supabase
        .from("show_episodes")
        .select("*")
        .eq("status", true)
        .order("sort_order", { ascending: true });

      const [sectionsRes, adsRawRes, shakhsiyatRes, reelsRes, showsRes] = await Promise.all([
        sectionsPromise,
        adsPromise,
        shakhsiyatPromise,
        reelsPromise,
        showsPromise,
      ]);

      if (sectionsRes.error) throw sectionsRes.error;
      const sections = sectionsRes.data || [];
      const categoryIds = sections.map((s) => s.category_id).filter(Boolean) as string[];

      // 2. Fetch Placements and Categories
      const articleSelectQuery = `
        id, title, slug, image_url, publish_at, created_at, excerpt, category_id, sort_order,
        district:districts(name, slug),
        category:categories(name, slug)
      `;

      const heroPromise = supabase
        .from("homepage_hero")
        .select(`article:articles(${articleSelectQuery})`)
        .order("sort_order", { ascending: true });

      const breakingPromise = supabase
        .from("homepage_breaking")
        .select(`article:articles(${articleSelectQuery})`)
        .order("sort_order", { ascending: true });

      const top10Promise = supabase
        .from("homepage_top10")
        .select(`article:articles(${articleSelectQuery})`)
        .order("sort_order", { ascending: true });

      const impactPromise = supabase
        .from("articles")
        .select(articleSelectQuery)
        .eq("status", "published")
        .eq("is_impact", true)
        .order("publish_at", { ascending: false });

      const categoryPromise = categoryIds.length > 0
        ? supabase
          .from("articles")
          .select(articleSelectQuery)
          .eq("status", "published")
          .in("category_id", categoryIds)
          .order("publish_at", { ascending: false })
          .limit(100)
        : Promise.resolve({ data: [], error: null });

      const [heroRes, breakingRes, top10Res, impactRes, catRes] = await Promise.all([
        heroPromise,
        breakingPromise,
        top10Promise,
        impactPromise,
        categoryPromise,
      ]);

      if (heroRes.error) console.error("Hero Error:", heroRes.error);
      if (breakingRes.error) console.error("Breaking Error:", breakingRes.error);
      if (top10Res.error) console.error("Top10 Error:", top10Res.error);
      if (impactRes.error) console.error("Impact Error:", impactRes.error);
      if (catRes.error) throw catRes.error;

      // Transform helper
      const transform = (row: any): DynamicArticle => {
        if (!row) return {} as DynamicArticle;
        return {
          id: row.id,
          title: row.title,
          slug: row.slug,
          district: Array.isArray(row.district) ? row.district[0] : row.district,
          category: Array.isArray(row.category) ? row.category[0] : row.category,
          time: getRelativeTimeHindi(row.publish_at || row.created_at),
          image: row.image_url || "",
          authorName: "हरबोले डेस्क",
          excerpt: row.excerpt,
        } as DynamicArticle;
      };

      // 3. Map Placements
      const heroArticles: DynamicArticle[] = (heroRes.data || [])
        .map((r) => transform(r.article))
        .filter((a) => a && a.id);

      const breakingNews: DynamicArticle[] = (breakingRes.data || [])
        .map((r) => transform(r.article))
        .filter((a) => a && a.id);

      const top10Articles: DynamicArticle[] = (top10Res.data || [])
        .map((r) => transform(r.article))
        .filter((a) => a && a.id)
        .slice(0, 10);

      const impactArticles: DynamicArticle[] = (impactRes.data || [])
        .map((r) => transform(r));

      // 4. Bucket Category Sections
      const rawCat = catRes.data || [];
      
      // Sort rawCat to respect sort_order (1, 2, 3) over default 0
      rawCat.sort((a: any, b: any) => {
        const orderA = a.sort_order && a.sort_order > 0 ? a.sort_order : 999999;
        const orderB = b.sort_order && b.sort_order > 0 ? b.sort_order : 999999;
        if (orderA !== orderB) return orderA - orderB;
        
        const dateA = new Date(a.publish_at || a.created_at || 0).getTime();
        const dateB = new Date(b.publish_at || b.created_at || 0).getTime();
        return dateB - dateA;
      });

      const mappedSections: HomepageSection[] = sections.map((sec) => {
        const catSlug = Array.isArray(sec.category) ? sec.category[0]?.slug : (sec.category as any)?.slug;
        const sectionArticles: DynamicArticle[] = [];

        // Distribute articles into this section directly (no exclusions)
        for (const r of rawCat) {
          if (r.category_id === sec.category_id) {
            sectionArticles.push(transform(r));
            if (sectionArticles.length >= sec.article_limit) break;
          }
        }

        return {
          id: sec.id,
          title_hindi: sec.title_hindi,
          title_english: sec.title_english,
          category_id: sec.category_id!,
          category_slug: catSlug || "",
          article_limit: sec.article_limit,
          articles: sectionArticles,
        };
      });

      // 5. Map Ads
      const activeAds: DynamicAd[] = (adsRawRes.data || []).map((ad) => ({
        id: ad.id,
        title: ad.title,
        subtitle: ad.subtitle,
        eyebrow: ad.eyebrow,
        cta: ad.cta,
        sponsor: ad.sponsor,
        variant: ad.variant || "gold",
        placement: ad.placement,
        image: ad.image_url || "",
      }));

      // 6. Map Widgets (Shakhsiyat, Reels, Shows)
      const shakhsiyat: DynamicShakhsiyat[] = (shakhsiyatRes.data || []).map((p) => ({
        id: p.id,
        name: p.name,
        designation: p.designation,
        quote: p.quote,
        image: p.image,
      }));

      const reels: DynamicReel[] = (reelsRes.data || []).map((r) => {
        const ytId = extractYouTubeId(r.video_url);
        const autoThumb = getYouTubeThumbnail(ytId);
        return {
          id: r.id,
          title: r.title,
          platform: r.platform || "YouTube Shorts",
          video_url: r.video_url || "",
          thumbnail: r.image_url || autoThumb || "",
          views: r.views || "",
          duration: r.duration || "",
        };
      });

      const episodesRaw = showsRes.data || [];
      const episodes: DynamicEpisode[] = episodesRaw.map((e) => {
        const ytId = extractYouTubeId(e.youtube_url);
        const autoThumb = getYouTubeThumbnail(ytId);
        return {
          id: e.id,
          title: e.title,
          subtitle: e.subtitle || "",
          season_number: e.season_number || 1,
          episode_number: e.episode_number,
          youtube_url: e.youtube_url || "",
          youtube_video_id: ytId || e.youtube_video_id,
          thumbnail: e.image_url || autoThumb || "",
          description: e.description || "",
          publish_at: e.publish_at || e.created_at,
          schedule: e.schedule || "",
          is_featured: e.is_featured,
        };
      });

      const featuredEpisode = episodes.find((e) => e.is_featured) || episodes[0] || null;
      const pastEpisodes = episodes.filter((e) => e.id !== featuredEpisode?.id);

      return {
        breakingNews,
        heroArticles,
        top10Articles,
        impactArticles,
        categorySections: mappedSections,
        ads: activeAds,
        shakhsiyat,
        reels,
        featuredEpisode,
        pastEpisodes,
      };
    },
    staleTime: 1000 * 60, // 1 minute
  });
}

import { useQuery } from "@tanstack/react-query";
import { getHomepageDataFn } from "@/lib/queries";

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
  mobile_image?: string;
  website_url?: string | null;
};

export type DynamicShakhsiyat = {
  id: string;
  name: string;
  slug?: string;
  designation: string;
  quote: string;
  image: string;
  description?: string;
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
      return await getHomepageDataFn();
    },
    staleTime: 1000 * 60, // 1 minute
  });
}

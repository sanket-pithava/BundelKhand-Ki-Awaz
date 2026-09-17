import { ArrowUpRight } from "lucide-react";

type Props = {
  variant?: string;
  eyebrow?: string | null;
  title?: string;
  subtitle?: string | null;
  cta?: string | null;
  sponsor?: string | null;
  image?: string | null;
  mobileImage?: string | null;
  website_url?: string | null;
};

export function AdBanner({
  title = "Advertisement",
  cta = "Read More",
  image,
  mobileImage,
  website_url,
}: Props) {
  const targetUrl = website_url
    ? website_url.startsWith("http://") || website_url.startsWith("https://")
      ? website_url
      : `https://${website_url}`
    : null;

  const bannerImg = image || mobileImage;

  if (!bannerImg) return null;

  return (
    <section className="px-3 sm:px-4 py-2 sm:py-4">
      <div className="relative w-full rounded-2xl overflow-hidden shadow-elevated bg-navy/5 group">
        {targetUrl ? (
          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block relative w-full overflow-hidden"
            title={title}
          >
            <picture className="w-full flex">
              {mobileImage && (
                <source media="(max-width: 767px)" srcSet={mobileImage} />
              )}
              <img
                src={bannerImg}
                alt={title}
                loading="lazy"
                className="w-full h-auto object-contain block transition-transform duration-500 group-hover:scale-[1.01]"
              />
            </picture>

            {/* Read More button in bottom-right corner */}
            <div className="absolute bottom-2.5 right-2.5 sm:bottom-4 sm:right-4 z-10">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider bg-navy/90 hover:bg-navy text-paper backdrop-blur-md shadow-lg transition-transform group-hover:scale-105">
                {cta || "Read More"} <ArrowUpRight className="size-3.5" />
              </span>
            </div>
          </a>
        ) : (
          <div className="relative w-full overflow-hidden">
            <picture className="w-full flex">
              {mobileImage && (
                <source media="(max-width: 767px)" srcSet={mobileImage} />
              )}
              <img
                src={bannerImg}
                alt={title}
                loading="lazy"
                className="w-full h-auto object-contain block"
              />
            </picture>
          </div>
        )}
      </div>
    </section>
  );
}

import heroField from "@/assets/hero-field.jpg";
import storyWoman from "@/assets/story-woman.jpg";
import jhansiFort from "@/assets/jhansi-fort.jpg";
import amitTripathi from "@/assets/amit-tripathi.jpg";
import reelDancer from "@/assets/reel-dancer.jpg";
import reelFarmer from "@/assets/reel-farmer.jpg";
import reelTemple from "@/assets/reel-temple.jpg";
import showInterview from "@/assets/show-interview.jpg";
import villageAerial from "@/assets/village-aerial.jpg";
import sportsCricket from "@/assets/sports-cricket.jpg";
import cultureTemple from "@/assets/culture-temple.jpg";
import politicsRally from "@/assets/politics-rally.jpg";

export const IMAGES = {
  heroField,
  storyWoman,
  jhansiFort,
  amitTripathi,
  reelDancer,
  reelFarmer,
  reelTemple,
  showInterview,
  villageAerial,
  sportsCricket,
  cultureTemple,
  politicsRally,
};

export const DISTRICTS = [
  "महोबा",
  "झांसी",
  "छतरपुर",
  "टीकमगढ़",
  "सागर",
  "पन्ना",
  "बांदा",
  "ललितपुर",
];

export type Article = {
  slug: string;
  title: string;
  dek?: string;
  category: string;
  time: string;
  image: string;
  author?: string;
};

export const HERO: Article = {
  slug: "bundelkhand-kisan-pahal",
  title: "बुंदेलखंड में किसानों की नई पहल: सूखे खेतों में उगी उम्मीद की फसल",
  dek: "महोबा के वीरपुर गांव में जल संचयन की पारंपरिक तकनीक ने बदली तक़दीर।",
  category: "Impact",
  time: "12 मिनट पहले",
  image: IMAGES.heroField,
  author: "अमित त्रिपाठी",
};

export const TOP10: Article[] = [
  {
    slug: "ken-betwa",
    title: "केन-बेतवा लिंक परियोजना: क्या बदलेगी तस्वीर?",
    category: "Politics",
    time: "2h",
    image: IMAGES.politicsRally,
  },
  {
    slug: "jhansi-light",
    title: "झांसी किले में लाइट एंड साउंड शो का नया स्वरूप",
    category: "Tourism",
    time: "4h",
    image: IMAGES.jhansiFort,
  },
  {
    slug: "khajuraho-puja",
    title: "खजुराहो के मंदिरों में बदली पूजा की पद्धति",
    category: "Religion",
    time: "5h",
    image: IMAGES.cultureTemple,
  },
  {
    slug: "village-cricket",
    title: "गांव से निकला बल्लेबाज़, अब रणजी में मचा रहा धूम",
    category: "Sports",
    time: "6h",
    image: IMAGES.sportsCricket,
  },
  {
    slug: "mahoba-jal",
    title: "महोबा की 'जल-सहेलियां' जिन्होंने बदला गांव",
    category: "Impact",
    time: "8h",
    image: IMAGES.storyWoman,
  },
  {
    slug: "village-aerial",
    title: "बुंदेलखंड के गांवों की बदलती तस्वीर: एक हवाई दस्तावेज़",
    category: "Villages",
    time: "10h",
    image: IMAGES.villageAerial,
  },
];

export const POLITICS: Article[] = [
  {
    slug: "bundeli-chunav",
    title: "बुंदेली चुनाव: इस बार बुनियादी मुद्दों पर ज़ोर",
    category: "Politics",
    time: "1h",
    image: IMAGES.politicsRally,
  },
  {
    slug: "ken-betwa-2",
    title: "जल विवाद की राजनीति: किसके हाथ क्या लगा?",
    category: "Politics",
    time: "3h",
    image: IMAGES.heroField,
  },
];

export const SPORTS: Article[] = [
  {
    slug: "ranji-bundeli",
    title: "रणजी ट्रॉफी: बुंदेलखंड के खिलाड़ी की ऐतिहासिक पारी",
    category: "Sports",
    time: "2h",
    image: IMAGES.sportsCricket,
  },
  {
    slug: "kabaddi-gaon",
    title: "गांव की कबड्डी लीग बनी राष्ट्रीय आकर्षण",
    category: "Sports",
    time: "5h",
    image: IMAGES.villageAerial,
  },
];

export const CULTURE: Article[] = [
  {
    slug: "orchha-aarti",
    title: "ओरछा के मंदिरों में दिवाली जैसा नज़ारा",
    category: "Religion",
    time: "4h",
    image: IMAGES.reelTemple,
  },
  {
    slug: "khajuraho-shilpa",
    title: "खजुराहो की शिल्पकला: पत्थरों में रची कविता",
    category: "Culture",
    time: "1d",
    image: IMAGES.cultureTemple,
  },
];

export const IMPACT: Article[] = [
  {
    slug: "jal-saheliyan",
    title: "बुंदेलखंड की जल-सहेलियां: सूखे कुओं में फिर से जान",
    category: "Impact",
    time: "6h",
    image: IMAGES.storyWoman,
    author: "नीलिमा सिंह",
  },
  {
    slug: "school-revival",
    title: "टीकमगढ़ का वो स्कूल जिसने बदल दी 200 ज़िंदगियाँ",
    category: "Impact",
    time: "1d",
    image: IMAGES.villageAerial,
  },
];

export const BUNDELI: Article[] = [
  {
    slug: "rai-nritya",
    title: "बुन्देली राय नृत्य: मिट्टी की लय, परंपरा की धुन",
    category: "Bundeli",
    time: "8h",
    image: IMAGES.reelDancer,
  },
  {
    slug: "alha-udal",
    title: "आल्हा-ऊदल की वो दास्तानें जो आज भी ज़िंदा हैं",
    category: "Bundeli",
    time: "2d",
    image: IMAGES.cultureTemple,
  },
];

export const VILLAGES: Article[] = [
  {
    slug: "veerpur-gaon",
    title: "वीरपुर गांव: जहाँ हर घर के पीछे एक कहानी है",
    category: "Villages",
    time: "1d",
    image: IMAGES.villageAerial,
  },
  {
    slug: "chaupal-charcha",
    title: "चौपाल चर्चा: गांव की राजनीति, गांव के सवाल",
    category: "Villages",
    time: "1d",
    image: IMAGES.reelFarmer,
  },
];

export const SPOTLIGHT: Article = {
  slug: "personality-amit",
  title: "अमित त्रिपाठी: बुंदेलखंड की आवाज़ बनने की कहानी",
  dek: "एक छोटे से कस्बे से निकलकर देश के सबसे भरोसेमंद चेहरों में शुमार होने तक का सफ़र।",
  category: "Personality",
  time: "Spotlight",
  image: IMAGES.amitTripathi,
};

export const REELS = [
  {
    id: "r1",
    title: "बुन्देली राय नृत्य",
    image: IMAGES.reelDancer,
    views: "1.2M",
  },
  { id: "r2", title: "गांव की चौपाल", image: IMAGES.reelFarmer, views: "850K" },
  { id: "r3", title: "आरती के रंग", image: IMAGES.reelTemple, views: "640K" },
  { id: "r4", title: "खेत से मंडी तक", image: IMAGES.heroField, views: "420K" },
];

export const SHOW = {
  title: "बुंदेलखंड का विकास: हकीकत या सिर्फ चुनावी वादे?",
  schedule: "आज रात 9 बजे — एक विशेष चर्चा",
  image: IMAGES.showInterview,
};

export const ALL_ARTICLES: Record<string, Article> = Object.fromEntries(
  [
    HERO,
    SPOTLIGHT,
    ...TOP10,
    ...POLITICS,
    ...SPORTS,
    ...CULTURE,
    ...IMPACT,
    ...BUNDELI,
    ...VILLAGES,
  ].map((a) => [a.slug, a]),
);

export const CATEGORIES = [
  { slug: "politics", label: "राजनीति", english: "Politics", items: POLITICS },
  { slug: "sports", label: "खेल", english: "Sports", items: SPORTS },
  {
    slug: "religion",
    label: "धर्म व संस्कृति",
    english: "Religion & Culture",
    items: CULTURE,
  },
  {
    slug: "impact",
    label: "सामाजिक प्रभाव",
    english: "Social Impact",
    items: IMPACT,
  },
  {
    slug: "bundeli",
    label: "बुंदेली संस्कृति",
    english: "Bundeli Culture",
    items: BUNDELI,
  },
  {
    slug: "villages",
    label: "गांव की कहानियाँ",
    english: "Village Stories",
    items: VILLAGES,
  },
];

export type SeoBlock = {
  title: string;
  description: string;
};

export type CategorySeo = SeoBlock & {
  metaTitle: string;
  metaDescription: string;
};

export type SubProduct = {
  id: string;
  label: string;
};

export type SocialLink = {
  platform: string;
  icon: string;
  url: string;
  handle: string;
  enabled: boolean;
};

export type GeneralSettings = {
  phone: string;
  email: string;
  whatsapp: string;
  location: string;
  mapEmbed: string;
  socialLinks: SocialLink[];
};

export type ServiceCharge = {
  label: string;
  amount: string;
  enabled: boolean;
  description: string;
};

export type BlogPost = {
  id: number;
  title: string;
  date: string;
  author: string;
  excerpt: string;
  content: string;
  image: string;
  link: string;
};

export type HeroSlide = {
  badge: string;
  title: string;
  description: string;
};

export type ProductsIntro = {
  label: string;
  title: string;
  subtitle: string;
  heroBackground: string;
};

export type ServicesIntro = {
  label: string;
  title: string;
  subtitle: string;
};

export type AboutIntro = {
  label: string;
  title: string;
  paragraphOne: string;
  paragraphTwo: string;
  visionTitle: string;
  visionText: string;
  missionTitle: string;
  missionText: string;
};

export type ContactIntro = {
  label: string;
  title: string;
  subtitle: string;
};

export type Product = {
  id: number;
  slug?: string;
  name: string;
  cat: string;
  catLabel: string;
  subCat: string;
  shortDesc: string;
  desc: string;
  seoTitle: string;
  seoDescription: string;
  specs: string[][];
  features: string[];
  imgs: string[];
};

export type StatItem = {
  value: string;
  label: string;
};

export type WhyChooseItem = {
  icon: string;
  title: string;
  text: string;
};

export type Testimonial = {
  stars: string;
  quote: string;
  initials: string;
  name: string;
  role: string;
};

export type CtaContent = {
  title: string;
  subtitle: string;
};

export type FooterContent = {
  blurb: string;
  hours: string;
  businessHoursDetail: string;
  copyright: string;
};

export type SiteData = {
  siteMeta: {
    title: string;
    description: string;
    keywords: string;
    ogTitle: string;
    ogDescription: string;
  };
  sectionSeo: Record<string, SeoBlock>;
  categorySeo: Record<string, CategorySeo>;
  subProducts: Record<string, SubProduct[]>;
  generalSettings: GeneralSettings;
  serviceCharges: Record<string, ServiceCharge>;
  blogs: BlogPost[];
  sections: {
    heroSlides: HeroSlide[];
    productsIntro: ProductsIntro;
    servicesIntro: ServicesIntro;
    aboutIntro: AboutIntro;
    contactIntro: ContactIntro;
  };
  products: Product[];
  inquiries: unknown[];
  stats: StatItem[];
  whyChoose: WhyChooseItem[];
  testimonials: Testimonial[];
  cta: CtaContent;
  footer: FooterContent;
  aboutImages: string[];
  heroBackgrounds: string[];
};

export type ProductCategoryId = "tv-mounts" | "guards" | "solar" | "cables";

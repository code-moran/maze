import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import {
  aboutPage,
  blogPost,
  category,
  contactPage,
  homePage,
  product,
  productsPage,
  sectionSeo,
  servicesPage,
  siteMeta,
  siteSettings,
  subProduct,
  testimonial,
  whyChooseItem,
} from "./schemaTypes";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "placeholder";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export default defineConfig({
  name: "maze",
  title: "Maze CMS",
  projectId,
  dataset,
  basePath: "/studio",
  plugins: [structureTool(), visionTool()],
  schema: {
    types: [
      siteSettings,
      siteMeta,
      homePage,
      aboutPage,
      servicesPage,
      contactPage,
      productsPage,
      category,
      subProduct,
      product,
      blogPost,
      testimonial,
      whyChooseItem,
      sectionSeo,
    ],
  },
});

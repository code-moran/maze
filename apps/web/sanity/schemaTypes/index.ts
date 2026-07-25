import { defineType, defineField } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({ name: "phone", type: "string", title: "Phone" }),
    defineField({ name: "email", type: "string", title: "Email" }),
    defineField({ name: "whatsapp", type: "string", title: "WhatsApp" }),
    defineField({ name: "location", type: "string", title: "Location" }),
    defineField({ name: "mapEmbed", type: "text", title: "Map Embed URL" }),
    defineField({
      name: "socialLinks",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "platform", type: "string" },
            { name: "icon", type: "string" },
            { name: "url", type: "url" },
            { name: "handle", type: "string" },
            { name: "enabled", type: "boolean" },
          ],
        },
      ],
    }),
    defineField({ name: "footerBlurb", type: "text", title: "Footer Blurb" }),
    defineField({ name: "hours", type: "string", title: "Hours Short" }),
    defineField({
      name: "businessHoursDetail",
      type: "text",
      title: "Business Hours Detail",
    }),
    defineField({ name: "copyright", type: "string", title: "Copyright" }),
    defineField({ name: "logoIcon", type: "image", title: "Logo Icon" }),
    defineField({ name: "logoWordmark", type: "image", title: "Logo Wordmark" }),
  ],
});

export const siteMeta = defineType({
  name: "siteMeta",
  title: "Site Meta",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string" }),
    defineField({ name: "description", type: "text" }),
    defineField({ name: "keywords", type: "string" }),
    defineField({ name: "ogTitle", type: "string" }),
    defineField({ name: "ogDescription", type: "text" }),
  ],
});

export const homePage = defineType({
  name: "homePage",
  title: "Home Page",
  type: "document",
  fields: [
    defineField({
      name: "heroSlides",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "badge", type: "string" },
            { name: "title", type: "text" },
            { name: "description", type: "text" },
            { name: "backgroundImage", type: "image" },
          ],
        },
      ],
    }),
    defineField({
      name: "stats",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "value", type: "string" },
            { name: "label", type: "string" },
          ],
        },
      ],
    }),
    defineField({
      name: "cta",
      type: "object",
      fields: [
        { name: "title", type: "string" },
        { name: "subtitle", type: "text" },
      ],
    }),
  ],
});

export const aboutPage = defineType({
  name: "aboutPage",
  title: "About Page",
  type: "document",
  fields: [
    defineField({ name: "label", type: "string" }),
    defineField({ name: "title", type: "string" }),
    defineField({ name: "paragraphOne", type: "text" }),
    defineField({ name: "paragraphTwo", type: "text" }),
    defineField({ name: "visionTitle", type: "string" }),
    defineField({ name: "visionText", type: "text" }),
    defineField({ name: "missionTitle", type: "string" }),
    defineField({ name: "missionText", type: "text" }),
    defineField({
      name: "images",
      type: "array",
      of: [{ type: "image" }],
    }),
  ],
});

export const servicesPage = defineType({
  name: "servicesPage",
  title: "Services Page",
  type: "document",
  fields: [
    defineField({ name: "label", type: "string" }),
    defineField({ name: "title", type: "string" }),
    defineField({ name: "subtitle", type: "text" }),
    defineField({
      name: "tv",
      type: "object",
      fields: [
        { name: "label", type: "string" },
        { name: "amount", type: "string" },
        { name: "enabled", type: "boolean" },
        { name: "description", type: "text" },
      ],
    }),
    defineField({
      name: "solar",
      type: "object",
      fields: [
        { name: "label", type: "string" },
        { name: "amount", type: "string" },
        { name: "enabled", type: "boolean" },
        { name: "description", type: "text" },
      ],
    }),
  ],
});

export const contactPage = defineType({
  name: "contactPage",
  title: "Contact Page",
  type: "document",
  fields: [
    defineField({ name: "label", type: "string" }),
    defineField({ name: "title", type: "string" }),
    defineField({ name: "subtitle", type: "text" }),
  ],
});

export const productsPage = defineType({
  name: "productsPage",
  title: "Products Page",
  type: "document",
  fields: [
    defineField({ name: "label", type: "string" }),
    defineField({ name: "title", type: "string" }),
    defineField({ name: "subtitle", type: "text" }),
  ],
});

export const category = defineType({
  name: "category",
  title: "Category",
  type: "document",
  fields: [
    defineField({ name: "key", type: "slug", title: "Key", options: { source: "title" } }),
    defineField({ name: "title", type: "string" }),
    defineField({ name: "description", type: "text" }),
    defineField({ name: "metaTitle", type: "string" }),
    defineField({ name: "metaDescription", type: "text" }),
    defineField({ name: "icon", type: "string", title: "Bootstrap Icon class" }),
    defineField({ name: "order", type: "number" }),
  ],
});

export const subProduct = defineType({
  name: "subProduct",
  title: "Sub Product",
  type: "document",
  fields: [
    defineField({ name: "subId", type: "string", title: "ID" }),
    defineField({ name: "label", type: "string" }),
    defineField({
      name: "category",
      type: "reference",
      to: [{ type: "category" }],
    }),
    defineField({ name: "order", type: "number" }),
  ],
});

export const product = defineType({
  name: "product",
  title: "Product",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string" }),
    defineField({ name: "legacyId", type: "number", title: "Legacy ID" }),
    defineField({
      name: "category",
      type: "reference",
      to: [{ type: "category" }],
    }),
    defineField({ name: "catLabel", type: "string" }),
    defineField({ name: "subCat", type: "string" }),
    defineField({ name: "shortDesc", type: "text" }),
    defineField({ name: "desc", type: "text" }),
    defineField({ name: "seoTitle", type: "string" }),
    defineField({ name: "seoDescription", type: "text" }),
    defineField({
      name: "specs",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "label", type: "string" },
            { name: "value", type: "string" },
          ],
        },
      ],
    }),
    defineField({ name: "features", type: "array", of: [{ type: "string" }] }),
    defineField({ name: "images", type: "array", of: [{ type: "image" }] }),
    defineField({
      name: "imageUrls",
      type: "array",
      of: [{ type: "url" }],
      title: "External Image URLs (seed)",
    }),
  ],
});

export const blogPost = defineType({
  name: "blogPost",
  title: "Blog Post",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string" }),
    defineField({ name: "slug", type: "slug", options: { source: "title" } }),
    defineField({ name: "date", type: "date" }),
    defineField({ name: "author", type: "string" }),
    defineField({ name: "excerpt", type: "text" }),
    defineField({ name: "content", type: "text" }),
    defineField({ name: "image", type: "image" }),
    defineField({ name: "imageUrl", type: "url", title: "External Image URL" }),
    defineField({ name: "link", type: "string" }),
    defineField({ name: "legacyId", type: "number" }),
  ],
});

export const testimonial = defineType({
  name: "testimonial",
  title: "Testimonial",
  type: "document",
  fields: [
    defineField({ name: "stars", type: "string" }),
    defineField({ name: "quote", type: "text" }),
    defineField({ name: "initials", type: "string" }),
    defineField({ name: "name", type: "string" }),
    defineField({ name: "role", type: "string" }),
    defineField({ name: "order", type: "number" }),
  ],
});

export const whyChooseItem = defineType({
  name: "whyChooseItem",
  title: "Why Choose Item",
  type: "document",
  fields: [
    defineField({ name: "icon", type: "string" }),
    defineField({ name: "title", type: "string" }),
    defineField({ name: "text", type: "text" }),
    defineField({ name: "order", type: "number" }),
  ],
});

export const sectionSeo = defineType({
  name: "sectionSeo",
  title: "Section SEO",
  type: "document",
  fields: [
    defineField({
      name: "section",
      type: "string",
      options: {
        list: [
          "home",
          "products",
          "services",
          "about",
          "blog",
          "location",
          "contact",
        ],
      },
    }),
    defineField({ name: "title", type: "string" }),
    defineField({ name: "description", type: "text" }),
  ],
});

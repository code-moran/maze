const fs = require("fs");
const files = [
  "app/(site)/products/page.tsx",
  "app/(site)/blog/page.tsx",
  "app/(site)/contact/page.tsx",
  "app/(site)/services/page.tsx",
  "app/(site)/about/page.tsx",
  "app/(site)/location/page.tsx",
];
for (const f of files) {
  let c = fs.readFileSync(f, "utf8");
  c = c.replace(
    /export function generateMetadata\(\): Metadata \{\n  const seo = await loadSiteContent\(\)\.sectionSeo\.(\w+);\n  return \{\n    title: seo\.title,\n    description: seo\.description,\n  \};\n\}/,
    (_m, key) =>
      `export async function generateMetadata(): Promise<Metadata> {\n  const data = await loadSiteContent();\n  const seo = data.sectionSeo.${key};\n  return {\n    title: seo.title,\n    description: seo.description,\n  };\n}`
  );
  fs.writeFileSync(f, c);
  console.log("fixed", f);
}

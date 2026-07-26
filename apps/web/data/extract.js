const fs = require("fs");
const path = require("path");
const vm = require("vm");

const src = fs.readFileSync(path.join(__dirname, "../../../js/site-data.js"), "utf8");
const sandbox = { window: {}, console };
vm.createContext(sandbox);
vm.runInContext(src + "\nthis.DEFAULT_SITE_DATA = DEFAULT_SITE_DATA;", sandbox);

const data = sandbox.DEFAULT_SITE_DATA;

// Normalize legacy subCats like the live site does
const tvLegacy = { fixed: "fixed-flat", "full-motion": "full-motion-single", tilting: "tilt-wall" };
const solarLegacy = { flood: "solar-fixed", garden: "solar-wall", street: "solar-street" };
data.products.forEach((p) => {
  if (p.cat === "tv-mounts" && tvLegacy[p.subCat]) p.subCat = tvLegacy[p.subCat];
  if (p.cat === "solar" && solarLegacy[p.subCat]) p.subCat = solarLegacy[p.subCat];
});

// Extra content migrated from hardcoded HTML
data.stats = [
  { value: "2,400+", label: "Products Installed" },
  { value: "1,800+", label: "Happy Clients" },
  { value: "8+", label: "Years Experience" },
  { value: "24/7", label: "Customer Support" },
];
data.whyChoose = [
  {
    icon: "bi-patch-check-fill",
    title: "Certified Quality",
    text: "All products are tested and certified to meet international quality standards.",
  },
  {
    icon: "bi-tools",
    title: "Expert Installation",
    text: "Our technicians are factory-trained and insured, ensuring safe, clean installations.",
  },
  {
    icon: "bi-headset",
    title: "24/7 Support",
    text: "We're always available via phone, WhatsApp, or email for after-sales support.",
  },
  {
    icon: "bi-arrow-repeat",
    title: "Warranty Guarantee",
    text: "All products come with manufacturer warranty and our 6-month installation guarantee.",
  },
];
data.testimonials = [
  {
    stars: "★★★★★",
    quote:
      "Excellent service! The team arrived on time, mounted my 65-inch TV cleanly, and hid all the cables. I'd definitely recommend Maze to anyone.",
    initials: "JM",
    name: "James Mwangi",
    role: "Homeowner, Westlands",
  },
  {
    stars: "★★★★★",
    quote:
      "We sourced all our CCTV cameras and solar lights from Maze Tech for our hotel. Professional, fast, and the products are top quality. Great value for money!",
    initials: "SK",
    name: "Sandra Kamau",
    role: "Hotel Manager, Karen",
  },
  {
    stars: "★★★★☆",
    quote:
      "The extension cables are of great quality and well-priced. The delivery was fast and the packaging was excellent. Will definitely order again from Maze.",
    initials: "PO",
    name: "Paul Otieno",
    role: "Office Manager, CBD",
  },
];
data.cta = {
  title: "Ready to Transform Your Space?",
  subtitle: "Get a free consultation and quote from our certified installation team",
};
data.footer = {
  blurb:
    "Nairobi's trusted supplier of smart home products and professional installation services. Quality products, expert hands.",
  hours: "Mon–Sat: 8am–6pm",
  businessHoursDetail: "Mon – Sat: 8:00 AM – 6:00 PM\nSun: 10:00 AM – 4:00 PM",
  copyright: "© 2026 Maze. All rights reserved.",
};
data.aboutImages = [
  "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&auto=format&fit=crop",
];
data.heroBackgrounds = [
  "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=900&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=900&auto=format&fit=crop",
];

fs.writeFileSync(
  path.join(__dirname, "defaultSiteData.json"),
  JSON.stringify(data, null, 2)
);
console.log("Wrote defaultSiteData.json");

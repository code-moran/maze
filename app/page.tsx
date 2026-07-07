import StaticHtmlPage from "./components/StaticHtmlPage";
import { extractBodyHtml } from "./lib/html";

export default function HomePage() {
  return (
    <StaticHtmlPage
      html={extractBodyHtml("index.html")}
      scripts={["/js/site-data.js", "/js/main.js"]}
    />
  );
}

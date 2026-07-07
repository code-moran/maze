import StaticHtmlPage from "../components/StaticHtmlPage";
import { extractBodyHtml } from "../lib/html";

export default function DashboardPage() {
  return (
    <StaticHtmlPage
      html={extractBodyHtml("dashboard.html")}
      scripts={["/js/site-data.js", "/js/dashboard.js"]}
      bodyClass="dashboard-shell"
    />
  );
}

import fs from "fs";
import path from "path";

export function extractBodyHtml(filename: string) {
  const html = fs.readFileSync(path.join(process.cwd(), filename), "utf8");
  const match = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);

  if (!match) {
    return "";
  }

  return match[1].replace(/<script[\s\S]*?<\/script>/gi, "").trim();
}

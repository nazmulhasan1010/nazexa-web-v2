import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compDir = path.join(__dirname, "src", "components");

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (file.endsWith(".tsx") || file.endsWith(".ts")) {
      let content = fs.readFileSync(fullPath, "utf8");

      // Add use client if it uses hooks or next/navigation
      const needsClient =
        /use(State|Effect|Ref|Memo|Callback|Context|Pathname|Router|Params|SearchParams|Query|Mutation)/.test(
          content,
        ) || /@tanstack\/react-query/.test(content);

      if (needsClient && !content.includes('"use client"')) {
        fs.writeFileSync(fullPath, `"use client";\n\n` + content, "utf8");
        console.log("Added use client to " + file);
      }
    }
  }
}

processDir(compDir);

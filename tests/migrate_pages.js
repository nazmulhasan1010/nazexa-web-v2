import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const routesDir = path.join(__dirname, 'src', 'routes');
const appDir = path.join(__dirname, 'src', 'app');

if (!fs.existsSync(appDir)) {
  fs.mkdirSync(appDir, { recursive: true });
}

const files = fs.readdirSync(routesDir);

for (const file of files) {
  if (file.endsWith('.tsx')) {
    const slug = file.replace('.tsx', '');
    const content = fs.readFileSync(path.join(routesDir, file), 'utf8');

    if (content.includes('StandardPage')) {
      const match = content.match(/pages\["([^"]+)"\]/);
      if (match) {
        const pageKey = match[1];

        const nextContent = `import { Metadata } from "next";
import { StandardPage } from "@/components/site/PageShell";
import { pages } from "@/lib/site-content";

const page = pages["${pageKey}"]!;

export const metadata: Metadata = {
  title: page.title + " — Nazexa",
  description: page.description,
  openGraph: {
    title: page.title + " — Nazexa",
    description: page.description,
    type: "website",
    url: "/${slug}",
  },
  twitter: {
    card: "summary_large_image",
  },
  alternates: {
    canonical: "/${slug}",
  }
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: page.title,
            description: page.description,
          }),
        }}
      />
      <StandardPage page={page} />
    </>
  );
}
`;

        const targetDir = path.join(appDir, slug);
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }

        fs.writeFileSync(path.join(targetDir, 'page.tsx'), nextContent, 'utf8');
        fs.unlinkSync(path.join(routesDir, file));
        console.log('Migrated ' + file);
      }
    }
  }
}

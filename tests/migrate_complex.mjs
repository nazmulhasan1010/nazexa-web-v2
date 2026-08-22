import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const appDir = path.join(__dirname, 'src', 'app');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (file === 'page.tsx') {
      if (
        fullPath === path.join(appDir, 'page.tsx') ||
        fullPath === path.join(appDir, 'auth', 'page.tsx')
      ) {
        continue;
      }

      let content = fs.readFileSync(fullPath, 'utf8');

      // skip if already migrated
      if (!content.includes('createFileRoute')) continue;

      let newContent = content;

      // Ensure "use client"
      if (!newContent.startsWith('"use client"')) {
        newContent = `"use client";\n\n` + newContent;
      }

      // Convert Link imports
      newContent = newContent.replace(
        /import\s+{([^}]*)}\s+from\s+['"]@tanstack\/react-router['"];/g,
        (match, importsStr) => {
          const imports = importsStr
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
          let nextImports = [];
          let nextLink = false;
          let nextNav = [];

          for (const imp of imports) {
            if (imp === 'Link') nextLink = true;
            else if (imp === 'useNavigate') nextNav.push('useRouter');
            else if (imp === 'useRouterState') nextNav.push('usePathname');
            else if (imp === 'useParams') nextNav.push('useParams');
          }

          let res = '';
          if (nextLink) res += `import Link from "next/link";\n`;
          if (nextNav.length)
            res += `import { ${[...new Set(nextNav)].join(', ')} } from "next/navigation";\n`;

          return res;
        }
      );

      // Convert <Link to= to <Link href=
      newContent = newContent.replace(/<Link([^>]+)to=/g, '<Link$1href=');

      // Remove createFileRoute block
      newContent = newContent.replace(
        /export\s+const\s+Route\s*=\s*createFileRoute[^;]*\({[\s\S]*?component:\s*([A-Za-z0-9_]+),?[\s\S]*?}\);/g,
        'export default $1;'
      );

      fs.writeFileSync(fullPath, newContent, 'utf8');
      console.log('Migrated complex ' + fullPath);
    }
  }
}

processDir(appDir);

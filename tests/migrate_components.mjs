import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compDir = path.join(__dirname, 'src', 'components');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');

      if (content.includes('@tanstack/react-router')) {
        // Replace imports
        content = content.replace(
          /import\s+{([^}]*)}\s+from\s+['"]@tanstack\/react-router['"];/g,
          (match, importsStr) => {
            const imports = importsStr
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean);
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

        // Replace <Link to=
        content = content.replace(/<Link([^>]+)to=/g, '<Link$1href=');

        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Migrated component ' + fullPath);
      }
    }
  }
}

processDir(compDir);
processDir(path.join(__dirname, 'src', 'hooks'));

const fs = require('fs');
let content = fs.readFileSync('src/components/navigation/NavigationBuilder.tsx', 'utf8');
content = content.replace('fetch(/api/admin/navigation?type= + type + &status=draft);', 'fetch(\/api/admin/navigation?type=\&status=draft\);');
content = content.replace('id: 
ew- + Date.now(),', 'id: \
ew-\\,');
fs.writeFileSync('src/components/navigation/NavigationBuilder.tsx', content);

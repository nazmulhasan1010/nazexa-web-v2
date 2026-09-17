import fs from 'fs';

let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

// Find all instances of "id String @id" without "@default" on the same line
const idRegex = /([ \t]+id[ \t]+String[ \t]+@id)(?![^\n]*@default)/g;

schema = schema.replace(idRegex, '$1 @default(uuid())');

fs.writeFileSync('prisma/schema.prisma', schema);
console.log('Added @default(uuid()) to string primary keys!');

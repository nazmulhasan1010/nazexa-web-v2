import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

try {
  const sections = await prisma.homeSection.findMany();
  console.log("Found sections:", sections.length);
} catch (e) {
  console.error("Query Error:", e.message);
  console.error("Code:", e.code);
} finally {
  await prisma.$disconnect();
}

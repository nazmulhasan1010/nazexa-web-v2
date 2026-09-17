import { db } from '@/lib/db';
db.homeSection.findMany().then((r) => console.log(r.map((x) => x.type)));

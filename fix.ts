import "dotenv/config";
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { db } from "./src/db/index";
import { registrations, branches } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  try {
    await db.update(registrations).set({ branchId: 'lifecity-gh-media' }).where(eq(registrations.branchId, 'yes'));
    console.log('Moved registrations to default branch.');
    await db.delete(branches).where(eq(branches.id, 'yes'));
    console.log('Deleted the phantom Yes branch!');
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
main();

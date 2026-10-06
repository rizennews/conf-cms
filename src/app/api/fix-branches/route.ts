import { NextResponse } from "next/server";
import { db } from "../../../../db";
import { branches, registrations } from "../../../../db/schema";
import { eq, like } from "drizzle-orm";

export const dynamic = 'force-dynamic'; // Ensure it's not cached

export async function GET() {
  try {
    const badBranches = await db.select().from(branches).where(like(branches.id, "%other-external%"));
    
    let migratedCount = 0;
    let deletedCount = 0;

    for (const b of badBranches) {
      // Migrate registrations
      await db.update(registrations).set({ branchId: 'other' }).where(eq(registrations.branchId, b.id as string));
      migratedCount++;
      
      // Delete the branch
      await db.delete(branches).where(eq(branches.id, b.id as string));
      deletedCount++;
    }

    return NextResponse.json({
      success: true,
      message: "Cleanup complete",
      migratedRegistrationsFromBranchCount: migratedCount,
      deletedBadBranches: deletedCount,
      branchesFixed: badBranches.map(b => b.name)
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

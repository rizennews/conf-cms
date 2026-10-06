import { NextResponse } from "next/server";
import { db } from "../../../db";
import { branches, registrations } from "../../../db/schema";
import { eq } from "drizzle-orm";

export const dynamic = 'force-dynamic'; // Ensure it's not cached

export async function GET() {
  try {
    const allBranches = await db.select().from(branches);
    
    // Find bad branches dynamically
    const badBranches = allBranches.filter(b => 
      b.id !== 'other' && b.name && b.name.toLowerCase().includes('other')
    );
    
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
      branchesFixed: badBranches.map(b => b.name),
      debugAllBranches: allBranches.map(b => ({ id: b.id, name: b.name }))
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

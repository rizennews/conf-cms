"use server";

import { db } from "../../../../db";
import { branches } from "../../../../db/schema";
import { revalidatePath } from "next/cache";

export async function createBranch(formData: FormData) {
  const name = formData.get("name") as string;
  
  if (!name || name.trim() === "") {
    return { error: "Branch name is required" };
  }

  try {
    // Basic slug generation for ID since we need a string primary key
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    
    await db.insert(branches).values({
      id,
      name: name.trim()
    });

    revalidatePath("/admin/branches");
    return { success: true };
  } catch (err: any) {
    if (err.code === '23505') { // Unique constraint violation in Postgres
      return { error: "A branch with this name already exists." };
    }
    return { error: "Failed to create branch: " + err.message };
  }
}

export async function deleteBranch(id: string) {
  try {
    const { eq } = await import("drizzle-orm");
    await db.delete(branches).where(eq(branches.id, id));
    revalidatePath("/admin/branches");
    return { success: true };
  } catch (err: any) {
    if (err.code === '23503') { // Foreign key constraint violation
      return { error: "Cannot delete this branch because it has existing registrations." };
    }
    return { error: "Failed to delete branch: " + err.message };
  }
}

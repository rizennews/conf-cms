"use server";

import { db } from "../../../../db";
import { user, activityLogs } from "../../../../db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "../../../../lib/auth";
import { headers } from "next/headers";

export async function updateUserRole(userId: string, role: string, branchId: string | null) {
  try {
    const reqHeaders = await headers();
    const session = await auth.api.getSession({ headers: reqHeaders });
    if (!session) return { error: "Unauthorized" };

    if (session.user.id === userId) {
      return { error: "You cannot change your own role." };
    }

    await db.update(user).set({
      role,
      branchId: role === "branch_head" ? branchId : null
    }).where(eq(user.id, userId));

    await db.insert(activityLogs).values({
      userId: session.user.id,
      action: "edit-staff-role",
      details: JSON.stringify({ targetUserId: userId, newRole: role, newBranchId: branchId })
    });
    
    revalidatePath("/admin/staff");
    return { success: true };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

export async function addUser(data: { name: string, email: string, password: string, role: string, branchId?: string }) {
  try {
    // 1. Create the user using BetterAuth's API to handle password hashing and account creation securely.
    // We pass a dummy Headers object so it doesn't override the admin's current session cookies.
    const res = await auth.api.signUpEmail({
      body: {
        email: data.email,
        password: data.password,
        name: data.name
      },
      headers: new Headers()
    });

    if (res?.user?.id) {
      await db.update(user).set({
        role: data.role,
        branchId: data.role === "branch_head" ? (data.branchId || null) : null
      }).where(eq(user.id, res.user.id));
      
      const reqHeaders = await headers();
      const session = await auth.api.getSession({ headers: reqHeaders });
      if (session) {
        await db.insert(activityLogs).values({
          userId: session.user.id,
          action: "create-staff",
          details: JSON.stringify({ newUserId: res.user.id, role: data.role })
        });
      }
      
      revalidatePath("/admin/staff");
      return { success: true };
    }
    
    return { error: "Failed to create user. Email may already be in use." };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "An error occurred creating the user." };
  }
}

export async function deleteUser(userId: string) {
  try {
    const reqHeaders = await headers();
    const session = await auth.api.getSession({ headers: reqHeaders });
    if (!session) return { error: "Unauthorized" };

    if (session.user.id === userId) {
      return { error: "You cannot delete yourself." };
    }

    const { session: sessionSchema, account } = await import("../../../../db/schema");
    
    // Delete related records first to avoid foreign key constraints
    await db.delete(sessionSchema).where(eq(sessionSchema.userId, userId));
    await db.delete(account).where(eq(account.userId, userId));
    
    // Delete user
    await db.delete(user).where(eq(user.id, userId));
    
    await db.insert(activityLogs).values({
      userId: session.user.id,
      action: "delete-staff",
      details: JSON.stringify({ deletedUserId: userId })
    });

    revalidatePath("/admin/staff");
    return { success: true };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "An error occurred deleting the user." };
  }
}

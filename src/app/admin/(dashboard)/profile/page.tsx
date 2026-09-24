import { auth } from "../../../../lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import ProfileForm from "./ProfileForm";

export default async function ProfilePage() {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });
  if (!session) redirect("/admin/login");

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto", paddingBottom: "4rem" }}>
      <div style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#111", margin: "0 0 0.5rem 0", letterSpacing: "-0.02em" }}>Settings</h1>
        <p style={{ color: "#666", margin: 0, fontSize: "0.95rem" }}>Manage your account and security settings.</p>
      </div>

      <div style={{ borderTop: "1px solid #eaeaea", paddingTop: "2rem" }}>
        
        {/* Account Info */}
        <div style={{ marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "#111", marginBottom: "1.5rem" }}>Account</h2>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: "1.5rem", borderBottom: "1px solid #eaeaea" }}>
            <div>
              <div style={{ fontSize: "0.9rem", color: "#111", marginBottom: "0.25rem" }}>Email address</div>
              <div style={{ fontSize: "0.9rem", color: "#111", marginBottom: "0.25rem" }}>{session.user.email}</div>
              <div style={{ fontSize: "0.85rem", color: "#666" }}>The email associated with this account.</div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "1.5rem" }}>
            <div>
              <div style={{ fontSize: "0.9rem", color: "#111", marginBottom: "0.25rem" }}>Name</div>
              <div style={{ fontSize: "0.85rem", color: "#666" }}>{session.user.name}</div>
            </div>
          </div>
        </div>

        {/* Password update form */}
        <div style={{ marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "#111", marginBottom: "1.5rem" }}>Security</h2>
          <ProfileForm />
        </div>

      </div>
    </div>
  );
}

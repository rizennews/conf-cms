"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "../../../lib/auth-client";
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  DoorOpen,
  Building2,
  Users,
  User,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, roles: ["super_admin", "admin", "data_team", "branch_head"] },
  { href: "/admin/events", label: "Events", icon: CalendarDays, roles: ["super_admin", "admin"] },
  { href: "/admin/registrations", label: "Registrations", icon: ClipboardList, roles: ["super_admin", "admin", "data_team", "branch_head"] },
  { href: "/admin/checkin", label: "Check-in", icon: DoorOpen, roles: ["super_admin", "admin", "data_team", "branch_head"] },
  { href: "/admin/branches", label: "Branches", icon: Building2, roles: ["super_admin"] },
  { href: "/admin/staff", label: "Staff & Users", icon: Users, roles: ["super_admin"] },
];

export default function Sidebar({ role, userName }: { role: string; userName: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const visibleItems = NAV_ITEMS.filter(item => item.roles.includes(role));

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/admin/login");
  };

  const NavContent = () => (
    <>
      {/* Header */}
      <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#111" }}>CMS Portal</h2>
          <span style={{ display: "inline-block", background: "rgba(43,63,242,0.1)", color: "#2b3ff2", padding: "0.15rem 0.5rem", borderRadius: "4px", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase" as const, marginTop: "0.25rem" }}>
            {role.replace(/_/g, " ")}
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(false)}
          style={{ display: mobileOpen ? "flex" : "none", background: "none", border: "none", cursor: "pointer", color: "#6b7280", alignItems: "center" }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.15rem", overflowY: "auto" }}>
        {visibleItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.7rem 1rem",
                borderRadius: "8px",
                textDecoration: "none",
                fontWeight: active ? 600 : 500,
                fontSize: "0.9rem",
                color: active ? "#2b3ff2" : "#374151",
                background: active ? "rgba(43,63,242,0.08)" : "transparent",
                transition: "all 0.15s",
              }}
              onMouseOver={e => { if (!active) e.currentTarget.style.background = "#f9fafb"; }}
              onMouseOut={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
            >
              <Icon size={18} strokeWidth={active ? 2.5 : 1.8} color={active ? "#2b3ff2" : "#374151"} />
              <span style={{ flex: 1 }}>{label}</span>
              {active && <ChevronRight size={14} color="#2b3ff2" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: "0.75rem", borderTop: "1px solid #e5e7eb", display: "flex", flexDirection: "column", gap: "0.15rem" }}>
        <Link
          href="/admin/profile"
          onClick={() => setMobileOpen(false)}
          style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.7rem 1rem", borderRadius: "8px", textDecoration: "none", color: "#374151", fontWeight: 500, fontSize: "0.9rem" }}
          onMouseOver={e => { e.currentTarget.style.background = "#f9fafb"; }}
          onMouseOut={e => { e.currentTarget.style.background = "transparent"; }}
        >
          <User size={18} color="#374151" />
          <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userName}</span>
        </Link>
        <button
          onClick={handleLogout}
          style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.7rem 1rem", borderRadius: "8px", background: "none", border: "none", color: "#ef4444", fontWeight: 500, fontSize: "0.9rem", cursor: "pointer", width: "100%", textAlign: "left" }}
          onMouseOver={e => { e.currentTarget.style.background = "#fef2f2"; }}
          onMouseOut={e => { e.currentTarget.style.background = "none"; }}
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div style={{ display: "none", alignItems: "center", padding: "0.9rem 1.25rem", background: "white", borderBottom: "1px solid #e5e7eb", position: "sticky", top: 0, zIndex: 100, gap: "1rem" }} className="mobile-topbar">
        <button onClick={() => setMobileOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", color: "#374151", display: "flex" }}>
          <Menu size={22} />
        </button>
        <span style={{ fontWeight: 700, fontSize: "1rem", color: "#111", flex: 1 }}>CMS Portal</span>
      </div>

      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 199 }}
        />
      )}

      {/* Desktop sidebar (always visible) + Mobile drawer */}
      <aside
        className="sidebar-root"
        style={{
          width: "260px",
          background: "white",
          borderRight: "1px solid #e5e7eb",
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          position: "sticky",
          top: 0,
          flexShrink: 0,
        }}
      >
        <NavContent />
      </aside>

      <style>{`
        @media (max-width: 768px) {
          .mobile-topbar { display: flex !important; }
          .sidebar-root {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            height: 100vh !important;
            z-index: 200 !important;
            transform: ${mobileOpen ? "translateX(0)" : "translateX(-100%)"};
            transition: transform 0.25s cubic-bezier(0.4,0,0.2,1);
            box-shadow: ${mobileOpen ? "4px 0 24px rgba(0,0,0,0.15)" : "none"};
          }
        }
      `}</style>
    </>
  );
}

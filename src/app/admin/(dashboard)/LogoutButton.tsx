"use client";

import { authClient } from "../../../lib/auth-client";
import { useRouter } from "next/navigation";
import styles from "./admin.module.css";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/admin/login");
  };

  return (
    <button onClick={handleLogout} className={styles.logoutBtn}>
      Sign out
    </button>
  );
}

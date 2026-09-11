import { useMemo } from "react";

import "./ProfilePage.css";

function getCurrentUser() {
  const sessionUser =
    sessionStorage.getItem("streamweaver_user") || "";

  const sessionUserId =
    sessionStorage.getItem("streamweaver_user_id") || "";

  try {
    const users = JSON.parse(
      localStorage.getItem("users") || "[]"
    );

    const storedUsers =
      Array.isArray(users) ? users : [];

    const currentUser = storedUsers.find((user) => {
      return (
        String(user.userId || user.id || "") === sessionUserId ||
        String(user.email || "").toLowerCase() ===
          sessionUser.toLowerCase() ||
        String(user.name || user.fullName || "").toLowerCase() ===
          sessionUser.toLowerCase()
      );
    });

    return {
      name:
        currentUser?.name ||
        currentUser?.fullName ||
        sessionUser ||
        "StreamWeaver User",

      email:
        currentUser?.email ||
        "Not provided",

      role:
        currentUser?.role ||
        currentUser?.userRole ||
        "User",

      status:
        currentUser?.status ||
        "Active",

      
    };
  } catch (error) {
    console.error(
      "Failed to read profile:",
      error
    );

    return {
      name: sessionUser || "StreamWeaver User",
      email: "Not provided",
      role: "User",
      status: "Active",
      
    };
  }
}

function ProfilePage() {
  
  const user = useMemo(() => getCurrentUser(), []);
  const initials = user.name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="profile-page">
      <div className="profile-heading">
        <div>
          <span className="profile-kicker">Account</span>
          <h1>Profile</h1>
          <p>Manage your StreamWeaver account details.</p>
        </div>
        <span className="profile-status">Active account</span>
      </div>

      <section className="profile-card">
        <div className="profile-identity">
          <div className="profile-avatar" aria-hidden="true">{initials}</div>
          <div>
            <h2>{user.name}</h2>
            <p>{user.email}</p>
          </div>
        </div>
        <div className="profile-details">
          <div className="profile-detail">
            <span>Name</span>
            <strong>{user.name}</strong>
          </div>
          <div className="profile-detail">
            <span>Email</span>
            <strong>{user.email}</strong>
          </div>
          <div className="profile-detail">
  <span>Role</span>
  <strong>{user.role}</strong>
</div>

<div className="profile-detail">
  <span>Account Status</span>
  <strong>{user.status}</strong>
</div>


        </div>
      </section>

      {/* <section className="profile-security-card">
        <div>
          <span className="profile-kicker">Account security</span>
          <h2>Your account is protected</h2>
          <p>Password details are kept private and are never displayed here.</p>
        </div>
        <button type="button" onClick={() => navigate("/settings")}>Open settings</button>
      </section> */}
    </div>
  );
}

export default ProfilePage;

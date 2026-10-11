
import { useEffect, useState } from "react";
import axios from "axios";
import api, {
  setApiCredentials,
  clearApiCredentials,
} from "./api";
import "./App.css";

import Students from "./Students";
import Faculty from "./Faculty";
import Courses from "./Courses";
import Attendance from "./Attendance";
import Marks from "./Marks";
import Notices from "./Notices";
import SmartFeatures from "./SmartFeatures";

const API_URL = "http://localhost:8080";

const allPages = [
  {
    title: "Dashboard",
    icon: "▦",
    roles: ["ADMIN", "FACULTY", "STUDENT"],
  },
  {
    title: "Students",
    icon: "🎓",
    roles: ["ADMIN", "FACULTY"],
  },
  {
    title: "Faculty",
    icon: "👨‍🏫",
    roles: ["ADMIN"],
  },
  {
    title: "Courses",
    icon: "📚",
    roles: ["ADMIN", "FACULTY", "STUDENT"],
  },
  {
    title: "Attendance",
    icon: "📅",
    roles: ["ADMIN", "FACULTY", "STUDENT"],
  },
  {
    title: "Marks",
    icon: "📊",
    roles: ["ADMIN", "FACULTY", "STUDENT"],
  },
  {
    title: "Notices",
    icon: "📢",
    roles: ["ADMIN", "FACULTY", "STUDENT"],
  },
  {
    title: "Smart Features",
    icon: "✨",
    roles: ["ADMIN", "FACULTY", "STUDENT"],
  },
];

function getRole(user) {
  return String(user?.role || user?.userType || "")
    .toUpperCase()
    .replace("ROLE_", "");
}

function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.detail ||
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    fallback
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [activePage, setActivePage] = useState("Dashboard");
  const [summary, setSummary] = useState({});
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState("");
  const [busy, setBusy] = useState(false);

  // Authentication screen state
  const [authMode, setAuthMode] = useState("login");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("STUDENT");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [authError, setAuthError] = useState("");

  const currentRole = getRole(user);

  const visiblePages = allPages.filter((page) =>
    page.roles.includes(currentRole)
  );

  function changeAuthMode(mode) {
    setAuthMode(mode);
    setPassword("");
    setConfirmPassword("");
    setAuthError("");
    setAuthMessage("");
  }

  async function handleLogin(event) {
    event.preventDefault();
    setBusy(true);
    setAuthError("");
    setAuthMessage("");

    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: email.trim(),
        password,
      });

      const loggedInUser = response.data;
      const loggedInRole = getRole(loggedInUser);

      if (!["ADMIN", "FACULTY", "STUDENT"].includes(loggedInRole)) {
        throw new Error("Your account has an unsupported role.");
      }

      // Set credentials for protected API requests.
      setApiCredentials(email.trim(), password);

      setUser({
        ...loggedInUser,
        role: loggedInRole,
        userType: loggedInRole,
      });

      setActivePage("Dashboard");
      setAuthMessage("");
      setPassword("");
    } catch (error) {
      clearApiCredentials();
      setAuthError(
        getErrorMessage(error, error.message || "Unable to sign in.")
      );
    } finally {
      setBusy(false);
    }
  }

  async function handlePasswordUpdate(event) {
    event.preventDefault();
    setAuthError("");
    setAuthMessage("");

    if (!email.trim()) {
      setAuthError("Please enter your registered email.");
      return;
    }

    if (password.length < 8 || password.length > 72) {
      setAuthError("Password must contain 8–72 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setAuthError("The passwords do not match.");
      return;
    }

    setBusy(true);

    try {
      const response = await axios.post(
        `${API_URL}/auth/demo-password`,
        {
          email: email.trim(),
          role,
          newPassword: password,
        }
      );

      setAuthMessage(
        response.data?.message ||
          "Password updated. You can now sign in."
      );
      setPassword("");
      setConfirmPassword("");

      // Move to login after showing the confirmation.
      setAuthMode("login");
    } catch (error) {
      setAuthError(
        getErrorMessage(
          error,
          "Password update failed. Check that the backend is running and the account email and role are correct."
        )
      );
    } finally {
      setBusy(false);
    }
  }

  async function loadDashboardSummary() {
    setLoadingSummary(true);
    setSummaryError("");

    try {
      const response = await api.get("/dashboard/summary");
      setSummary(response.data || {});
    } catch (error) {
      setSummaryError(
        getErrorMessage(
          error,
          "Could not load dashboard statistics. Check your backend connection."
        )
      );
    } finally {
      setLoadingSummary(false);
    }
  }

  useEffect(() => {
    if (user && activePage === "Dashboard") {
      loadDashboardSummary();
    }
    // The dashboard is refreshed when the logged-in user or page changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activePage]);

  function handleLogout() {
    clearApiCredentials();
    setUser(null);
    setSummary({});
    setActivePage("Dashboard");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setAuthError("");
    setAuthMessage("");
    setAuthMode("login");
  }

  function displayName() {
    return user?.name || user?.fullName || user?.email || "Campus User";
  }

  function getSummaryValue(...keys) {
    for (const key of keys) {
      const value = summary?.[key];

      if (value !== undefined && value !== null) {
        return value;
      }
    }

    return "—";
  }

  function renderDashboard() {
    const cards = [
      {
        title: "Total Students",
        value: getSummaryValue("students", "totalStudents", "studentCount"),
        icon: "🎓",
        color: "blue",
      },
      {
        title: "Total Faculty",
        value: getSummaryValue("faculty", "totalFaculty", "facultyCount"),
        icon: "👩‍🏫",
        color: "purple",
      },
      {
        title: "Total Courses",
        value: getSummaryValue("courses", "totalCourses", "courseCount"),
        icon: "📚",
        color: "orange",
      },
      {
        title: "Attendance Records",
        value: getSummaryValue(
          "attendance",
          "totalAttendance",
          "attendanceCount"
        ),
        icon: "📅",
        color: "green",
      },
      {
        title: "Marks Records",
        value: getSummaryValue("marks", "totalMarks", "marksCount"),
        icon: "📊",
        color: "pink",
      },
      {
        title: "Notices",
        value: getSummaryValue("notices", "totalNotices", "noticeCount"),
        icon: "📢",
        color: "cyan",
      },
    ];

    return (
      <>
        <section className="welcome-banner">
          <div className="welcome-content">
            <span className="eyebrow">YOUR CAMPUS, CONNECTED</span>
            <h2>Welcome back, {displayName()}! 👋</h2>
            <p>
              Everything you need for your academic journey, all in one place.
            </p>
            <span className="role-pill">
              {currentRole || "CAMPUS USER"}
            </span>
          </div>

          <div className="welcome-decoration" aria-hidden="true">
            <span>✦</span>
            <span>✧</span>
            <span>◈</span>
          </div>
        </section>

        <div className="section-heading">
          <div>
            <h2>Campus Overview</h2>
            <p>Here is a quick snapshot of your campus.</p>
          </div>

          <button
            className="secondary-btn"
            type="button"
            onClick={loadDashboardSummary}
            disabled={loadingSummary}
          >
            {loadingSummary ? "Refreshing…" : "↻ Refresh"}
          </button>
        </div>

        {summaryError && (
          <div className="inline-alert error-message">
            {summaryError}
          </div>
        )}

        <div className="stats-grid">
          {cards.map((card) => (
            <article className="stat-card" key={card.title}>
              <div className={`stat-icon ${card.color}`}>
                {card.icon}
              </div>
              <div className="stat-details">
                <p>{card.title}</p>
                <h3>{loadingSummary ? "…" : card.value}</h3>
              </div>
              <span className="stat-dot" aria-hidden="true" />
            </article>
          ))}
        </div>

        <section className="content-panel">
          <div className="panel-heading">
            <div>
              <h3>Quick Access</h3>
              <p>Jump straight to the tools you need.</p>
            </div>
            <span className="panel-sparkle">✦</span>
          </div>

          <div className="quick-access-grid">
            {visiblePages
              .filter((page) => page.title !== "Dashboard")
              .map((page) => (
                <button
                  type="button"
                  className="quick-access-item"
                  key={page.title}
                  onClick={() => setActivePage(page.title)}
                >
                  <span className="quick-access-icon">{page.icon}</span>
                  <span>{page.title}</span>
                  <span className="quick-arrow">↗</span>
                </button>
              ))}
          </div>
        </section>

        <div className="dashboard-note">
          <span className="note-icon">💡</span>
          <p>
            <strong>CampusConnect tip</strong>
            <br />
            Use the sidebar to access your academic modules. Available modules
            depend on your account role.
          </p>
        </div>
      </>
    );
  }

  function renderActiveModule() {
    switch (activePage) {
      case "Students":
        return <Students />;
      case "Faculty":
        return <Faculty />;
      case "Courses":
        return <Courses />;
      case "Attendance":
        return <Attendance />;
      case "Marks":
        return <Marks />;
      case "Notices":
        return <Notices />;
      case "Smart Features":
        return <SmartFeatures />;
      case "Dashboard":
      default:
        return renderDashboard();
    }
  }

  if (!user) {
    return (
      <main className="auth-container">
        <section className="login-box">
          <div className="brand-mark">CC</div>
          <div className="brand-caption">SMART CAMPUS PLATFORM</div>

          <h1>CampusConnect</h1>
          <p className="auth-subtitle">
            One portal for your academic community.
          </p>

          <div className="auth-options" role="group" aria-label="Account actions">
            <button
              type="button"
              className={authMode === "login" ? "selected" : ""}
              onClick={() => changeAuthMode("login")}
            >
              Sign In
            </button>
            <button
              type="button"
              className={authMode === "create" ? "selected" : ""}
              onClick={() => changeAuthMode("create")}
            >
              Create Password
            </button>
            <button
              type="button"
              className={authMode === "forgot" ? "selected" : ""}
              onClick={() => changeAuthMode("forgot")}
            >
              Forgot Password
            </button>
          </div>

          {authMode === "login" ? (
            <form className="auth-form" onSubmit={handleLogin}>
              <div className="form-heading">
                <h2>Welcome back</h2>
                <p>Sign in to continue to your campus.</p>
              </div>

              <label htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="username"
                required
              />

              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />

              <button
                className="primary-btn"
                type="submit"
                disabled={busy}
              >
                {busy ? "Signing in…" : "Sign In →"}
              </button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handlePasswordUpdate}>
              <div className="form-heading">
                <h2>
                  {authMode === "create"
                    ? "Create Password"
                    : "Reset Password"}
                </h2>
                <p>
                  Local demo mode: this changes the password of an existing
                  account. It does not verify account ownership.
                </p>
              </div>

              <label htmlFor="reset-email">Registered email</label>
              <input
                id="reset-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your registered email"
                autoComplete="email"
                required
              />

              <label htmlFor="account-role">Account role</label>
              <select
                id="account-role"
                value={role}
                onChange={(event) => setRole(event.target.value)}
              >
                <option value="STUDENT">Student</option>
                <option value="FACULTY">Faculty</option>
                <option value="ADMIN">Admin</option>
              </select>

              <label htmlFor="new-password">New password</label>
              <input
                id="new-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 8 characters"
                minLength={8}
                maxLength={72}
                autoComplete="new-password"
                required
              />

              <label htmlFor="confirm-password">Confirm new password</label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                placeholder="Enter password again"
                minLength={8}
                maxLength={72}
                autoComplete="new-password"
                required
              />

              <button
                className="primary-btn"
                type="submit"
                disabled={busy}
              >
                {busy
                  ? "Please wait…"
                  : authMode === "create"
                    ? "Create Password →"
                    : "Reset Password →"}
              </button>
            </form>
          )}

          {authMessage && (
            <div className="inline-alert success-message" role="status">
              {authMessage}
            </div>
          )}

          {authError && (
            <div className="inline-alert error-message" role="alert">
              {authError}
            </div>
          )}

          <div className="auth-footer">
            <span className="footer-lock">◆</span>
            Built for your campus community
          </div>
        </section>
      </main>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark small">CC</div>
          <div>
            <h2>CampusConnect</h2>
            <span>SMART CAMPUS</span>
          </div>
        </div>

        <div className="sidebar-label">WORKSPACE</div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          {visiblePages.map((page) => (
            <button
              type="button"
              key={page.title}
              className={`nav-item ${
                activePage === page.title ? "active" : ""
              }`}
              onClick={() => setActivePage(page.title)}
            >
              <span className="nav-icon">{page.icon}</span>
              <span>{page.title}</span>
              {activePage === page.title && (
                <span className="nav-indicator" />
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-help">
            <span className="help-icon">✦</span>
            <strong>CampusConnect</strong>
            <p>Your campus, all connected.</p>
          </div>

          <button className="logout-btn" type="button" onClick={handleLogout}>
            <span>↪</span> Sign Out
          </button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-title">
            <span className="topbar-eyebrow">CAMPUS WORKSPACE</span>
            <h1>{activePage}</h1>
          </div>

          <div className="topbar-user">
            <div className="online-indicator" />
            <div className="topbar-user-text">
              <strong>{displayName()}</strong>
              <span>{currentRole}</span>
            </div>
            <div className="avatar">
              {displayName().charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <section className="page-content" key={activePage}>
          {renderActiveModule()}
        </section>

        <footer className="app-footer">
          <span>© {new Date().getFullYear()} CampusConnect</span>
          <span>Made for smarter campus life ✦</span>
        </footer>
      </main>
    </div>
  );
}

export default App;

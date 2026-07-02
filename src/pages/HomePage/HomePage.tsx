import { useEffect, useRef, useState } from "react";
import {
  CaretDown,
  Cube,
  List,
  Moon,
  SignOut,
  Sun,
  Users,
  Warning,
} from "@phosphor-icons/react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { setDangerModeEnabled } from "../../store/service";
import "./HomePage.css";
import { Button } from "../../components/Button/Button";

type HomePageProps = {
  onLogout: () => void;
};

function HomePage({ onLogout }: HomePageProps) {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "light" ? "light" : "dark";
  });
  const [isDangerModeEnabled, setIsDangerModeEnabled] = useState<boolean>(() => {
    return localStorage.getItem("dangerMode") === "true";
  });
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const syncSidebarByViewport = () => {
      if (window.innerWidth > 1200) {
        setIsSidebarOpen(false);
      }
    };

    syncSidebarByViewport();
    window.addEventListener("resize", syncSidebarByViewport);

    return () => window.removeEventListener("resize", syncSidebarByViewport);
  }, []);

  useEffect(() => {
    if (window.innerWidth <= 1200 && isSidebarOpen) {
      document.body.style.overflow = "hidden";
      return;
    }

    document.body.style.overflow = "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    setDangerModeEnabled(isDangerModeEnabled);
    localStorage.setItem("dangerMode", String(isDangerModeEnabled));
  }, [isDangerModeEnabled]);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="dashboard-page">
      <header className="dashboard-topbar">
        <div className="topbar-left">
          <button
            type="button"
            className="sidebar-toggle"
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
            aria-expanded={isSidebarOpen}
            aria-controls="dashboard-sidebar"
          >
            <List size={20} />
          </button>
          <img
            src="/orqa-logo-only.png"
            alt="Orqa Logo"
            width={40}
            height={40}
          />
        </div>
        <div className="topbar-right">
          <Button
            type="button"
            buttonStyle={isDangerModeEnabled ? "Primary" : "Secondary"}
            onClick={() => setIsDangerModeEnabled((prev) => !prev)}
            aria-pressed={isDangerModeEnabled}
            aria-label="Toggle danger mode"
          >
            <Warning size={16} weight="fill" />
            <span className="danger-toggle-text">
              {isDangerModeEnabled ? "Danger Mode ON" : "Danger Mode OFF"}
            </span>
          </Button>
          {isDangerModeEnabled && (
            <span className="danger-mode-note" role="status" aria-live="polite">
              All requests will fail intentionally
            </span>
          )}
          <div className="user-menu" ref={menuRef}>
            <button
              className="user-menu-button"
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-expanded={isMenuOpen}
              aria-label="Open user menu"
            >
              <div className="user-pill">AK</div>
              <span className="user-name">Ana Kostić</span>
              <CaretDown
                size={14}
                className={`user-menu-caret ${isMenuOpen ? "open" : ""}`}
              />
            </button>

            {isMenuOpen && (
              <div className="user-menu-dropdown" role="menu">
                <p className="menu-section-title">Theme</p>
                <button
                  type="button"
                  className={`theme-option ${theme === "dark" ? "active" : ""}`}
                  onClick={() => setTheme("dark")}
                  role="menuitem"
                >
                  <Moon size={16} />
                  <span>Dark</span>
                </button>
                <button
                  type="button"
                  className={`theme-option ${theme === "light" ? "active" : ""}`}
                  onClick={() => setTheme("light")}
                  role="menuitem"
                >
                  <Sun size={16} />
                  <span>Light</span>
                </button>
                <div className="menu-divider" />
                <button
                  className="menu-action"
                  type="button"
                  onClick={onLogout}
                  role="menuitem"
                >
                  <SignOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="dashboard-shell">
        <aside
          id="dashboard-sidebar"
          className={`dashboard-sidebar${isSidebarOpen ? " open" : ""}`}
          aria-label="Sidebar navigation"
        >
          <NavLink
            end
            to="/"
            className={({ isActive }) =>
              `nav-item${isActive || location.pathname.startsWith("/orders") ? " active" : ""}`
            }
            onClick={() => setIsSidebarOpen(false)}
          >
            <Cube size={20} weight="regular" />
            <span>Order managment</span>
          </NavLink>
          <NavLink
            to="/users"
            className={({ isActive }) =>
              `nav-item${isActive || location.pathname.startsWith("/users") ? " active" : ""}`
            }
            onClick={() => setIsSidebarOpen(false)}
          >
            <Users size={20} weight="regular" />
            <span>User managment</span>
          </NavLink>
        </aside>

        {isSidebarOpen && (
          <button
            type="button"
            className="sidebar-backdrop"
            aria-label="Close sidebar"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default HomePage;

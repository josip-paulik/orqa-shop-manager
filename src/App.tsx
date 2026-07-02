import { type ReactNode, useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import HomePage from "./pages/HomePage/HomePage";
import LoginPage from "./pages/LoginPage/LoginPage";
import OrdersPage from "./pages/OrdersPage/OrdersPage";
import UserManagementPage from "./pages/UserManagementPage/UserManagementPage";
import OrderFormPage from "./pages/OrderFormPage/OrderFormPage";
import UserFormPage from "./pages/UserFormPage/UserFormPage";

type AuthGuardProps = {
  isAuthenticated: boolean;
  children: ReactNode;
};

function RequireAuth({ isAuthenticated, children }: AuthGuardProps) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function PublicOnly({ isAuthenticated, children }: AuthGuardProps) {
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function PageTitleManager() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;

    if (path === "/login") {
      document.title = "Login | ORQA Dashboard";
      return;
    }

    if (path === "/users") {
      document.title = "User Management | ORQA Dashboard";
      return;
    }

    if (path === "/") {
      document.title = "Order Management | ORQA Dashboard";
      return;
    }

    if (path === "/orders/new") {
      document.title = "Create Order | ORQA Dashboard";
      return;
    }

    if (path.startsWith("/orders/") && path.endsWith("/edit")) {
      document.title = "Edit Order | ORQA Dashboard";
      return;
    }

    if (path === "/users/new") {
      document.title = "Invite User | ORQA Dashboard";
      return;
    }

    if (path.startsWith("/users/") && path.endsWith("/edit")) {
      document.title = "Edit User | ORQA Dashboard";
      return;
    }

    document.title = "ORQA Dashboard";
  }, [location.pathname]);

  return null;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem("isAuthenticated") === "true",
  );

  const handleLogin = async (email: string, password: string) => {
    if (!email.trim() || !password.trim()) {
      return;
    }

    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, 900);
    });

    localStorage.setItem("isAuthenticated", "true");
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    setIsAuthenticated(false);
  };

  return (
    <>
      <PageTitleManager />
      <Routes>
        <Route
          path="/login"
          element={
            <PublicOnly isAuthenticated={isAuthenticated}>
              <LoginPage onLogin={handleLogin} />
            </PublicOnly>
          }
        />
        <Route
          path="/"
          element={
            <RequireAuth isAuthenticated={isAuthenticated}>
              <HomePage onLogout={handleLogout} />
            </RequireAuth>
          }
        >
          <Route index element={<OrdersPage />} />
          <Route path="orders/new" element={<OrderFormPage />} />
          <Route path="orders/:orderId/edit" element={<OrderFormPage />} />
          <Route path="users" element={<UserManagementPage />} />
          <Route path="users/new" element={<UserFormPage />} />
          <Route path="users/:userId/edit" element={<UserFormPage />} />
        </Route>
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />}
        />
      </Routes>
    </>
  );
}

export default App;

import { useEffect, useMemo, useState } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import {
  createUser,
  deleteUser,
  getUserById,
  loginUser,
  refreshToken,
  registerUser,
  updateUser
} from "./api";
import { AppLayout } from "./components/AppLayout";
import { sessionFromAccessToken } from "./session";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { MenuPage } from "./pages/MenuPage";
import { RegisterPage } from "./pages/RegisterPage";
import { UsersPage } from "./pages/UsersPage";

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

function AppContent() {
  const location = useLocation();
  const [accessToken, setAccessToken] = useState(localStorage.getItem("accessToken") || "");
  const [refreshTokenValue, setRefreshTokenValue] = useState(localStorage.getItem("refreshToken") || "");
  const [globalError, setGlobalError] = useState("");

  const sessionInfo = useMemo(() => {
    if (!accessToken) return null;
    return sessionFromAccessToken(accessToken);
  }, [accessToken]);

  useEffect(() => {
    setGlobalError("");
  }, [location.pathname]);

  useEffect(() => {
    const t = localStorage.getItem("accessToken");
    if (t && !sessionFromAccessToken(t)) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setAccessToken("");
      setRefreshTokenValue("");
    }
  }, []);

  function setTokens(response) {
    if (!response || typeof response !== "object") return;
    const newAccess = response.access_token ?? response.accessToken ?? "";
    const newRefresh = response.refresh_token ?? response.refreshToken;

    if (newAccess) {
      setAccessToken(newAccess);
      localStorage.setItem("accessToken", newAccess);
    }
    if (newRefresh !== undefined && newRefresh !== null) {
      setRefreshTokenValue(newRefresh);
      localStorage.setItem("refreshToken", newRefresh);
    }
  }

  function onLogout() {
    setAccessToken("");
    setRefreshTokenValue("");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }

  return (
    <AppLayout sessionInfo={sessionInfo} onLogout={onLogout} globalError={globalError}>
      <Routes>
        <Route path="/" element={<HomePage sessionInfo={sessionInfo} />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route
          path="/login"
          element={
            <LoginPage
              loginUser={loginUser}
              refreshTokenApi={refreshToken}
              setTokens={setTokens}
              refreshTokenValue={refreshTokenValue}
              setGlobalError={setGlobalError}
            />
          }
        />
        <Route
          path="/register"
          element={
            <RegisterPage
              registerUser={registerUser}
              createUser={createUser}
              setTokens={setTokens}
              setGlobalError={setGlobalError}
            />
          }
        />
        <Route
          path="/users"
          element={
            <UsersPage
              accessToken={accessToken}
              sessionInfo={sessionInfo}
              getUserById={getUserById}
              createUser={createUser}
              updateUser={updateUser}
              deleteUser={deleteUser}
              setGlobalError={setGlobalError}
            />
          }
        />
      </Routes>
    </AppLayout>
  );
}

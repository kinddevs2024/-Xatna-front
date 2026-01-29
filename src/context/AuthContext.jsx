import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user and token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData, authToken) => {
    console.log('[AuthContext] Login called with userData:', userData);
    console.log('[AuthContext] User role:', userData?.role);
    setUser(userData);
    setToken(authToken);
    localStorage.setItem("token", authToken);
    const userString = JSON.stringify(userData);
    console.log('[AuthContext] Saving to localStorage:', userString);
    localStorage.setItem("user", userString);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const isAuthenticated = () => {
    return !!token && !!user;
  };

  const isAdmin = () => {
    return user?.role === "ADMIN" || user?.role === "admin" || user?.isAdmin === true;
  };

  const isSuperAdmin = () => {
    return (
      user?.role === "SUPER_ADMIN" ||
      user?.role === "super_admin" ||
      user?.isSuperAdmin === true
    );
  };

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated,
    isAdmin,
    isSuperAdmin,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

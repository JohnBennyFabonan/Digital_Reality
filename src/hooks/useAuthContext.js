import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("customer");
    if (savedUser) setIsLoggedIn(true);
  }, []);

  const handleLoginSuccess = (userData) => {
    localStorage.setItem("customer", JSON.stringify(userData));
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("customer");   // <--- MUST CLEAR STORAGE
    setIsLoggedIn(false);                  // <--- UPDATE STATE
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, handleLoginSuccess, handleLogout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

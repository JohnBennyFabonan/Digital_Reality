import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const useAutoLogout = (timeoutMinutes = 20) => {
  const navigate = useNavigate();
  const timerRef = useRef(null);

  useEffect(() => {
    const logout = () => {
      const isCustomer = !!localStorage.getItem("customerUser");
      const isAdmin = !!localStorage.getItem("adminUser");
      const isStaff = !!localStorage.getItem("staffUser");
      const isAgent = !!localStorage.getItem("agentUser");

      console.log("Auto-logout triggered. User status:", {
        isCustomer, isAdmin, isStaff, isAgent
      });

      // Clear only the relevant user type
      if (isCustomer) {
        localStorage.removeItem("customerUser");
        localStorage.removeItem("isLoggedIn"); // Also remove this
        localStorage.removeItem("customer_token"); // And this
        alert("Session expired. You've been logged out due to inactivity.");
        navigate("/");
      } else if (isAdmin) {
        localStorage.removeItem("adminUser");
        alert("Session expired. You've been logged out due to inactivity.");
        navigate("/realestate-login");
      } else if (isStaff) {
        localStorage.removeItem("staffUser");
        alert("Session expired. You've been logged out due to inactivity.");
        navigate("/realestate-login");
      } else if (isAgent) {
        localStorage.removeItem("agentUser");
        alert("Session expired. You've been logged out due to inactivity.");
        navigate("/realestate-login");
      }
      // If no user found, do nothing
    };

    const resetTimer = () => {
      // Clear existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      
      // Set new timer only if user is logged in
      const hasUser = localStorage.getItem("customerUser") || 
                     localStorage.getItem("adminUser") || 
                     localStorage.getItem("staffUser") || 
                     localStorage.getItem("agentUser");
      
      if (hasUser) {
        timerRef.current = setTimeout(logout, timeoutMinutes * 60 * 1000);
        console.log("Activity detected - timer reset");
      }
    };

    // Initial timer setup with a small delay to ensure component is mounted
    const initialTimer = setTimeout(() => {
      resetTimer();
    }, 1000);

    // User activities to reset timer
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    // Also reset on visibility change (when user switches back to tab)
    window.addEventListener("visibilitychange", resetTimer);

    return () => {
      clearTimeout(initialTimer);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      window.removeEventListener("visibilitychange", resetTimer);
    };
  }, [navigate, timeoutMinutes]);
};

export default useAutoLogout;
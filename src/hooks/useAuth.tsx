
import { useState, useEffect, createContext, useContext } from "react";

export interface User {
  id: string;
  username: string;
  role: "User" | "Admin";
  displayName: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("dashboard-user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Mock authentication - in real app, this would call your API
    if (username === "admin" && password === "admin") {
      const userData: User = {
        id: "1",
        username: "admin",
        role: "Admin",
        displayName: "System Administrator"
      };
      setUser(userData);
      localStorage.setItem("dashboard-user", JSON.stringify(userData));
      return true;
    } else if (username === "user" && password === "user") {
      const userData: User = {
        id: "2",
        username: "user",
        role: "User",
        displayName: "Regular User"
      };
      setUser(userData);
      localStorage.setItem("dashboard-user", JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("dashboard-user");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

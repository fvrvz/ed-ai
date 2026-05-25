import { AuthContext } from "@/contexts/AuthContext";
import { AuthContextValue } from "@/types/auth";
import { useContext } from "react";

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
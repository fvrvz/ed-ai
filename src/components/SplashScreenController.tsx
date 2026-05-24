import { useAuth } from "@/contexts/AuthContext";
import { SplashScreen } from "expo-router";
import { useEffect } from "react";

export function SplashScreenController() {
  const { loading } = useAuth();

  useEffect(() => {
    async function preventAutoHide() {
      try {
        await SplashScreen.preventAutoHideAsync();
      } catch (error) {
        console.warn("Unable to prevent splash auto hide:", error);
      }
    }

    preventAutoHide();
  }, []);

  useEffect(() => {
    async function hideSplash() {
      if (!loading) {
        try {
          await SplashScreen.hideAsync();
        } catch (error) {
          console.warn("Unable to hide splash screen:", error);
        }
      }
    }

    hideSplash();
  }, [loading]);

  return null;
}

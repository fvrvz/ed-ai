import { StyleSheet } from "react-native";

export const colors = {
  primary: "#007AFF",
  secondary: "#5856D6",
  background: "#F5F5F5",
  text: "#333333",
  textSecondary: "#666666",
  success: "#34C759",
  error: "#FF3B30",
  warning: "#FF9500",
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  text: {
    color: colors.text,
    fontSize: 16,
  },
  textSecondary: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  header: {
    paddingVertical: 5,
    marginBottom: 20,
  },
  heading: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: "bold",
  },
  title: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: "600",
  },
  link: {
    color: colors.primary,
    fontSize: 16,
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.textSecondary,
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
  },
});

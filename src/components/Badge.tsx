import { VariantMap } from "@/styles/global";
import { StyleSheet, Text, View } from "react-native";

type BadgeProps = {
  children: string;
  color?: string;
  variant?: "success" | "error" | "warning" | "info" | "default";
  type?: "outline" | "solid" | "default";
};

export default function Badge({
  children,
  color,
  variant = "default",
  type = "default",
}: BadgeProps) {
  const currentColor = color || VariantMap[variant];
  const bgColor = type === "default" ? currentColor + "20" : currentColor;

  return (
    <View
      style={[
        styles.container,
        type !== "outline" && { backgroundColor: bgColor },
        type !== "solid" && { borderWidth: 0.5, borderColor: currentColor },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: type === "solid" ? "#fff" : currentColor,
          },
        ]}
      >
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  text: { fontSize: 12, fontWeight: "bold" },
});

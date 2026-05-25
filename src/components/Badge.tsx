import { Text, View } from "react-native";

type BadgeProps = {
  text: string;
  color?: string;
  variant?: "success" | "error" | "warning" | "info";
};

export function getBackgroundColor(
  color?: string,
  variant?: BadgeProps["variant"],
) {
  if (color) return color;
  switch (variant) {
    case "success":
      return "#4CAF50";
    case "error":
      return "#F44336";
    case "warning":
      return "#FF9800";
    case "info":
      return "#2196F3";
    default:
      return "#4CAF50";
  }
}

export default function Badge({ text, color, variant }: BadgeProps) {
  return (
    <View
      style={{
        backgroundColor: getBackgroundColor(color, variant),
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        alignSelf: "flex-start",
      }}
    >
      <Text style={{ color: "#fff", fontSize: 12, fontWeight: "bold" }}>
        {text}
      </Text>
    </View>
  );
}

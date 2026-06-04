import { Text, View } from "react-native";

type BadgeProps = {
  text: string;
  color?: string;
  variant?: "success" | "error" | "warning" | "info";
  outline?: boolean;
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

export default function Badge({
  text,
  color,
  variant,
  outline = false,
}: BadgeProps) {
  const currentColor = getBackgroundColor(color, variant);

  return (
    <View
      style={[
        {
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 4,
          alignSelf: "flex-start",
        },
        outline
          ? { borderWidth: 1, borderColor: currentColor }
          : { backgroundColor: currentColor },
      ]}
    >
      <Text
        style={{
          color: outline ? currentColor : "#fff",
          fontSize: 12,
          fontWeight: "bold",
        }}
      >
        {text}
      </Text>
    </View>
  );
}

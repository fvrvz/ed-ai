import { VariantMap } from "@/styles/global";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

type Prop = {
  style?: StyleProp<ViewStyle>;
  variant?: "success" | "error" | "warning" | "info" | "default";
  children: string;
};

export default function Alert({ style, children, variant = "default" }: Prop) {
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: VariantMap[variant] + "20",
          borderColor: VariantMap[variant],
        },
        style,
      ]}
    >
      <Text style={[{ color: VariantMap[variant] }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 10,
    borderWidth: 0.2,
  },
});

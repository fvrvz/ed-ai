import { PropsWithChildren } from "react";
import { StyleProp, Text, TextStyle } from "react-native";

type TitleProps = PropsWithChildren & { style?: StyleProp<TextStyle> };

export default function Title({ children, style }: TitleProps) {
  return (
    <Text
      style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16, ...style }}
    >
      {children}
    </Text>
  );
}

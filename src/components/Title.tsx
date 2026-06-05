import { StyleProp, Text, TextStyle } from "react-native";

type TitleProps = { style?: StyleProp<TextStyle>; children: string };

export default function Title({ children, style }: TitleProps) {
  return (
    <Text
      style={{ fontSize: 24, fontWeight: "bold", ...style }}
      numberOfLines={1}
    >
      {children}
    </Text>
  );
}

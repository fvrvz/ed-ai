import { StyleProp, Text, View, ViewStyle } from "react-native";

type CourseCardProps = {
  title: string;
  description: string;
  style?: StyleProp<ViewStyle>;
};

export default function CourseCard({
  title,
  description,
  style,
}: CourseCardProps) {
  return (
    <View
      style={[
        {
          padding: 15,
          borderRadius: 8,
          backgroundColor: "#f0f0f0",
        },
        style,
      ]}
    >
      <Text>{title}</Text>
      <Text>{description}</Text>
    </View>
  );
}

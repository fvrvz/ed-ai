import { Row, Spacer, Text } from "@expo/ui";
import { PropsWithChildren } from "react";

type Prop = {
  label: string;
};

export default function LabeledRow({
  label,
  children,
}: PropsWithChildren<Prop>) {
  return (
    <Row alignment="center" spacing={16}>
      <Text>{label}</Text>
      <Spacer flexible />
      {children}
    </Row>
  );
}

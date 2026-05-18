import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

type Props = TextInputProps & {
  label: string;
};

export default function AuthInput({ label, ...props }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <TextInput placeholderTextColor="#999" style={styles.input} {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,

    paddingHorizontal: 16,
    paddingVertical: 14,

    fontSize: 16,

    backgroundColor: "#fff",
  },
});

import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
};

export default function AuthButton({ title, onPress, loading }: Props) {
  return (
    <TouchableOpacity
      style={[styles.button, loading && styles.disabled]}
      disabled={loading}
      onPress={onPress}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 54,

    backgroundColor: "#111",

    borderRadius: 12,

    alignItems: "center",
    justifyContent: "center",
  },

  disabled: {
    opacity: 0.6,
  },

  text: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

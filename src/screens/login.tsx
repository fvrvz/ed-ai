import AuthButton from "@/components/AuthButton";
import AuthInput from "@/components/AuthInput";
import { useAuth } from "@/hooks/useAuth";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function LoginScreen() {
  const { signInWithEmail } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing fields", "Please enter email and password");

      return;
    }

    try {
      setLoading(true);

      await signInWithEmail(email.trim(), password);
    } catch (error: any) {
      Alert.alert("Login failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        <Image
          source={require("@/assets/expo.icon/Assets/vector/default-monochrome.svg")}
          style={{
            width: 100,
            height: 100,
            alignSelf: "center",
            marginVertical: 24,
          }}
        />
        <View style={styles.header}>
          <Text style={styles.title}>Welcome back</Text>

          <Text style={styles.subtitle}>Login to continue</Text>
        </View>

        <View style={styles.form}>
          <AuthInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            placeholder="john@example.com"
          />

          <AuthInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
            placeholder="••••••••"
          />

          <AuthButton title="Login" loading={loading} onPress={handleLogin} />
          <Link href="/register" style={styles.link}>
            Don't have an account? Sign up
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  container: {
    flex: 1,
    marginTop: 80,
    paddingHorizontal: 24,

    justifyContent: "center",

    backgroundColor: "#f8f8f8",
  },

  header: {
    marginBottom: 40,
  },

  title: {
    fontSize: 32,
    fontWeight: "700",

    color: "#111",
  },

  subtitle: {
    marginTop: 8,

    fontSize: 16,

    color: "#666",
  },

  form: {
    gap: 18,
  },

  link: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "500",
  },
});

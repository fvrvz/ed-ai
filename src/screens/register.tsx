import { Image } from "expo-image";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import AuthButton from "@/components/AuthButton";
import AuthInput from "@/components/AuthInput";

import { useAuth } from "@/contexts/AuthContext";
import { Link } from "expo-router";

export default function RegisterScreen() {
  const { signUpWithEmail } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const validatePhone = (value: string) => {
    return /^\+[1-9]\d{7,14}$/.test(value);
  };

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password) {
      Alert.alert("Missing fields", "Please fill all required fields");

      return;
    }

    if (phone && !validatePhone(phone)) {
      Alert.alert(
        "Invalid phone",
        "Use international format like +919876543210",
      );

      return;
    }

    try {
      setLoading(true);

      await signUpWithEmail({
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
      });

      Alert.alert("Success", "Please check your email to verify your account.");
    } catch (error: any) {
      Alert.alert("Registration failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <Image
            source={require("@/assets/expo.icon/Assets/vector/default-monochrome.svg")}
            style={{
              width: 100,
              height: 100,
              alignSelf: "center",
              marginBottom: 24,
            }}
          />
          <View style={styles.header}>
            <Text style={styles.title}>Create account</Text>

            <Text style={styles.subtitle}>Register to continue</Text>
          </View>

          <View style={styles.form}>
            <AuthInput
              label="First Name"
              value={firstName}
              onChangeText={setFirstName}
              placeholder="John"
            />

            <AuthInput
              label="Last Name"
              value={lastName}
              onChangeText={setLastName}
              placeholder="Doe"
            />

            <AuthInput
              label="Phone"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="+919876543210"
            />

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
              autoComplete="password-new"
              placeholder="••••••••"
            />

            <AuthButton
              title="Create Account"
              loading={loading}
              onPress={handleRegister}
            />
            <Link href="/" style={styles.link}>
              Already have an account? Sign in
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  scroll: {
    flexGrow: 1,
  },

  container: {
    flex: 1,
    marginTop: 80,
    paddingHorizontal: 24,
    paddingVertical: 48,

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
    marginTop: 12,
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "500",
  },
});

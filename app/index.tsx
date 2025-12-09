import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import * as SecureStore from "expo-secure-store";
import { API_BASE } from "../lib/config";
import TextToSpeech from "../components/TextToSpeech";

export default function LoginScreen() {
  const router = useRouter();
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState<
    "enumerator" | "beneficiary"
  >("beneficiary");

  const handleLogin = async () => {
    if (!mobile || !password) {
      alert("Please enter Mobile and Password");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: mobile, password }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = err?.error || "Login failed";
        alert(msg);
        return;
      }

      const data = await res.json();
      const { token, user } = data;

      // Persist token and user securely
      await SecureStore.setItemAsync("auth_token", token);
      await SecureStore.setItemAsync("auth_user", JSON.stringify(user));

      // Decide route from backend role if present; fallback to selectedRole
      const backendRole = user?.role;
      let roleForNav: "enumerator" | "beneficiary" = selectedRole;
      if (backendRole === "enumerator") roleForNav = "enumerator";
      if (backendRole === "beneficary") roleForNav = "beneficiary";

      if (roleForNav === "enumerator") {
        router.replace("/device-check");
      } else {
        router.replace("/beneficiary/dashboard");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Network error";
      alert(`Network error: ${msg}`);
      console.error("Login network error", e);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "padding"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20} // Adjust this value as needed
    >
      <StatusBar barStyle="light-content" />

      {/* TOP SECTION: Orange Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.logoText}>सहाय</Text>
          <Text style={styles.taglineMain}>
            Access Government Welfare Schemes Effortlessly
          </Text>
          <Text style={styles.taglineSub}>
            The AI co-pilot that sharpens your clinical insights and delivers
            benefits to the last mile.
          </Text>
        </View>
      </View>

      {/* BOTTOM SECTION: White Form Card */}
      <View style={styles.formContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Form Header */}
          <Text style={styles.welcomeText}>Welcome To सहाय</Text>
          <View style={styles.signUpRow}>
            <Text style={styles.greyText}>New here? </Text>
            <TouchableOpacity onPress={() => router.replace("/signup")}>
              <Text style={styles.linkText}>Sign up</Text>
            </TouchableOpacity>
          </View>

          {/* Role Selector */}
          <Text style={styles.roleLabel}>I am a:</Text>
          <View style={styles.roleSelector}>
            <TouchableOpacity
              style={[
                styles.roleOption,
                selectedRole === "beneficiary" && styles.roleSelected,
              ]}
              onPress={() => setSelectedRole("beneficiary")}
            >
              <Ionicons
                name="person"
                size={24}
                color={selectedRole === "beneficiary" ? "#fff" : "#d97706"}
              />
              <Text
                style={[
                  styles.roleText,
                  selectedRole === "beneficiary" && styles.roleTextSelected,
                ]}
              >
                Beneficiary
              </Text>
              <Text
                style={[
                  styles.roleSubtext,
                  selectedRole === "beneficiary" && styles.roleTextSelected,
                ]}
              >
                (लाभार्थी)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleOption,
                selectedRole === "enumerator" && styles.roleSelected,
              ]}
              onPress={() => setSelectedRole("enumerator")}
            >
              <Ionicons
                name="clipboard"
                size={24}
                color={selectedRole === "enumerator" ? "#fff" : "#d97706"}
              />
              <Text
                style={[
                  styles.roleText,
                  selectedRole === "enumerator" && styles.roleTextSelected,
                ]}
              >
                Enumerator
              </Text>
              <Text
                style={[
                  styles.roleSubtext,
                  selectedRole === "enumerator" && styles.roleTextSelected,
                ]}
              >
                (फील्ड वर्कर)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Inputs */}
          <View style={styles.inputGroup}>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>
                Your Mobile Number<Text style={styles.redStar}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: 9876543210"
                placeholderTextColor="#9ca3af"
                keyboardType="phone-pad"
                value={mobile}
                onChangeText={setMobile}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>
                Password<Text style={styles.redStar}>*</Text>
              </Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter Password"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={!isPasswordVisible}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={isPasswordVisible ? "eye" : "eye-off"}
                    size={24}
                    color="#6b7280"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>

          <Text style={styles.footerText}>Powered by PM-AJAY • MoSJE</Text>
        </ScrollView>
      </View>

      <TextToSpeech content="Welcome to Sahay. Access Government Welfare Schemes Effortlessly. The AI co-pilot that delivers benefits to the last mile. Select your role: Beneficiary or Enumerator. Enter your mobile number and password to login. Powered by PM-AJAY Ministry of Social Justice and Empowerment." />
    </KeyboardAvoidingView>
  );
}

// STANDARD STYLES (No Config Needed)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    height: "45%",
    backgroundColor: "#d97706", // Amber-600 / Sahay Orange
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingTop: 40,
  },
  headerContent: {
    marginBottom: 20,
  },
  logoText: {
    fontSize: 48,
    fontWeight: "800", // Extra Bold
    color: "#fff",
    marginBottom: 8,
  },
  taglineMain: {
    fontSize: 24,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.95)",
    lineHeight: 32,
  },
  taglineSub: {
    fontSize: 14,
    marginTop: 12,
    color: "rgba(255, 255, 255, 0.8)",
    lineHeight: 20,
  },
  formContainer: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: -48, // Pulls the white card up
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    paddingHorizontal: 32,
    paddingTop: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5, // Shadow for Android
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937", // Gray-800
    marginBottom: 8,
  },
  signUpRow: {
    flexDirection: "row",
    marginBottom: 32,
    alignItems: "center",
  },
  greyText: {
    color: "#6b7280",
    fontWeight: "500",
  },
  linkText: {
    color: "#d97706",
    fontWeight: "bold",
    fontSize: 18,
  },
  inputGroup: {
    gap: 20, // Space between inputs
  },
  inputWrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    marginLeft: 4,
  },
  redStar: {
    color: "#ef4444",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#1f2937",
  },
  loginButton: {
    width: "100%",
    backgroundColor: "#d97706",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 32,
    shadowColor: "#fdba74",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  loginButtonText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  footerText: {
    textAlign: "center",
    color: "#9ca3af",
    marginTop: 32,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  passwordContainer: {
    position: "relative",
    justifyContent: "center",
  },
  passwordInput: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    paddingRight: 50,
    fontSize: 16,
    color: "#1f2937",
  },
  eyeIcon: {
    position: "absolute",
    right: 12,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  roleSelector: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },
  roleOption: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#d97706",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  roleSelected: {
    backgroundColor: "#d97706",
    borderColor: "#d97706",
  },
  roleText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#d97706",
    marginTop: 8,
  },
  roleTextSelected: {
    color: "#fff",
  },
  roleSubtext: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 2,
  },
});

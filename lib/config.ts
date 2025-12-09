import { Platform } from "react-native";

// Prefer EXPO_PUBLIC_API_BASE when provided (e.g., http://192.168.1.10:8081)
export const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE ||
  (Platform.OS === "android"
    ? "http://10.0.2.2:8081"
    : "http://localhost:8081");

import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Auth */}
      <Stack.Screen name="index" />

      {/* Common */}
      <Stack.Screen name="dash-board" />
      <Stack.Screen name="device-check" />
      <Stack.Screen name="add-beneficiary" />
      <Stack.Screen name="sync" />

      {/* Enumerator Routes */}
      <Stack.Screen name="enumerator/dashboard" />
      <Stack.Screen name="enumerator/survey/index" />
      <Stack.Screen name="enumerator/delivery" />
      <Stack.Screen name="enumerator/audit" />

      {/* Beneficiary Routes */}
      <Stack.Screen name="beneficiary/dashboard" />
      <Stack.Screen name="beneficiary/apply" />
      <Stack.Screen name="beneficiary/khata" />
      <Stack.Screen name="beneficiary/loan-certificate" />
    </Stack>
  );
}
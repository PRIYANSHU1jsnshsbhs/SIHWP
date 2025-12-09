import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import TextToSpeech from '../components/TextToSpeech';

export default function ImpactAudit() {
  const router = useRouter();
  const [currentIncome, setCurrentIncome] = useState('');

  // MOCK DATA (Baseline income from 2023)
  const baselineIncome = 4000;

  // Calculate Growth dynamically
  const current = parseInt(currentIncome) || 0;
  const growth = current - baselineIncome;
  const isPositive = growth > 0;
  const percentage = baselineIncome > 0 ? ((growth / baselineIncome) * 100).toFixed(1) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Impact Audit: Ravi Kumar</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>

        {/* COMPARISON CARD */}
        <View style={styles.card}>
          <View style={styles.row}>
            {/* LEFT: OLD DATA */}
            <View style={styles.half}>
              <Text style={styles.label}>Baseline (2023)</Text>
              <Text style={styles.valueGray}>₹{baselineIncome}</Text>
              <Text style={styles.sub}>Monthly Income</Text>
            </View>

            <View style={styles.divider} />

            {/* RIGHT: NEW DATA */}
            <View style={styles.half}>
              <Text style={styles.label}>Current (2024)</Text>
              <TextInput
                style={styles.input}
                placeholder="Type Here"
                keyboardType="numeric"
                value={currentIncome}
                onChangeText={setCurrentIncome}
              />
            </View>
          </View>

          {/* DYNAMIC RESULT BANNER */}
          {currentIncome !== '' && (
            <View style={[styles.resultBanner, { backgroundColor: isPositive ? '#d1fae5' : '#fee2e2' }]}>
              <Ionicons name={isPositive ? "trending-up" : "trending-down"} size={24} color={isPositive ? "#059669" : "#dc2626"} />
              <Text style={[styles.resultText, { color: isPositive ? "#059669" : "#dc2626" }]}>
                {isPositive ? `Income grew by ${percentage}%` : `Income dropped by ${Math.abs(Number(percentage))}%`}
              </Text>
            </View>
          )}
        </View>

        {/* EVIDENCE UPLOAD BUTTONS */}
        <Text style={styles.sectionTitle}>Required Evidence</Text>

        <TouchableOpacity style={styles.uploadBtn}>
          <Ionicons name="camera" size={24} color="#4b5563" />
          <Text style={styles.uploadText}>Take Photo of Shop / Asset</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.uploadBtn}>
          <Ionicons name="videocam" size={24} color="#4b5563" />
          <Text style={styles.uploadText}>Record 15s Testimonial</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.submitBtn} onPress={() => router.back()}>
          <Text style={styles.submitText}>Submit Audit Report</Text>
        </TouchableOpacity>

      </ScrollView>

      <TextToSpeech content={`Impact Audit for Ravi Kumar. Baseline income from 2023 was ${baselineIncome} rupees per month. Enter current monthly income for 2024 below. ${currentIncome ? (isPositive ? `Income grew by ${percentage} percent.` : `Income dropped by ${Math.abs(Number(percentage))} percent.`) : ''} Required Evidence: Take photo of shop or asset. Record 15 second testimonial video. Then submit the audit report.`} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { backgroundColor: '#db2777', padding: 20, paddingTop: 50, flexDirection: 'row', alignItems: 'center', gap: 15 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 20, elevation: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  half: { flex: 1, alignItems: 'center' },
  divider: { width: 1, backgroundColor: '#e5e7eb' },
  label: { fontSize: 14, color: '#6b7280', marginBottom: 5 },
  valueGray: { fontSize: 24, fontWeight: 'bold', color: '#9ca3af' },
  sub: { fontSize: 12, color: '#9ca3af' },
  input: { fontSize: 24, fontWeight: 'bold', color: '#1f2937', borderBottomWidth: 1, borderColor: '#d1d5db', textAlign: 'center', width: '80%' },
  resultBanner: { marginTop: 20, padding: 10, borderRadius: 8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  resultText: { fontWeight: 'bold', fontSize: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, marginTop: 10 },
  uploadBtn: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 10, alignItems: 'center', gap: 10 },
  uploadText: { color: '#374151', fontWeight: '500' },
  submitBtn: { backgroundColor: '#db2777', padding: 18, borderRadius: 12, marginTop: 20, alignItems: 'center' },
  submitText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
});
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import TextToSpeech from '../components/TextToSpeech';

export default function Dashboard() {
  const router = useRouter();

  // ROUTING FUNCTIONS
  const goToAdd = () => router.push('/add-beneficiary');
  const goToSync = () => router.push('/sync');

  // Navigate to the new pages
  // We use 'as any' to silence TypeScript errors if pages aren't detected yet
  const goToVerify = () => router.push('/verify-delivery' as any);
  const goToAudit = () => router.push('/impact-audit' as any);

  const handleLogout = () => router.replace('/'); // Go back to Login

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#d97706" />

      {/* ONE SCROLLVIEW FOR EVERYTHING */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* 1. TOP HEADER SECTION (Orange Background) */}
        <View style={styles.headerContainer}>
          <View style={styles.headerTopRow}>
            <View>
              <Text style={styles.welcomeLabel}>Welcome Back,</Text>
              <Text style={styles.username}>Field Officer</Text>
            </View>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <Ionicons name="log-out-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. STATS CARDS (Floating Effect using Negative Margin) */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#dbeafe' }]}>
              <Ionicons name="people" size={24} color="#2563eb" />
            </View>
            <Text style={styles.statNumber}>128</Text>
            <Text style={styles.statLabel}>Total Verified</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#fee2e2' }]}>
              <Ionicons name="cloud-offline" size={24} color="#dc2626" />
            </View>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>Pending Sync</Text>
          </View>
        </View>

        {/* 3. ACTION BUTTONS LIST */}
        <View style={styles.actionList}>
          <Text style={styles.sectionTitle}>Field Operations</Text>

          {/* NEW REGISTRATION */}
          <TouchableOpacity style={styles.bigActionCard} onPress={goToAdd}>
            <View style={[styles.actionIcon, { backgroundColor: '#fef3c7' }]}>
              <Ionicons name="person-add" size={32} color="#d97706" />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>New Registration</Text>
              <Text style={styles.actionSubtitle}>Add a beneficiary offline</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#d97706" />
          </TouchableOpacity>

          {/* VERIFY DELIVERY */}
          <TouchableOpacity style={styles.bigActionCard} onPress={goToVerify}>
            <View style={[styles.actionIcon, { backgroundColor: '#e0e7ff' }]}>
              <Ionicons name="qr-code" size={32} color="#4f46e5" />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Verify Delivery</Text>
              <Text style={styles.actionSubtitle}>Scan Asset + Geo-Check</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#4f46e5" />
          </TouchableOpacity>

          {/* IMPACT AUDIT */}
          <TouchableOpacity style={styles.bigActionCard} onPress={goToAudit}>
            <View style={[styles.actionIcon, { backgroundColor: '#fce7f3' }]}>
              <Ionicons name="trending-up" size={32} color="#db2777" />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Impact Audit</Text>
              <Text style={styles.actionSubtitle}>Track Income Growth</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#db2777" />
          </TouchableOpacity>

          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Data Management</Text>

          {/* SYNC DATA */}
          <TouchableOpacity style={styles.bigActionCard} onPress={goToSync}>
            <View style={[styles.actionIcon, { backgroundColor: '#d1fae5' }]}>
              <Ionicons name="cloud-upload" size={32} color="#059669" />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Sync Data</Text>
              <Text style={styles.actionSubtitle}>Upload pending records</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#059669" />
          </TouchableOpacity>

          {/* VIEW REPORTS */}
          <TouchableOpacity style={styles.bigActionCard}>
            <View style={[styles.actionIcon, { backgroundColor: '#f3f4f6' }]}>
              <Ionicons name="stats-chart" size={32} color="#4b5563" />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>View Reports</Text>
              <Text style={styles.actionSubtitle}>Check district progress</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
          </TouchableOpacity>
        </View>

      </ScrollView>

      <TextToSpeech content="Welcome to Field Officer Dashboard. Total Verified: 128, Pending Sync: 5. Field Operations: New Registration to add a beneficiary offline. Verify Delivery to scan asset and geo-check. Impact Audit to track income growth. Data Management: Sync Data to upload pending records. View Reports to check district progress." />
    </View >
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  scrollContent: { paddingBottom: 40 }, // Adds space at the very bottom

  // 1. Header Styles
  headerContainer: {
    backgroundColor: '#d97706', // Sahay Orange
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 60, // Space for the overlapping cards
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 16 },
  username: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  logoutButton: { padding: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12 },

  // 2. Stats Styles (The Floating Cards)
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: -40, // THIS PULLS THE CARDS UP over the orange header
  },
  statCard: {
    backgroundColor: '#fff',
    width: '47%',
    padding: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  iconCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
  statLabel: { fontSize: 12, color: '#6b7280', marginTop: 4 },

  // 3. Action List Styles
  actionList: {
    paddingHorizontal: 20,
    marginTop: 20, // Space between stats and first button
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#374151', marginBottom: 16, marginLeft: 4 },

  bigActionCard: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: { width: 60, height: 60, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  actionTextContainer: { flex: 1 },
  actionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
  actionSubtitle: { fontSize: 13, color: '#9ca3af', marginTop: 2 },
});
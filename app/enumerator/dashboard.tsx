import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LocationSelector from '../../components/LocationSelector';
import TextToSpeech from '../../components/TextToSpeech';

type PendingApplication = {
    id: string;
    name: string;
    aadhaar: string;
    phone: string;
    address: string;
    status: string;
    submittedAt: string;
};

export default function EnumeratorDashboard() {
    const router = useRouter();
    const [modalVisible, setModalVisible] = useState(false);
    const [approvalsModalVisible, setApprovalsModalVisible] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);
    const [pendingApplications, setPendingApplications] = useState<PendingApplication[]>([]);

    // Quota & Gamification State
    const [quota, setQuota] = useState({ daily: 15, completed: 0 });
    const [streak, setStreak] = useState(0);
    const [totalPoints, setTotalPoints] = useState(0);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            // Load pending surveys count
            const pending = await AsyncStorage.getItem('pending_surveys');
            const surveys = pending ? JSON.parse(pending) : [];
            setPendingCount(surveys.filter((s: any) => s.syncStatus === 'PENDING').length);

            // Count today's completed surveys
            const today = new Date().toDateString();
            const todaysSurveys = surveys.filter((s: any) =>
                new Date(s.timestamp).toDateString() === today
            );
            setQuota(prev => ({ ...prev, completed: todaysSurveys.length }));

            // Load gamification stats
            const stats = await AsyncStorage.getItem('enumerator_stats');
            if (stats) {
                const { streak: s, points: p } = JSON.parse(stats);
                setStreak(s || 0);
                setTotalPoints(p || 0);
            }

            // Load pending applications from beneficiaries
            const apps = await AsyncStorage.getItem('pending_applications');
            const applications = apps ? JSON.parse(apps) : [];
            const pendingApps = applications.filter((a: any) => a.status === 'PENDING_VERIFICATION');
            setPendingApplications(pendingApps);
        } catch (e) {
            console.log('Error loading stats:', e);
        }
    };

    const handleApproval = async (id: string, approved: boolean) => {
        try {
            const apps = await AsyncStorage.getItem('pending_applications');
            const applications = apps ? JSON.parse(apps) : [];
            const updated = applications.map((a: any) =>
                a.id === id ? { ...a, status: approved ? 'APPROVED' : 'REJECTED' } : a
            );
            await AsyncStorage.setItem('pending_applications', JSON.stringify(updated));

            // Refresh list
            const pendingApps = updated.filter((a: any) => a.status === 'PENDING_VERIFICATION');
            setPendingApplications(pendingApps);

            Alert.alert(
                approved ? '✓ Approved' : '✗ Rejected',
                `Application has been ${approved ? 'approved' : 'rejected'}`
            );
        } catch (e) {
            console.log('Error:', e);
        }
    };

    const startSurvey = (location: any) => {
        setModalVisible(false);
        router.push('/enumerator/survey');
    };

    const handleLogout = () => {
        router.replace('/');
    };

    const progressPercent = Math.min(100, (quota.completed / quota.daily) * 100);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.welcome}>Welcome back,</Text>
                    <Text style={styles.name}>Enumerator</Text>
                </View>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.profileButton}>
                        <Ionicons name="person" size={24} color="#d97706" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Ionicons name="log-out-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Pending Applications Alert */}
                {pendingApplications.length > 0 && (
                    <TouchableOpacity
                        style={styles.alertCard}
                        onPress={() => setApprovalsModalVisible(true)}
                    >
                        <View style={styles.alertIcon}>
                            <Ionicons name="alert-circle" size={28} color="#fff" />
                            <View style={styles.alertBadge}>
                                <Text style={styles.alertBadgeText}>{pendingApplications.length}</Text>
                            </View>
                        </View>
                        <View style={styles.alertContent}>
                            <Text style={styles.alertTitle}>New Applications</Text>
                            <Text style={styles.alertSubtitle}>
                                {pendingApplications.length} beneficiaries awaiting verification
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="#fff" />
                    </TouchableOpacity>
                )}

                {/* Daily Progress Card */}
                <View style={styles.progressCard}>
                    <View style={styles.progressHeader}>
                        <Text style={styles.progressTitle}>Today's Progress</Text>
                        <View style={styles.streakBadge}>
                            <Ionicons name="flame" size={16} color="#f97316" />
                            <Text style={styles.streakText}>{streak} day streak</Text>
                        </View>
                    </View>

                    <View style={styles.progressBarContainer}>
                        <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
                    </View>

                    <View style={styles.progressStats}>
                        <Text style={styles.progressCount}>
                            <Text style={styles.progressBold}>{quota.completed}</Text>/{quota.daily} surveys
                        </Text>
                        <Text style={styles.progressRemaining}>
                            {quota.daily - quota.completed > 0
                                ? `${quota.daily - quota.completed} to go!`
                                : '🎉 Target hit!'}
                        </Text>
                    </View>

                    <View style={styles.pointsRow}>
                        <Ionicons name="star" size={18} color="#eab308" />
                        <Text style={styles.pointsText}>{totalPoints} points earned</Text>
                    </View>
                </View>

                {/* Main Actions */}
                <DashboardCard
                    title="Start New Survey"
                    subtitle="Begin a new beneficiary assessment"
                    icon="add-circle"
                    color="#d97706"
                    onPress={() => setModalVisible(true)}
                />

                <DashboardCard
                    title="Sync Pending Forms"
                    subtitle={`${pendingCount} forms waiting to upload`}
                    icon="cloud-upload"
                    color="#2563eb"
                    badge={pendingCount > 0 ? pendingCount : undefined}
                    onPress={() => alert('Syncing...')}
                />

                <DashboardCard
                    title="Asset Delivery"
                    subtitle="Deliver and link assets to beneficiaries"
                    icon="gift"
                    color="#7c3aed"
                    onPress={() => router.push('/enumerator/delivery')}
                />

                <DashboardCard
                    title="Impact Audit"
                    subtitle="Track beneficiary progress over time"
                    icon="analytics"
                    color="#0891b2"
                    onPress={() => router.push('/enumerator/audit')}
                />

                <DashboardCard
                    title="My Tasks"
                    subtitle="View assigned villages and targets"
                    icon="list"
                    color="#059669"
                    onPress={() => alert('Opening Tasks...')}
                />
            </ScrollView>

            {/* Location Modal */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Survey Setup</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#000" />
                            </TouchableOpacity>
                        </View>
                        <LocationSelector onSelect={startSurvey} />
                    </View>
                </View>
            </Modal>

            {/* Approvals Modal */}
            <Modal visible={approvalsModalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { maxHeight: '80%' }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Pending Applications</Text>
                            <TouchableOpacity onPress={() => setApprovalsModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#000" />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={pendingApplications}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <View style={styles.applicationCard}>
                                    <View style={styles.appInfo}>
                                        <Text style={styles.appName}>{item.name}</Text>
                                        <Text style={styles.appAadhaar}>{item.aadhaar}</Text>
                                        <Text style={styles.appPhone}>📞 {item.phone}</Text>
                                        <Text style={styles.appDate}>
                                            Applied: {new Date(item.submittedAt).toLocaleDateString()}
                                        </Text>
                                    </View>
                                    <View style={styles.appActions}>
                                        <TouchableOpacity
                                            style={styles.approveBtn}
                                            onPress={() => handleApproval(item.id, true)}
                                        >
                                            <Ionicons name="checkmark" size={20} color="#fff" />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.rejectBtn}
                                            onPress={() => handleApproval(item.id, false)}
                                        >
                                            <Ionicons name="close" size={20} color="#fff" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                            ListEmptyComponent={
                                <Text style={styles.emptyText}>No pending applications</Text>
                            }
                        />
                    </View>
                </View>
            </Modal>
            <TextToSpeech content={`Welcome back, Enumerator. Today's Progress: ${quota.completed} of ${quota.daily} surveys completed. ${quota.daily - quota.completed > 0 ? `${quota.daily - quota.completed} surveys remaining to hit target.` : 'Target achieved!'} You have ${streak} day streak and ${totalPoints} points earned. ${pendingApplications.length > 0 ? `Alert: ${pendingApplications.length} new applications awaiting verification.` : ''} Actions: Start New Survey, Sync ${pendingCount} Pending Forms, Asset Delivery, Impact Audit, My Tasks.`} />
        </View>
    );
}

const DashboardCard = ({ title, subtitle, icon, color, badge, onPress }: any) => (
    <TouchableOpacity style={styles.card} onPress={onPress}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
            <Ionicons name={icon} size={32} color={color} />
        </View>
        <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardSubtitle}>{subtitle}</Text>
        </View>
        {badge ? (
            <View style={styles.badge}>
                <Text style={styles.badgeText}>{badge}</Text>
            </View>
        ) : (
            <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
        )}
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9fafb' },
    header: {
        backgroundColor: '#fff',
        paddingHorizontal: 24, paddingTop: 60, paddingBottom: 24,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
    },
    welcome: { fontSize: 14, color: '#6b7280' },
    name: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
    headerActions: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
    },
    profileButton: {
        width: 48, height: 48, borderRadius: 24, backgroundColor: '#fff7ed',
        alignItems: 'center', justifyContent: 'center',
    },
    logoutButton: {
        width: 48, height: 48, borderRadius: 24, backgroundColor: '#ef4444',
        alignItems: 'center', justifyContent: 'center',
    },
    content: { padding: 24, gap: 16 },

    // Alert Card
    alertCard: {
        backgroundColor: '#ef4444',
        borderRadius: 16, padding: 16,
        flexDirection: 'row', alignItems: 'center', gap: 12,
        marginBottom: 8,
    },
    alertIcon: { position: 'relative' },
    alertBadge: {
        position: 'absolute', top: -6, right: -6,
        backgroundColor: '#fbbf24', borderRadius: 10,
        width: 20, height: 20, alignItems: 'center', justifyContent: 'center',
    },
    alertBadgeText: { color: '#000', fontSize: 11, fontWeight: 'bold' },
    alertContent: { flex: 1 },
    alertTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    alertSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },

    // Progress Card
    progressCard: {
        backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 8,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    },
    progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    progressTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
    streakBadge: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff7ed',
        paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 4,
    },
    streakText: { fontSize: 12, fontWeight: '600', color: '#f97316' },
    progressBarContainer: { height: 12, backgroundColor: '#f3f4f6', borderRadius: 6, overflow: 'hidden', marginBottom: 12 },
    progressBar: { height: '100%', backgroundColor: '#d97706', borderRadius: 6 },
    progressStats: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    progressCount: { fontSize: 14, color: '#6b7280' },
    progressBold: { fontWeight: 'bold', color: '#1f2937', fontSize: 16 },
    progressRemaining: { fontSize: 14, color: '#059669', fontWeight: '600' },
    pointsRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
    pointsText: { fontSize: 14, color: '#6b7280', fontWeight: '500' },

    // Dashboard Cards
    card: {
        backgroundColor: '#fff', borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    },
    iconContainer: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    cardContent: { flex: 1 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 4 },
    cardSubtitle: { fontSize: 13, color: '#6b7280' },
    badge: { backgroundColor: '#ef4444', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    badgeText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
    modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 24 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    modalTitle: { fontSize: 20, fontWeight: 'bold' },

    // Application Card
    applicationCard: {
        backgroundColor: '#f9fafb', borderRadius: 12, padding: 16, marginBottom: 12,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    },
    appInfo: { flex: 1 },
    appName: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
    appAadhaar: { fontSize: 14, color: '#6b7280', marginTop: 2 },
    appPhone: { fontSize: 13, color: '#6b7280', marginTop: 4 },
    appDate: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
    appActions: { flexDirection: 'row', gap: 8 },
    approveBtn: { backgroundColor: '#059669', width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    rejectBtn: { backgroundColor: '#ef4444', width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    emptyText: { textAlign: 'center', color: '#9ca3af', padding: 20 },
});

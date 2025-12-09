import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TextToSpeech from '../../components/TextToSpeech';

export default function DeliveryScreen() {
    const router = useRouter();
    const [step, setStep] = useState(1); // 1: OTP, 2: Scan, 3: Confirm
    const [otp, setOtp] = useState('');
    const [beneficiaryId, setBeneficiaryId] = useState('');
    const [assetBarcode, setAssetBarcode] = useState('');
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [isGeoLocked, setIsGeoLocked] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();

    // Mock village center for geo-lock
    const VILLAGE_CENTER = { lat: 28.6139, lng: 77.2090 }; // Delhi coordinates for demo
    const MAX_DISTANCE_METERS = 500;

    useEffect(() => {
        checkLocation();
    }, []);

    const checkLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
                setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });

                // Calculate distance from village center
                const distance = getDistanceFromLatLonInMeters(
                    loc.coords.latitude, loc.coords.longitude,
                    VILLAGE_CENTER.lat, VILLAGE_CENTER.lng
                );
                setIsGeoLocked(distance <= MAX_DISTANCE_METERS);
            }
        } catch (e) {
            console.log('Location error:', e);
        }
    };

    const getDistanceFromLatLonInMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371000; // Radius of earth in meters
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const deg2rad = (deg: number) => deg * (Math.PI / 180);

    const verifyOTP = () => {
        // Mock OTP verification
        if (otp === '123456') {
            setStep(2);
        } else {
            Alert.alert('Invalid OTP', 'Please enter the correct OTP sent to beneficiary');
        }
    };

    const simulateScan = (type: 'beneficiary' | 'asset') => {
        // Simulate barcode scan
        if (type === 'beneficiary') {
            setBeneficiaryId('BEN-' + Math.random().toString(36).substring(2, 8).toUpperCase());
        } else {
            setAssetBarcode('AST-' + Math.random().toString(36).substring(2, 8).toUpperCase());
        }
    };

    const handleDeliver = async () => {
        if (!isGeoLocked) {
            Alert.alert('Location Error', 'You must be within 500m of the village to deliver');
            return;
        }

        try {
            const delivery = {
                id: Date.now().toString(),
                beneficiaryId,
                assetBarcode,
                gps: location,
                timestamp: new Date().toISOString(),
                status: 'DELIVERED'
            };

            const existing = await AsyncStorage.getItem('deliveries');
            const deliveries = existing ? JSON.parse(existing) : [];
            deliveries.push(delivery);
            await AsyncStorage.setItem('deliveries', JSON.stringify(deliveries));

            Alert.alert('✅ Delivery Confirmed!', 'Asset has been linked to beneficiary', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (e) {
            Alert.alert('Error', 'Failed to save delivery');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Asset Delivery</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Progress Steps */}
            <View style={styles.steps}>
                <StepIndicator num={1} label="OTP" active={step >= 1} completed={step > 1} />
                <View style={styles.stepLine} />
                <StepIndicator num={2} label="Scan" active={step >= 2} completed={step > 2} />
                <View style={styles.stepLine} />
                <StepIndicator num={3} label="Deliver" active={step >= 3} completed={false} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Step 1: OTP */}
                {step === 1 && (
                    <View style={styles.stepCard}>
                        <Ionicons name="phone-portrait" size={48} color="#2563eb" />
                        <Text style={styles.stepTitle}>Enter OTP</Text>
                        <Text style={styles.stepDesc}>
                            Enter the 6-digit OTP sent to beneficiary's phone
                        </Text>
                        <TextInput
                            style={styles.otpInput}
                            placeholder="000000"
                            keyboardType="numeric"
                            maxLength={6}
                            value={otp}
                            onChangeText={setOtp}
                        />
                        <Text style={styles.hint}>Demo OTP: 123456</Text>
                        <TouchableOpacity style={styles.button} onPress={verifyOTP}>
                            <Text style={styles.buttonText}>Verify OTP</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Step 2: Dual Scan */}
                {step === 2 && (
                    <View style={styles.stepCard}>
                        <Text style={styles.stepTitle}>Scan Codes</Text>

                        <View style={styles.scanBox}>
                            <Text style={styles.scanLabel}>Beneficiary QR</Text>
                            {beneficiaryId ? (
                                <View style={styles.scannedResult}>
                                    <Ionicons name="checkmark-circle" size={24} color="#059669" />
                                    <Text style={styles.scannedId}>{beneficiaryId}</Text>
                                </View>
                            ) : (
                                <TouchableOpacity style={styles.scanButton} onPress={() => simulateScan('beneficiary')}>
                                    <Ionicons name="qr-code" size={24} color="#fff" />
                                    <Text style={styles.scanButtonText}>Scan QR</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        <View style={styles.scanBox}>
                            <Text style={styles.scanLabel}>Asset Barcode</Text>
                            {assetBarcode ? (
                                <View style={styles.scannedResult}>
                                    <Ionicons name="checkmark-circle" size={24} color="#059669" />
                                    <Text style={styles.scannedId}>{assetBarcode}</Text>
                                </View>
                            ) : (
                                <TouchableOpacity style={styles.scanButton} onPress={() => simulateScan('asset')}>
                                    <Ionicons name="barcode" size={24} color="#fff" />
                                    <Text style={styles.scanButtonText}>Scan Barcode</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {beneficiaryId && assetBarcode && (
                            <TouchableOpacity style={styles.button} onPress={() => setStep(3)}>
                                <Text style={styles.buttonText}>Continue</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                {/* Step 3: Confirm Delivery */}
                {step === 3 && (
                    <View style={styles.stepCard}>
                        <Text style={styles.stepTitle}>Confirm Delivery</Text>

                        <View style={styles.summaryBox}>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Beneficiary:</Text>
                                <Text style={styles.summaryValue}>{beneficiaryId}</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Asset:</Text>
                                <Text style={styles.summaryValue}>{assetBarcode}</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Location:</Text>
                                <Text style={styles.summaryValue}>
                                    {location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Loading...'}
                                </Text>
                            </View>
                        </View>

                        {/* Geo-Lock Status */}
                        <View style={[styles.geoStatus, isGeoLocked ? styles.geoOk : styles.geoFail]}>
                            <Ionicons
                                name={isGeoLocked ? 'location' : 'warning'}
                                size={20}
                                color={isGeoLocked ? '#059669' : '#ef4444'}
                            />
                            <Text style={[styles.geoText, { color: isGeoLocked ? '#059669' : '#ef4444' }]}>
                                {isGeoLocked ? 'Within village boundary ✓' : 'Outside village boundary'}
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={[styles.deliverButton, !isGeoLocked && styles.disabledButton]}
                            onPress={handleDeliver}
                            disabled={!isGeoLocked}
                        >
                            <Ionicons name="checkmark-done" size={24} color="#fff" />
                            <Text style={styles.deliverText}>Confirm Delivery</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>

            <TextToSpeech content={`Asset Delivery Screen. ${step === 1 ? 'Step 1: Enter the 6 digit OTP sent to beneficiary phone. Demo OTP is 123456.' : step === 2 ? 'Step 2: Scan the Beneficiary QR code and Asset Barcode.' : 'Step 3: Confirm delivery. Verify beneficiary ID, asset barcode, and location. ' + (isGeoLocked ? 'You are within village boundary. Tap Confirm Delivery to complete.' : 'Warning: You are outside village boundary.')}`} />
        </View>
    );
}

const StepIndicator = ({ num, label, active, completed }: any) => (
    <View style={styles.stepIndicator}>
        <View style={[
            styles.stepCircle,
            active && styles.stepActive,
            completed && styles.stepCompleted
        ]}>
            {completed ? (
                <Ionicons name="checkmark" size={16} color="#fff" />
            ) : (
                <Text style={[styles.stepNum, active && styles.stepNumActive]}>{num}</Text>
            )}
        </View>
        <Text style={[styles.stepLabel, active && styles.stepLabelActive]}>{label}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9fafb' },
    header: {
        backgroundColor: '#1f2937',
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
    steps: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    stepIndicator: { alignItems: 'center' },
    stepCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#e5e7eb',
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepActive: { backgroundColor: '#d97706' },
    stepCompleted: { backgroundColor: '#059669' },
    stepNum: { color: '#6b7280', fontWeight: 'bold' },
    stepNumActive: { color: '#fff' },
    stepLabel: { fontSize: 12, color: '#6b7280', marginTop: 4 },
    stepLabelActive: { color: '#1f2937', fontWeight: '600' },
    stepLine: { width: 40, height: 2, backgroundColor: '#e5e7eb', marginHorizontal: 8 },
    content: { padding: 20 },
    stepCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
    },
    stepTitle: { fontSize: 22, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
    stepDesc: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 20 },
    otpInput: {
        fontSize: 32,
        letterSpacing: 8,
        textAlign: 'center',
        borderBottomWidth: 2,
        borderBottomColor: '#d97706',
        paddingVertical: 12,
        width: 200,
        marginBottom: 8,
    },
    hint: { fontSize: 12, color: '#9ca3af', marginBottom: 20 },
    button: {
        backgroundColor: '#d97706',
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 12,
        marginTop: 12,
    },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    scanBox: {
        width: '100%',
        backgroundColor: '#f9fafb',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        alignItems: 'center',
    },
    scanLabel: { fontSize: 14, fontWeight: '600', marginBottom: 12 },
    scanButton: {
        backgroundColor: '#2563eb',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        gap: 8,
    },
    scanButtonText: { color: '#fff', fontWeight: 'bold' },
    scannedResult: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    scannedId: { fontSize: 16, fontWeight: 'bold', color: '#059669' },
    summaryBox: {
        width: '100%',
        backgroundColor: '#f9fafb',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    summaryLabel: { color: '#6b7280' },
    summaryValue: { fontWeight: 'bold', color: '#1f2937' },
    geoStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        gap: 8,
        marginBottom: 20,
        width: '100%',
    },
    geoOk: { backgroundColor: '#dcfce7' },
    geoFail: { backgroundColor: '#fee2e2' },
    geoText: { fontWeight: '600' },
    deliverButton: {
        backgroundColor: '#059669',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
    },
    disabledButton: { opacity: 0.5 },
    deliverText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

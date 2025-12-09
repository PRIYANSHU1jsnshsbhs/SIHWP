import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TextToSpeech from '../../components/TextToSpeech';

export default function AuditScreen() {
    const router = useRouter();
    const cameraRef = useRef<CameraView>(null);
    const [permission, requestPermission] = useCameraPermissions();

    const [step, setStep] = useState(1); // 1: Select, 2: Comparison, 3: Evidence, 4: Video
    const [beneficiaryId, setBeneficiaryId] = useState('');
    const [originalData, setOriginalData] = useState<any>(null);
    const [currentIncome, setCurrentIncome] = useState('');
    const [photo, setPhoto] = useState<string | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [videoUri, setVideoUri] = useState<string | null>(null);
    const [location, setLocation] = useState<any>(null);

    useEffect(() => {
        getLocation();
    }, []);

    const getLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                const loc = await Location.getCurrentPositionAsync({});
                setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
            }
        } catch (e) {
            console.log('Location error:', e);
        }
    };

    const loadBeneficiaryData = async () => {
        // Mock: Load original survey data
        const mockOriginal = {
            name: 'Sunita Devi',
            income: 45000,
            occupation: 'Artisan',
            surveyDate: '2024-01-15',
        };
        setOriginalData(mockOriginal);
        setStep(2);
    };

    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                const photoData = await cameraRef.current.takePictureAsync({ quality: 0.5 });
                if (photoData?.uri) {
                    setPhoto(photoData.uri);
                }
            } catch (e) {
                console.log('Camera error:', e);
            }
        }
    };

    const startRecording = async () => {
        if (cameraRef.current) {
            setIsRecording(true);
            try {
                const video = await cameraRef.current.recordAsync({ maxDuration: 15 });
                if (video?.uri) {
                    setVideoUri(video.uri);
                }
            } catch (e) {
                console.log('Video error:', e);
            }
            setIsRecording(false);
        }
    };

    const stopRecording = () => {
        if (cameraRef.current) {
            cameraRef.current.stopRecording();
        }
    };

    const submitAudit = async () => {
        try {
            const audit = {
                id: Date.now().toString(),
                beneficiaryId,
                originalIncome: originalData?.income,
                currentIncome: Number(currentIncome),
                incomeChange: Number(currentIncome) - (originalData?.income || 0),
                photoUri: photo,
                videoUri,
                gps: location,
                timestamp: new Date().toISOString(),
            };

            const existing = await AsyncStorage.getItem('audits');
            const audits = existing ? JSON.parse(existing) : [];
            audits.push(audit);
            await AsyncStorage.setItem('audits', JSON.stringify(audits));

            Alert.alert('✅ Audit Submitted!', 'Impact assessment has been recorded', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (e) {
            Alert.alert('Error', 'Failed to submit audit');
        }
    };

    const incomeChange = originalData && currentIncome
        ? Number(currentIncome) - originalData.income
        : 0;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Impact Audit</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Step 1: Select Beneficiary */}
                {step === 1 && (
                    <View style={styles.card}>
                        <Ionicons name="person-circle" size={64} color="#d97706" />
                        <Text style={styles.cardTitle}>Select Beneficiary</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter Beneficiary ID or Name"
                            value={beneficiaryId}
                            onChangeText={setBeneficiaryId}
                        />
                        <TouchableOpacity style={styles.button} onPress={loadBeneficiaryData}>
                            <Text style={styles.buttonText}>Load Data</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Step 2: Comparison */}
                {step === 2 && originalData && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Income Comparison</Text>
                        <Text style={styles.beneficiaryName}>{originalData.name}</Text>

                        <View style={styles.comparisonBox}>
                            <View style={styles.comparisonItem}>
                                <Text style={styles.compLabel}>Day 1 Income</Text>
                                <Text style={styles.compValue}>₹{originalData.income.toLocaleString()}</Text>
                                <Text style={styles.compDate}>{originalData.surveyDate}</Text>
                            </View>

                            <Ionicons name="arrow-forward" size={24} color="#9ca3af" />

                            <View style={styles.comparisonItem}>
                                <Text style={styles.compLabel}>Current Income</Text>
                                <TextInput
                                    style={styles.incomeInput}
                                    placeholder="₹ Amount"
                                    keyboardType="numeric"
                                    value={currentIncome}
                                    onChangeText={setCurrentIncome}
                                />
                            </View>
                        </View>

                        {currentIncome && (
                            <View style={[
                                styles.changeBox,
                                incomeChange >= 0 ? styles.positive : styles.negative
                            ]}>
                                <Ionicons
                                    name={incomeChange >= 0 ? 'trending-up' : 'trending-down'}
                                    size={24}
                                    color={incomeChange >= 0 ? '#059669' : '#ef4444'}
                                />
                                <Text style={[
                                    styles.changeText,
                                    { color: incomeChange >= 0 ? '#059669' : '#ef4444' }
                                ]}>
                                    {incomeChange >= 0 ? '+' : ''}₹{incomeChange.toLocaleString()}
                                    ({((incomeChange / originalData.income) * 100).toFixed(1)}%)
                                </Text>
                            </View>
                        )}

                        <TouchableOpacity
                            style={[styles.button, !currentIncome && styles.disabled]}
                            onPress={() => setStep(3)}
                            disabled={!currentIncome}
                        >
                            <Text style={styles.buttonText}>Next: Evidence</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Step 3: Photo Evidence */}
                {step === 3 && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Photo Evidence</Text>
                        <Text style={styles.cardDesc}>Capture current state of business</Text>

                        {!photo ? (
                            permission?.granted ? (
                                <View style={styles.cameraContainer}>
                                    <CameraView style={styles.camera} ref={cameraRef} facing="back" />
                                    <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                                        <View style={styles.captureInner} />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <TouchableOpacity style={styles.button} onPress={requestPermission}>
                                    <Text style={styles.buttonText}>Enable Camera</Text>
                                </TouchableOpacity>
                            )
                        ) : (
                            <View>
                                <Image source={{ uri: photo }} style={styles.preview} />
                                <View style={styles.photoActions}>
                                    <TouchableOpacity onPress={() => setPhoto(null)}>
                                        <Text style={styles.retake}>Retake</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.button} onPress={() => setStep(4)}>
                                        <Text style={styles.buttonText}>Next: Video</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {location && (
                            <Text style={styles.gpsTag}>
                                📍 {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                            </Text>
                        )}
                    </View>
                )}

                {/* Step 4: Video Testimonial */}
                {step === 4 && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Video Testimonial</Text>
                        <Text style={styles.cardDesc}>Record 15-second beneficiary testimonial</Text>

                        {!videoUri ? (
                            <View style={styles.cameraContainer}>
                                <CameraView style={styles.camera} ref={cameraRef} facing="back" mode="video" />
                                <TouchableOpacity
                                    style={[styles.captureButton, isRecording && styles.recordingButton]}
                                    onPress={isRecording ? stopRecording : startRecording}
                                >
                                    <Ionicons
                                        name={isRecording ? 'stop' : 'videocam'}
                                        size={32}
                                        color="#fff"
                                    />
                                </TouchableOpacity>
                                {isRecording && <Text style={styles.recordingText}>Recording... (15s max)</Text>}
                            </View>
                        ) : (
                            <View style={styles.videoRecorded}>
                                <Ionicons name="checkmark-circle" size={48} color="#059669" />
                                <Text style={styles.videoText}>Video Recorded!</Text>
                            </View>
                        )}

                        <TouchableOpacity
                            style={[styles.submitButton, !videoUri && styles.disabled]}
                            onPress={submitAudit}
                            disabled={!videoUri}
                        >
                            <Ionicons name="cloud-upload" size={24} color="#fff" />
                            <Text style={styles.submitText}>Submit Audit</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={submitAudit}>
                            <Text style={styles.skipText}>Skip Video</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>

            <TextToSpeech content={`Impact Audit Screen. ${step === 1 ? 'Step 1: Enter beneficiary ID or name to load their data.' : step === 2 ? `Step 2: Income Comparison for ${originalData?.name || 'beneficiary'}. Original income was ${originalData?.income || 0} rupees. Enter current income. ${currentIncome ? (incomeChange >= 0 ? `Income increased by ${incomeChange} rupees.` : `Income decreased by ${Math.abs(incomeChange)} rupees.`) : ''}` : step === 3 ? 'Step 3: Capture photo evidence of current business state.' : 'Step 4: Record 15 second video testimonial from beneficiary.'}`} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9fafb' },
    header: {
        backgroundColor: '#1f2937',
        paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
    content: { padding: 20 },
    card: {
        backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3,
    },
    cardTitle: { fontSize: 22, fontWeight: 'bold', marginTop: 12, marginBottom: 8 },
    cardDesc: { fontSize: 14, color: '#6b7280', marginBottom: 20 },
    beneficiaryName: { fontSize: 18, color: '#d97706', fontWeight: '600', marginBottom: 20 },
    input: {
        width: '100%', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12,
        padding: 16, fontSize: 16, marginBottom: 16,
    },
    button: {
        backgroundColor: '#d97706', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12,
    },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    disabled: { opacity: 0.5 },
    comparisonBox: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        width: '100%', marginBottom: 20,
    },
    comparisonItem: { flex: 1, alignItems: 'center' },
    compLabel: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
    compValue: { fontSize: 20, fontWeight: 'bold', color: '#1f2937' },
    compDate: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
    incomeInput: {
        fontSize: 20, fontWeight: 'bold', textAlign: 'center',
        borderBottomWidth: 2, borderBottomColor: '#d97706', paddingVertical: 8, minWidth: 100,
    },
    changeBox: {
        flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, gap: 8,
        marginBottom: 20, width: '100%', justifyContent: 'center',
    },
    positive: { backgroundColor: '#dcfce7' },
    negative: { backgroundColor: '#fee2e2' },
    changeText: { fontSize: 18, fontWeight: 'bold' },
    cameraContainer: { width: '100%', height: 300, borderRadius: 12, overflow: 'hidden', marginBottom: 16 },
    camera: { flex: 1 },
    captureButton: {
        position: 'absolute', bottom: 20, alignSelf: 'center',
        width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255,255,255,0.3)',
        alignItems: 'center', justifyContent: 'center',
    },
    captureInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#fff' },
    recordingButton: { backgroundColor: '#ef4444' },
    recordingText: { textAlign: 'center', color: '#ef4444', fontWeight: '600', marginTop: 8 },
    preview: { width: '100%', height: 200, borderRadius: 12, marginBottom: 16 },
    photoActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
    retake: { color: '#d97706', fontWeight: '600' },
    gpsTag: { fontSize: 12, color: '#6b7280', marginTop: 12 },
    videoRecorded: { alignItems: 'center', padding: 30 },
    videoText: { fontSize: 18, color: '#059669', fontWeight: 'bold', marginTop: 12 },
    submitButton: {
        backgroundColor: '#059669', flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 32, paddingVertical: 16, borderRadius: 12, gap: 8, marginTop: 20,
    },
    submitText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    skipText: { color: '#6b7280', marginTop: 16 },
});

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import TextToSpeech from '../../components/TextToSpeech';

export default function LoanCertificateScreen() {
    const router = useRouter();
    const certificateRef = useRef<View>(null);
    const [userData, setUserData] = useState<any>(null);
    const [trustScore, setTrustScore] = useState(0);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const appRaw = await AsyncStorage.getItem('beneficiary_application');
            if (appRaw) {
                setUserData(JSON.parse(appRaw));
            }

            const khataRaw = await AsyncStorage.getItem('khata_entries');
            const entries = khataRaw ? JSON.parse(khataRaw) : [];
            const score = Math.min(100, Math.round(entries.length * 2.5 + (entries.length >= 30 ? 25 : 0)));
            setTrustScore(score);
        } catch (e) {
            console.log('Error:', e);
        }
    };

    const handleShare = async () => {
        try {
            if (certificateRef.current) {
                const uri = await captureRef(certificateRef, {
                    format: 'png',
                    quality: 1,
                });
                await Sharing.shareAsync(uri);
            }
        } catch (e) {
            Alert.alert('Error', 'Failed to share certificate');
        }
    };

    const today = new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Loan Certificate</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
                {/* Certificate Card */}
                <View ref={certificateRef} style={styles.certificate} collapsable={false}>
                    <View style={styles.certHeader}>
                        <Text style={styles.certLogo}>🏛️ PM-AJAY</Text>
                        <Text style={styles.certTitle}>MUDRA Loan Recommendation</Text>
                    </View>

                    <View style={styles.certBody}>
                        <Text style={styles.certText}>This is to certify that</Text>
                        <Text style={styles.certName}>{userData?.name || 'Beneficiary'}</Text>
                        <Text style={styles.certText}>has demonstrated consistent business activity</Text>
                        <Text style={styles.certText}>through the PM-AJAY Sahayak Digital Khata.</Text>

                        <View style={styles.scoreBox}>
                            <Text style={styles.scoreLabel}>Trust Score</Text>
                            <Text style={styles.scoreValue}>{trustScore}/100</Text>
                        </View>

                        <Text style={styles.certRecommendation}>
                            ✅ Recommended for MUDRA Shishu Loan (up to ₹50,000)
                        </Text>
                    </View>

                    <View style={styles.certFooter}>
                        <Text style={styles.certDate}>Issued on: {today}</Text>
                        <Text style={styles.certId}>Ref: PM-AJAY/{userData?.id || '000000'}</Text>
                    </View>
                </View>

                {/* Actions */}
                <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                    <Ionicons name="share-outline" size={20} color="#fff" />
                    <Text style={styles.shareText}>Share Certificate</Text>
                </TouchableOpacity>

                <Text style={styles.disclaimer}>
                    This certificate is generated based on self-reported data and requires verification by a financial institution.
                </Text>
            </View>

            <TextToSpeech content={`PM-AJAY MUDRA Loan Recommendation Certificate. This is to certify that ${userData?.name || 'Beneficiary'} has demonstrated consistent business activity through the PM-AJAY Sahayak Digital Khata. Trust Score: ${trustScore} out of 100. Recommended for MUDRA Shishu Loan up to 50,000 rupees. Certificate issued on ${today}. Tap Share Certificate to share this document.`} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f4f6',
    },
    header: {
        backgroundColor: '#d97706',
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    content: {
        padding: 20,
    },
    certificate: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        borderWidth: 2,
        borderColor: '#d97706',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    certHeader: {
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
        paddingBottom: 16,
        marginBottom: 16,
    },
    certLogo: {
        fontSize: 28,
        marginBottom: 8,
    },
    certTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        textAlign: 'center',
    },
    certBody: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    certText: {
        fontSize: 14,
        color: '#4b5563',
        textAlign: 'center',
        marginBottom: 4,
    },
    certName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#d97706',
        marginVertical: 8,
    },
    scoreBox: {
        backgroundColor: '#fef3c7',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        marginVertical: 16,
        alignItems: 'center',
    },
    scoreLabel: {
        fontSize: 12,
        color: '#92400e',
    },
    scoreValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#d97706',
    },
    certRecommendation: {
        fontSize: 14,
        fontWeight: '600',
        color: '#059669',
        textAlign: 'center',
        marginTop: 12,
    },
    certFooter: {
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        paddingTop: 16,
        marginTop: 16,
        alignItems: 'center',
    },
    certDate: {
        fontSize: 12,
        color: '#6b7280',
    },
    certId: {
        fontSize: 11,
        color: '#9ca3af',
        marginTop: 4,
    },
    shareButton: {
        backgroundColor: '#2563eb',
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 24,
        gap: 8,
    },
    shareText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    disclaimer: {
        fontSize: 12,
        color: '#9ca3af',
        textAlign: 'center',
        marginTop: 16,
        paddingHorizontal: 20,
    },
});

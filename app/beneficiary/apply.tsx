import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TextToSpeech from '../../components/TextToSpeech';

export default function ApplyScreen() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [aadhaar, setAadhaar] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!name || !aadhaar || !phone) {
            Alert.alert('Missing Fields', 'Please fill all required fields');
            return;
        }

        if (aadhaar.length !== 12) {
            Alert.alert('Invalid Aadhaar', 'Please enter a valid 12-digit Aadhaar number');
            return;
        }

        setIsSubmitting(true);
        try {
            const application = {
                id: Date.now().toString(),
                name,
                aadhaar: 'XXXX-XXXX-' + aadhaar.slice(-4),
                fullAadhaar: aadhaar, // Keep full for verification
                phone,
                address,
                status: 'PENDING_VERIFICATION',
                submittedAt: new Date().toISOString(),
            };

            // Save to pending_applications list (for enumerator to see)
            const existing = await AsyncStorage.getItem('pending_applications');
            const applications = existing ? JSON.parse(existing) : [];
            applications.push(application);
            await AsyncStorage.setItem('pending_applications', JSON.stringify(applications));

            // Also save to beneficiary's own record
            await AsyncStorage.setItem('beneficiary_application', JSON.stringify(application));

            Alert.alert(
                'Application Submitted!',
                'Your application has been sent for verification. An enumerator will be notified to visit you.',
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } catch (e) {
            Alert.alert('Error', 'Failed to submit application');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Apply for Scheme</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.sectionTitle}>Personal Details</Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Full Name *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your name"
                        value={name}
                        onChangeText={setName}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Aadhaar Number *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="12-digit Aadhaar"
                        keyboardType="numeric"
                        maxLength={12}
                        value={aadhaar}
                        onChangeText={setAadhaar}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Mobile Number *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="10-digit mobile"
                        keyboardType="phone-pad"
                        maxLength={10}
                        value={phone}
                        onChangeText={setPhone}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Address</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Enter your address"
                        multiline
                        numberOfLines={3}
                        value={address}
                        onChangeText={setAddress}
                    />
                </View>

                <View style={styles.infoBox}>
                    <Ionicons name="information-circle" size={20} color="#2563eb" />
                    <Text style={styles.infoText}>
                        After submission, a field worker will visit your location to verify your details.
                    </Text>
                </View>

                <TouchableOpacity
                    style={[styles.submitButton, isSubmitting && styles.disabledButton]}
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                >
                    <Text style={styles.submitText}>
                        {isSubmitting ? 'Submitting...' : 'Submit Application'}
                    </Text>
                </TouchableOpacity>
            </ScrollView>

            <TextToSpeech content="Apply for Scheme Form. Personal Details: Enter your full name, 12 digit Aadhaar number, 10 digit mobile number, and address. After submission, a field worker will visit your location to verify your details. Tap Submit Application when ready." />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
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
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        backgroundColor: '#f9fafb',
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#dbeafe',
        padding: 16,
        borderRadius: 12,
        gap: 12,
        marginBottom: 24,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: '#1e40af',
    },
    submitButton: {
        backgroundColor: '#d97706',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
    },
    disabledButton: {
        opacity: 0.6,
    },
    submitText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

type IdentityGateProps = {
    onVerified: (data: any) => void;
};

export default function IdentityGate({ onVerified }: IdentityGateProps) {
    const [aadhaar, setAadhaar] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [ocrLoading, setOcrLoading] = useState(false);

    const validateAadhaar = (number: string) => {
        return /^\d{12}$/.test(number);
    };

    const handleVerify = async () => {
        if (!validateAadhaar(aadhaar)) {
            Alert.alert("Invalid Aadhaar", "Please enter a valid 12-digit Aadhaar number.");
            return;
        }

        // Silent Check: Duplication
        try {
            const storedData = await AsyncStorage.getItem('surveyed_aadhaars');
            const list = storedData ? JSON.parse(storedData) : [];
            if (list.includes(aadhaar)) {
                Alert.alert("Duplicate Entry", "This Aadhaar number has already been surveyed today.");
                return;
            }
        } catch (e) {
            console.error("Storage Error", e);
        }

        onVerified({ aadhaar, name, phone, isOcrVerified: name !== '' });
    };

    const simulateOCR = () => {
        setOcrLoading(true);
        setTimeout(() => {
            setOcrLoading(false);
            setAadhaar("987654321012"); // Dummy Aadhaar
            setName("Sunita Devi");
            setPhone("9876543210");
            Alert.alert("OCR Success", "Data extracted from Aadhaar card.");
        }, 2000);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Beneficiary Verification</Text>

            <View style={styles.form}>
                <Text style={styles.label}>Aadhaar Number</Text>
                <View style={styles.inputRow}>
                    <TextInput
                        style={[styles.input, { flex: 1 }]}
                        placeholder="12-digit Aadhaar"
                        keyboardType="numeric"
                        maxLength={12}
                        value={aadhaar}
                        onChangeText={setAadhaar}
                    />
                    <TouchableOpacity style={styles.scanButton} onPress={simulateOCR} disabled={ocrLoading}>
                        {ocrLoading ? <ActivityIndicator color="#fff" /> : <Ionicons name="camera" size={20} color="#fff" />}
                    </TouchableOpacity>
                </View>

                <Text style={styles.label}>Full Name</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter Name"
                    value={name}
                    onChangeText={setName}
                />

                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                    style={styles.input}
                    placeholder="10-digit Mobile"
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={phone}
                    onChangeText={setPhone}
                />

                <TouchableOpacity style={styles.verifyButton} onPress={handleVerify}>
                    <Text style={styles.verifyText}>Verify & Proceed</Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 24,
    },
    form: {
        gap: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 4,
    },
    inputRow: {
        flexDirection: 'row',
        gap: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    scanButton: {
        backgroundColor: '#2563eb',
        width: 50,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    verifyButton: {
        backgroundColor: '#d97706',
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
        gap: 8,
    },
    verifyText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    }
});

import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { calculateRiskScore } from '../../utils/eligibilityEngine';

type SurveyFormProps = {
    onSubmit: (data: any) => void;
};

export default function SurveyForm({ onSubmit }: SurveyFormProps) {
    const [income, setIncome] = useState('');
    const [caste, setCaste] = useState(''); // SC, ST, OBC, Gen
    const [occupation, setOccupation] = useState(''); // Farmer, Artisan, etc.
    const [skills, setSkills] = useState<string[]>([]);
    const [assets, setAssets] = useState<string[]>([]);
    const [bankAccount, setBankAccount] = useState('');
    const [bankVerified, setBankVerified] = useState<boolean | null>(null);
    const [verifyingBank, setVerifyingBank] = useState(false);

    const toggleSelection = (list: string[], setList: Function, item: string) => {
        if (list.includes(item)) {
            setList(list.filter(i => i !== item));
        } else {
            setList([...list, item]);
        }
    };

    // Real-time eligibility calculation
    const eligibility = useMemo(() => {
        if (!income || !caste) return null;
        return calculateRiskScore({ income: Number(income), caste });
    }, [income, caste]);

    // Penny Drop API Simulation
    const verifyBankAccount = async () => {
        if (bankAccount.length < 9) {
            alert('Please enter a valid bank account number');
            return;
        }
        setVerifyingBank(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        // Mock: Accounts ending with 0 fail, others pass
        const isValid = !bankAccount.endsWith('0');
        setBankVerified(isValid);
        setVerifyingBank(false);
    };

    const handleNext = () => {
        onSubmit({
            income: Number(income),
            caste,
            occupation,
            skills,
            assets,
            bankAccount,
            bankVerified
        });
    };

    return (
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Socio-Economic Details</Text>

            {/* Real-time Eligibility Banner */}
            {eligibility && (
                <View style={[
                    styles.eligibilityBanner,
                    {
                        backgroundColor: eligibility.status === 'REJECTED' ? '#fee2e2' :
                            eligibility.status === 'HIGH_PRIORITY' ? '#dcfce7' : '#dbeafe'
                    }
                ]}>
                    <Ionicons
                        name={eligibility.status === 'REJECTED' ? 'close-circle' : 'checkmark-circle'}
                        size={24}
                        color={eligibility.status === 'REJECTED' ? '#ef4444' :
                            eligibility.status === 'HIGH_PRIORITY' ? '#059669' : '#2563eb'}
                    />
                    <View style={styles.eligibilityText}>
                        <Text style={[styles.eligibilityStatus, { color: eligibility.color }]}>
                            {eligibility.status}
                        </Text>
                        <Text style={styles.eligibilityMessage}>{eligibility.message}</Text>
                    </View>
                </View>
            )}

            {/* Income */}
            <View style={styles.section}>
                <Text style={styles.label}>Annual Family Income (₹)</Text>
                <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    placeholder="e.g 45000"
                    value={income}
                    onChangeText={setIncome}
                />
            </View>

            {/* Caste */}
            <View style={styles.section}>
                <Text style={styles.label}>Caste Category</Text>
                <View style={styles.optionsRow}>
                    {['SC', 'ST', 'OBC', 'General'].map(opt => (
                        <TouchableOpacity
                            key={opt}
                            style={[styles.optionChip, caste === opt && styles.selectedChip]}
                            onPress={() => setCaste(opt)}
                        >
                            <Text style={[styles.chipText, caste === opt && styles.selectedChipText]}>{opt}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Bank Account with Penny Drop */}
            <View style={styles.section}>
                <Text style={styles.label}>Bank Account Number</Text>
                <View style={styles.bankRow}>
                    <TextInput
                        style={[styles.input, { flex: 1 }]}
                        keyboardType="numeric"
                        placeholder="Enter Account No."
                        value={bankAccount}
                        onChangeText={(text) => { setBankAccount(text); setBankVerified(null); }}
                    />
                    <TouchableOpacity
                        style={[styles.verifyButton, bankVerified === true && styles.verifiedButton]}
                        onPress={verifyBankAccount}
                        disabled={verifyingBank || bankVerified === true}
                    >
                        {verifyingBank ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : bankVerified === true ? (
                            <Ionicons name="checkmark" size={20} color="#fff" />
                        ) : (
                            <Text style={styles.verifyText}>₹1 Verify</Text>
                        )}
                    </TouchableOpacity>
                </View>
                {bankVerified === false && (
                    <Text style={styles.errorText}>❌ Account verification failed</Text>
                )}
                {bankVerified === true && (
                    <Text style={styles.successText}>✓ Account verified via Penny Drop</Text>
                )}
            </View>

            {/* Occupation */}
            <View style={styles.section}>
                <Text style={styles.label}>Occupation</Text>
                <View style={styles.optionsRow}>
                    {['Farmer', 'Artisan', 'Laborer', 'Unemployed'].map(opt => (
                        <TouchableOpacity
                            key={opt}
                            style={[styles.optionChip, occupation === opt && styles.selectedChip]}
                            onPress={() => setOccupation(opt)}
                        >
                            <Text style={[styles.chipText, occupation === opt && styles.selectedChipText]}>{opt}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Skills */}
            <View style={styles.section}>
                <Text style={styles.label}>Skills</Text>
                <View style={styles.optionsRow}>
                    {['Tailoring', 'Carpentry', 'Computer', 'Masonry'].map(opt => (
                        <TouchableOpacity
                            key={opt}
                            style={[styles.optionChip, skills.includes(opt) && styles.selectedChip]}
                            onPress={() => toggleSelection(skills, setSkills, opt)}
                        >
                            <Text style={[styles.chipText, skills.includes(opt) && styles.selectedChipText]}>{opt}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Assets */}
            <View style={styles.section}>
                <Text style={styles.label}>Assets Owned</Text>
                <View style={styles.optionsRow}>
                    {['Fridge', 'Two-wheeler', 'Pucca House', 'Smartphone'].map(opt => (
                        <TouchableOpacity
                            key={opt}
                            style={[styles.optionChip, assets.includes(opt) && styles.selectedChip]}
                            onPress={() => toggleSelection(assets, setAssets, opt)}
                        >
                            <Text style={[styles.chipText, assets.includes(opt) && styles.selectedChipText]}>{opt}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                <Text style={styles.nextButtonText}>Next: Evidence</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        paddingBottom: 40,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 16,
    },
    eligibilityBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
        gap: 12,
    },
    eligibilityText: {
        flex: 1,
    },
    eligibilityStatus: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    eligibilityMessage: {
        fontSize: 12,
        color: '#4b5563',
        marginTop: 2,
    },
    section: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 12,
    },
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    bankRow: {
        flexDirection: 'row',
        gap: 10,
    },
    verifyButton: {
        backgroundColor: '#2563eb',
        paddingHorizontal: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    verifiedButton: {
        backgroundColor: '#059669',
    },
    verifyText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 13,
    },
    errorText: {
        color: '#ef4444',
        fontSize: 12,
        marginTop: 8,
    },
    successText: {
        color: '#059669',
        fontSize: 12,
        marginTop: 8,
    },
    optionsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    optionChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    selectedChip: {
        backgroundColor: '#d97706',
        borderColor: '#d97706',
    },
    chipText: {
        color: '#374151',
        fontWeight: '500',
    },
    selectedChipText: {
        color: '#fff',
    },
    nextButton: {
        backgroundColor: '#1f2937',
        padding: 18,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        gap: 8,
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    }
});

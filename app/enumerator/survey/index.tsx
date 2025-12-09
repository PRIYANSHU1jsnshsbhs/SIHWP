import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import IdentityGate from '../../../components/survey/IdentityGate';
import SurveyForm from '../../../components/survey/SurveyForm';
import EvidenceCapture from '../../../components/survey/EvidenceCapture';
import CompletionScreen from '../../../components/survey/CompletionScreen';
import { calculateRiskScore } from '../../../utils/eligibilityEngine';
import { useOfflineSync } from '../../../hooks/useOfflineSync';
import TextToSpeech from '../../../components/TextToSpeech';

export default function SurveyScreeen() {
    const router = useRouter();
    const { saveSurvey } = useOfflineSync();

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<any>({});
    const [syncResult, setSyncResult] = useState<any>(null);
    const [eligibility, setEligibility] = useState<any>(null);

    const handleIdentityVerified = (data: any) => {
        setFormData((prev: any) => ({ ...prev, beneficiary: data }));
        setStep(2);
    };

    const handleFormSubmit = (data: any) => {
        setFormData((prev: any) => ({ ...prev, financials: data }));
        setStep(3);
    };

    const handleEvidenceCaptured = async (data: any) => {
        const finalData = { ...formData, evidence: data };
        setFormData(finalData);

        // 1. Calculate Risk
        const risk = calculateRiskScore(finalData.financials);
        setEligibility(risk);

        // 2. Save/Sync
        const result = await saveSurvey({ ...finalData, eligibilityResult: risk.status });
        setSyncResult(result);

        setStep(4);
    };

    return (
        <View style={styles.container}>
            {/* Header / Progress */}
            {step < 4 && (
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>New Survey</Text>
                    <View style={styles.progressContainer}>
                        <View style={[styles.progressBar, { width: `${(step / 3) * 100}%` }]} />
                    </View>
                    <Text style={styles.stepText}>Step {step} of 3</Text>
                </View>
            )}

            <View style={styles.content}>
                {step === 1 && <IdentityGate onVerified={handleIdentityVerified} />}
                {step === 2 && <SurveyForm onSubmit={handleFormSubmit} />}
                {step === 3 && (
                    <View>
                        <Text style={styles.sectionTitle}>Field Evidence</Text>
                        <Text style={styles.sectionSubtitle}>Capture photo of beneficiary at location</Text>
                        <EvidenceCapture onCapture={handleEvidenceCaptured} />
                    </View>
                )}
                {step === 4 && <CompletionScreen syncResult={syncResult} eligibility={eligibility} />}
            </View>

            <TextToSpeech content={`New Survey. Step ${step} of 3. ${step === 1 ? 'Identity Verification: Enter beneficiary Aadhaar number and verify identity.' : step === 2 ? 'Survey Form: Enter income, caste, occupation, skills, assets, and bank account details.' : step === 3 ? 'Field Evidence: Capture photo of beneficiary at their location.' : 'Survey Complete! Results have been synced.'}`} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    progressContainer: {
        height: 6,
        backgroundColor: '#f3f4f6',
        borderRadius: 3,
        marginBottom: 8,
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#d97706',
        borderRadius: 3,
    },
    stepText: {
        fontSize: 12,
        color: '#6b7280',
        textAlign: 'right',
    },
    content: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1f2937',
        margin: 20,
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#6b7280',
        marginHorizontal: 20,
        marginBottom: 20,
    }
});

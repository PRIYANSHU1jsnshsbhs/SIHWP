import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

type CompletionScreenProps = {
    syncResult: { status: string, message: string };
    eligibility: { status: string, message: string, color: string };
};

export default function CompletionScreen({ syncResult, eligibility }: CompletionScreenProps) {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Ionicons name="checkmark-done-circle" size={80} color="#059669" />
                </View>

                <Text style={styles.title}>Survey Completed!</Text>
                <Text style={styles.idText}>Survey ID #123456</Text>

                <View style={styles.card}>
                    <View style={styles.row}>
                        <Text style={styles.label}>Upload Status:</Text>
                        <Text style={[styles.value, { color: syncResult.status === 'Uploaded' ? 'green' : 'orange' }]}>
                            {syncResult.message}
                        </Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.row}>
                        <Text style={styles.label}>Pre-Validation:</Text>
                        <Text style={[styles.value, { color: eligibility.color, fontWeight: 'bold' }]}>
                            {eligibility.status}
                        </Text>
                    </View>
                    <Text style={styles.subtext}>{eligibility.message}</Text>
                </View>

                <View style={styles.gamification}>
                    <Text style={styles.points}>+50 Points Earned</Text>
                </View>
            </View>

            <TouchableOpacity style={styles.homeButton} onPress={() => router.replace('/enumerator/dashboard')}>
                <Text style={styles.homeButtonText}>Back to Dashboard</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
        padding: 24,
        justifyContent: 'space-between',
    },
    content: {
        alignItems: 'center',
        paddingTop: 40,
    },
    iconContainer: {
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 8,
    },
    idText: {
        fontSize: 16,
        color: '#6b7280',
        marginBottom: 32,
    },
    card: {
        backgroundColor: '#fff',
        width: '100%',
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        fontSize: 16,
        color: '#4b5563',
    },
    value: {
        fontSize: 16,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: '#f3f4f6',
        marginVertical: 12,
    },
    subtext: {
        fontSize: 12,
        color: '#6b7280',
        fontStyle: 'italic',
        textAlign: 'right',
    },
    gamification: {
        marginTop: 32,
        backgroundColor: '#ecfdf5',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#34d399',
    },
    points: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#059669',
    },
    homeButton: {
        backgroundColor: '#1f2937',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    homeButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    }
});

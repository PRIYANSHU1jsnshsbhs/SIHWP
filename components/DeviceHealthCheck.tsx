import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import * as Location from 'expo-location';
import { Camera } from 'expo-camera';
import * as Network from 'expo-network';
import * as Battery from 'expo-battery';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import TextToSpeech from './TextToSpeech';

export default function DeviceHealthCheck() {
    const router = useRouter();
    const [checks, setChecks] = useState({
        gps: 'loading',     // 'loading' | 'pass' | 'fail'
        camera: 'loading',
        network: 'loading',
        battery: 'loading',
    });

    useEffect(() => {
        runChecks();
    }, []);

    const runChecks = async () => {
        // Reset state
        setChecks({
            gps: 'loading',
            camera: 'loading',
            network: 'loading',
            battery: 'loading',
        });

        // 1. GPS Check
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                const location = await Location.getCurrentPositionAsync({});
                updateCheck('gps', location ? 'pass' : 'fail');
            } else {
                updateCheck('gps', 'fail');
            }
        } catch (e) {
            updateCheck('gps', 'fail');
        }

        // 2. Camera Check
        try {
            const { status } = await Camera.requestCameraPermissionsAsync();
            updateCheck('camera', status === 'granted' ? 'pass' : 'fail');
        } catch (e) {
            updateCheck('camera', 'fail');
        }

        // 3. Network Check
        try {
            const networkState = await Network.getNetworkStateAsync();
            updateCheck('network', networkState.isConnected ? 'pass' : 'fail');
        } catch (e) {
            updateCheck('network', 'fail');
        }

        // 4. Battery Check
        try {
            const batteryLevel = await Battery.getBatteryLevelAsync();
            // -1 means unsupported, otherwise 0.0 to 1.0.  Verify > 15% (0.15)
            if (batteryLevel === -1 || batteryLevel > 0.15) {
                updateCheck('battery', 'pass');
            } else {
                updateCheck('battery', 'warn'); // Or fail if strict
            }
        } catch (e) {
            // Some emulators don't support battery
            updateCheck('battery', 'pass');
        }
    };

    const updateCheck = (key: string, status: string) => {
        setChecks(prev => ({ ...prev, [key]: status }));
    };

    const allPassed = Object.values(checks).every(status => status === 'pass' || status === 'warn');

    const handleProceed = () => {
        if (allPassed) {
            router.replace('/enumerator/dashboard');
        } else {
            Alert.alert("Checks Failed", "Please resolve the issues before proceeding.");
        }
    };

    const getIcon = (status: string) => {
        switch (status) {
            case 'loading': return <ActivityIndicator color="#d97706" />;
            case 'pass': return <Ionicons name="checkmark-circle" size={24} color="green" />;
            case 'warn': return <Ionicons name="warning" size={24} color="orange" />;
            case 'fail': return <Ionicons name="close-circle" size={24} color="red" />;
            default: return null;
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>System Check</Text>
            <Text style={styles.subtitle}>Verifying device readiness for survey...</Text>

            <View style={styles.card}>
                <CheckRow label="GPS Location" status={checks.gps} icon={getIcon(checks.gps)} />
                <CheckRow label="Camera Permission" status={checks.camera} icon={getIcon(checks.camera)} />
                <CheckRow label="Internet Connectivity" status={checks.network} icon={getIcon(checks.network)} />
                <CheckRow label="Battery > 15%" status={checks.battery} icon={getIcon(checks.battery)} />
            </View>

            <TouchableOpacity
                style={[styles.button, { opacity: allPassed ? 1 : 0.5 }]}
                onPress={handleProceed}
                disabled={!allPassed}
            >
                <Text style={styles.buttonText}>Proceed to Dashboard</Text>
            </TouchableOpacity>

            {!allPassed && (
                <TouchableOpacity onPress={runChecks} style={styles.retryButton}>
                    <Text style={styles.retryText}>Retry Checks</Text>
                </TouchableOpacity>
            )}

            <TextToSpeech content={`System Check. Verifying device readiness for survey. GPS Location: ${checks.gps === 'pass' ? 'Passed' : checks.gps === 'loading' ? 'Checking' : 'Failed'}. Camera Permission: ${checks.camera === 'pass' ? 'Passed' : checks.camera === 'loading' ? 'Checking' : 'Failed'}. Internet Connectivity: ${checks.network === 'pass' ? 'Passed' : checks.network === 'loading' ? 'Checking' : 'Failed'}. Battery above 15 percent: ${checks.battery === 'pass' ? 'Passed' : checks.battery === 'loading' ? 'Checking' : 'Low Battery'}. ${allPassed ? 'All checks passed. You can proceed to dashboard.' : 'Please resolve the issues before proceeding.'}`} />
        </View>
    );
}

const CheckRow = ({ label, status, icon }: { label: string, status: string, icon: any }) => (
    <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.statusContainer}>
            {icon}
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 24,
        justifyContent: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#d97706',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
        marginBottom: 32,
        textAlign: 'center',
    },
    card: {
        backgroundColor: '#f9fafb',
        borderRadius: 16,
        padding: 16,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    label: {
        fontSize: 18,
        fontWeight: '600',
        color: '#374151',
    },
    statusContainer: {
        width: 30,
        alignItems: 'center',
    },
    button: {
        backgroundColor: '#d97706',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    retryButton: {
        marginTop: 16,
        alignItems: 'center',
    },
    retryText: {
        color: '#d97706',
        fontWeight: '600',
    }
});

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Image, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

type EvidenceCaptureProps = {
    onCapture: (data: { photoUri: string, location: { lat: number, lng: number } }) => void;
};

export default function EvidenceCapture({ onCapture }: EvidenceCaptureProps) {
    const [permission, requestPermission] = useCameraPermissions();
    const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [photo, setPhoto] = useState<string | null>(null);
    const [loadingLoc, setLoadingLoc] = useState(true);

    const cameraRef = useRef<CameraView>(null);

    useEffect(() => {
        (async () => {
            setLoadingLoc(true);
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
                setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
            } else {
                Alert.alert("Permission Denied", "GPS is required to capture evidence.");
            }
            setLoadingLoc(false);
        })();
    }, []);

    const takePicture = async () => {
        if (cameraRef.current && location) {
            try {
                const photoData = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.5 });
                if (photoData?.uri) {
                    setPhoto(photoData.uri);
                }
            } catch (e) {
                console.log(e);
            }
        }
    };

    const confirmEvidence = () => {
        if (photo && location) {
            onCapture({ photoUri: photo, location });
        }
    };

    const retake = () => {
        setPhoto(null);
    };

    if (!permission) {
        // Camera permissions are still loading.
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>We need your permission to show the camera</Text>
                <TouchableOpacity onPress={requestPermission} style={styles.button}>
                    <Text style={styles.buttonText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (photo) {
        return (
            <View style={styles.container}>
                <Image source={{ uri: photo }} style={styles.preview} />
                <View style={styles.controls}>
                    <TouchableOpacity style={styles.retakeButton} onPress={retake}>
                        <Text style={styles.retakeText}>Retake</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.confirmButton} onPress={confirmEvidence}>
                        <Text style={styles.confirmText}>Use Photo</Text>
                        <Ionicons name="checkmark" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            {/* Location Status Overlay */}
            <View style={styles.statusOverlay}>
                {loadingLoc ? (
                    <View style={styles.statusRow}>
                        <ActivityIndicator color="#fff" size="small" />
                        <Text style={styles.statusText}> Acquiring GPS...</Text>
                    </View>
                ) : location ? (
                    <View style={styles.statusRow}>
                        <Ionicons name="location" size={16} color="#4ade80" />
                        <Text style={styles.statusText}> GPS Locked: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</Text>
                    </View>
                ) : (
                    <View style={styles.statusRow}>
                        <Ionicons name="warning" size={16} color="#ef4444" />
                        <Text style={styles.statusText}> GPS Unavailable</Text>
                    </View>
                )}
            </View>

            <CameraView style={styles.camera} facing="back" ref={cameraRef}>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.captureButton, (!location) && styles.disabledButton]}
                        onPress={takePicture}
                        disabled={!location}
                    >
                        <View style={styles.innerCapture} />
                    </TouchableOpacity>
                </View>
            </CameraView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        overflow: 'hidden',
        borderRadius: 16,
        marginVertical: 10,
        height: 500, // Fixed height for camera section
    },
    camera: {
        flex: 1,
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
        color: '#fff',
    },
    button: {
        backgroundColor: '#d97706',
        padding: 12,
        borderRadius: 8,
        alignSelf: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    buttonContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingBottom: 30,
    },
    captureButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(255,255,255,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    innerCapture: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#fff',
    },
    disabledButton: {
        opacity: 0.5,
    },
    statusOverlay: {
        position: 'absolute',
        top: 20,
        alignSelf: 'center',
        zIndex: 10,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    preview: {
        flex: 1,
        resizeMode: 'cover',
    },
    controls: {
        flexDirection: 'row',
        padding: 20,
        backgroundColor: '#000',
        justifyContent: 'space-between',
    },
    retakeButton: {
        padding: 16,
    },
    retakeText: {
        color: '#fff',
        fontSize: 16,
    },
    confirmButton: {
        backgroundColor: '#d97706',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 25,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    confirmText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    }
});

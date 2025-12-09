import { View, Text, StyleSheet, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import TextToSpeech from '../components/TextToSpeech';

export default function VerifyDelivery() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [step, setStep] = useState(1); // 1 = GPS Check, 2 = Scan User, 3 = Scan Asset
  const [scannedData, setScannedData] = useState({ user: '', asset: '' });
  const [gpsStatus, setGpsStatus] = useState('checking'); // checking, success, fail

  // 1. GEO-FENCING LOGIC (Runs immediately)
  useEffect(() => {
    checkLocation();
  }, []);

  const checkLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Allow location to verify delivery.');
      return;
    }

    // Fake success for Hackathon (Wait 2 seconds then say "You are at the village")
    setTimeout(() => {
      setGpsStatus('success');
    }, 2000);
  };

  // 2. SCANNING LOGIC
  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (step === 2) {
      setScannedData(prev => ({ ...prev, user: data }));
      Alert.alert("User Verified", `Beneficiary ID: ${data}`, [{ text: "Next: Scan Asset", onPress: () => setStep(3) }]);
    } else if (step === 3) {
      setScannedData(prev => ({ ...prev, asset: data }));
      Alert.alert("Success!", `Asset ${data} linked to User ${scannedData.user}. Uploaded!`, [{ text: "Finish", onPress: () => router.back() }]);
    }
  };

  if (!permission) return <View />;
  if (!permission.granted) return <View style={styles.centerOverlay}><Text>Camera Permission Needed</Text><TouchableOpacity onPress={requestPermission}><Text style={{ color: 'blue' }}>Grant Permission</Text></TouchableOpacity></View>;

  return (
    <View style={styles.container}>
      {/* STEP 1: GPS CHECK OVERLAY */}
      {step === 1 && (
        <View style={styles.centerOverlay}>
          {gpsStatus === 'checking' ? (
            <>
              <ActivityIndicator size="large" color="#d97706" />
              <Text style={styles.overlayText}>Verifying Geo-Fence...</Text>
              <Text style={styles.subText}>Are you within 500m of the village?</Text>
            </>
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={80} color="#059669" />
              <Text style={styles.overlayText}>Location Verified!</Text>
              <TouchableOpacity style={styles.btn} onPress={() => setStep(2)}>
                <Text style={styles.btnText}>Start Scanning</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

      {/* STEP 2 & 3: DUAL SCANNER */}
      {step > 1 && (
        <CameraView
          style={StyleSheet.absoluteFillObject}
          onBarcodeScanned={handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr", "ean13"],
          }}
        >
          <View style={styles.scanOverlay}>
            <Text style={styles.scanTitle}>
              {step === 2 ? "Step 1: Scan Beneficiary QR" : "Step 2: Scan Asset Barcode"}
            </Text>
            <View style={styles.scanBox} />
            <Text style={styles.scanSub}>Align code within frame</Text>
          </View>
        </CameraView>
      )}

      <TextToSpeech content={`Verify Delivery Screen. ${step === 1 ? 'Verifying your location. You must be within 500 meters of the village.' : step === 2 ? 'Step 1: Scan the Beneficiary QR code.' : 'Step 2: Scan the Asset Barcode.'} Align the code within the frame to scan.`} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centerOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  overlayText: { fontSize: 24, fontWeight: 'bold', marginTop: 20, textAlign: 'center' },
  subText: { fontSize: 16, color: '#666', marginTop: 10 },
  btn: { marginTop: 30, backgroundColor: '#d97706', padding: 15, borderRadius: 10 },
  btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

  scanOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  scanBox: { width: 250, height: 250, borderWidth: 2, borderColor: '#fff', backgroundColor: 'transparent' },
  scanTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 40, textAlign: 'center' },
  scanSub: { color: '#fff', marginTop: 20 },
});
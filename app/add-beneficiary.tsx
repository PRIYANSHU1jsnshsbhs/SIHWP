import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TextToSpeech from '../components/TextToSpeech';

export default function AddBeneficiary() {
  const router = useRouter();

  // Form State
  const [name, setName] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [income, setIncome] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);

  // 1. CAMERA FUNCTION (FIXED)
  const openCamera = async () => {
    try {
      // Ask for permission explicitly
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert("Permission Required", "You need to allow camera access to take a photo!");
        return;
      }

      // Open Camera with specific media types
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // This line fixes the "doing nothing" bug
        allowsEditing: false, // Keep false for better stability
        quality: 0.5, // Low quality to save space
      });

      if (!result.canceled) {
        setPhoto(result.assets[0].uri); // Save the image path
      }
    } catch (error) {
      Alert.alert("Error", "Could not open camera. Please restart the app.");
    }
  };

  // 2. SAVE OFFLINE FUNCTION
  const handleSave = async () => {
    if (!name || !aadhaar || !photo) {
      Alert.alert("Error", "Please fill Name, Aadhaar and take a Photo.");
      return;
    }

    try {
      // Create the new record
      const newRecord = {
        id: Date.now(), // Unique ID based on time
        name,
        aadhaar,
        income,
        photoUri: photo,
        timestamp: new Date().toISOString(),
        status: 'pending' // Mark as pending upload
      };

      // Get existing data
      const existingData = await AsyncStorage.getItem('offline_beneficiaries');
      const beneficiaries = existingData ? JSON.parse(existingData) : [];

      // Add new record
      beneficiaries.push(newRecord);

      // Save back to phone storage
      await AsyncStorage.setItem('offline_beneficiaries', JSON.stringify(beneficiaries));

      Alert.alert("Success", "Beneficiary Saved Offline! Sync later.");
      router.back(); // Go back to Dashboard

    } catch (error) {
      Alert.alert("Error", "Failed to save data.");
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Beneficiary</Text>
      </View>

      <ScrollView contentContainerStyle={styles.formContainer}>

        {/* INPUT: NAME */}
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Beneficiary Name"
          value={name}
          onChangeText={setName}
        />

        {/* INPUT: AADHAAR */}
        <Text style={styles.label}>Aadhaar Number</Text>
        <TextInput
          style={styles.input}
          placeholder="12 Digit Aadhaar"
          keyboardType="numeric"
          maxLength={12}
          value={aadhaar}
          onChangeText={setAadhaar}
        />

        {/* INPUT: INCOME */}
        <Text style={styles.label}>Annual Income (₹)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 45000"
          keyboardType="numeric"
          value={income}
          onChangeText={setIncome}
        />

        {/* CAMERA SECTION */}
        <Text style={styles.label}>Proof of Identity (Photo)</Text>
        <TouchableOpacity style={styles.cameraBox} onPress={openCamera}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.previewImage} />
          ) : (
            <View style={styles.cameraPlaceholder}>
              <Ionicons name="camera" size={40} color="#d97706" />
              <Text style={styles.cameraText}>Tap to Take Photo</Text>
            </View>
          )}
        </TouchableOpacity>
        {photo && <Text style={styles.photoSuccess}>✅ Photo Captured</Text>}

        {/* SAVE BUTTON */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Record (Offline)</Text>
        </TouchableOpacity>

      </ScrollView>

      <TextToSpeech content="New Beneficiary Registration Form. Enter Full Name of the beneficiary. Enter 12 digit Aadhaar Number. Enter Annual Income in rupees. Take a photo as Proof of Identity. Tap the camera area to capture photo. Then tap Save Record Offline button to save the data." />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: {
    backgroundColor: '#d97706',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: { marginRight: 16 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  formContainer: { padding: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#374151', marginBottom: 8, marginTop: 16 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  cameraBox: {
    height: 200,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#d97706',
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  cameraPlaceholder: { alignItems: 'center' },
  cameraText: { color: '#d97706', marginTop: 8, fontWeight: 'bold' },
  previewImage: { width: '100%', height: '100%' },
  photoSuccess: { color: '#059669', marginTop: 4, fontWeight: 'bold', textAlign: 'center' },
  saveButton: {
    backgroundColor: '#059669', // Green for Success/Save action
    padding: 18,
    borderRadius: 12,
    marginTop: 40,
    alignItems: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
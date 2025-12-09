import React, { useState, useEffect } from 'react';
import {
    View,
    TouchableOpacity,
    Modal,
    Text,
    ScrollView,
    StyleSheet,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';

// 22+ Indian Languages with their language codes
const INDIAN_LANGUAGES = [
    { code: 'en-IN', name: 'English', native: 'English' },
    { code: 'hi-IN', name: 'Hindi', native: 'हिन्दी' },
    { code: 'bn-IN', name: 'Bengali', native: 'বাংলা' },
    { code: 'te-IN', name: 'Telugu', native: 'తెలుగు' },
    { code: 'mr-IN', name: 'Marathi', native: 'मराठी' },
    { code: 'ta-IN', name: 'Tamil', native: 'தமிழ்' },
    { code: 'gu-IN', name: 'Gujarati', native: 'ગુજરાતી' },
    { code: 'kn-IN', name: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'ml-IN', name: 'Malayalam', native: 'മലയാളം' },
    { code: 'or-IN', name: 'Odia', native: 'ଓଡ଼ିଆ' },
    { code: 'pa-IN', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
    { code: 'as-IN', name: 'Assamese', native: 'অসমীয়া' },
    { code: 'ur-IN', name: 'Urdu', native: 'اردو' },
    { code: 'ne-IN', name: 'Nepali', native: 'नेपाली' },
    { code: 'sa-IN', name: 'Sanskrit', native: 'संस्कृतम्' },
    { code: 'ks-IN', name: 'Kashmiri', native: 'कॉशुर' },
    { code: 'sd-IN', name: 'Sindhi', native: 'سنڌي' },
    { code: 'kok-IN', name: 'Konkani', native: 'कोंकणी' },
    { code: 'doi-IN', name: 'Dogri', native: 'डोगरी' },
    { code: 'mni-IN', name: 'Manipuri', native: 'মৈতৈলোন্' },
    { code: 'sat-IN', name: 'Santali', native: 'ᱥᱟᱱᱛᱟᱲᱤ' },
    { code: 'mai-IN', name: 'Maithili', native: 'मैथिली' },
    { code: 'brx-IN', name: 'Bodo', native: 'बड़ो' },
];

type TextToSpeechProps = {
    content: string;
};

export default function TextToSpeech({ content }: TextToSpeechProps) {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState(INDIAN_LANGUAGES[0]);
    const pulseAnim = useState(new Animated.Value(1))[0];

    useEffect(() => {
        // Cleanup: stop speech when component unmounts
        return () => {
            Speech.stop();
        };
    }, []);

    useEffect(() => {
        // Pulse animation when speaking
        if (isSpeaking) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.2,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            pulseAnim.setValue(1);
        }
    }, [isSpeaking, pulseAnim]);

    const handleSpeak = async () => {
        if (isSpeaking) {
            await Speech.stop();
            setIsSpeaking(false);
            return;
        }

        setModalVisible(false);
        setIsSpeaking(true);

        Speech.speak(content, {
            language: selectedLanguage.code,
            pitch: 1.0,
            rate: 0.9,
            onDone: () => setIsSpeaking(false),
            onError: () => setIsSpeaking(false),
            onStopped: () => setIsSpeaking(false),
        });
    };

    const handleLanguageSelect = (lang: typeof INDIAN_LANGUAGES[0]) => {
        setSelectedLanguage(lang);
    };

    const openModal = () => {
        if (isSpeaking) {
            Speech.stop();
            setIsSpeaking(false);
        }
        setModalVisible(true);
    };

    return (
        <>
            {/* Floating Action Button */}
            <Animated.View style={[styles.fabContainer, { transform: [{ scale: pulseAnim }] }]}>
                <TouchableOpacity
                    style={[styles.fab, isSpeaking && styles.fabSpeaking]}
                    onPress={isSpeaking ? handleSpeak : openModal}
                    activeOpacity={0.8}
                >
                    <Ionicons
                        name={isSpeaking ? 'stop' : 'volume-high'}
                        size={28}
                        color="#fff"
                    />
                </TouchableOpacity>
            </Animated.View>

            {/* Language Selection Modal */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {/* Header */}
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>🔊 Select Language</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#1f2937" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalSubtitle}>
                            Choose a language to read the page content
                        </Text>

                        {/* Language Grid */}
                        <ScrollView style={styles.languageList} showsVerticalScrollIndicator={false}>
                            <View style={styles.languageGrid}>
                                {INDIAN_LANGUAGES.map((lang) => (
                                    <TouchableOpacity
                                        key={lang.code}
                                        style={[
                                            styles.languageItem,
                                            selectedLanguage.code === lang.code && styles.languageItemSelected,
                                        ]}
                                        onPress={() => handleLanguageSelect(lang)}
                                    >
                                        <Text style={[
                                            styles.languageNative,
                                            selectedLanguage.code === lang.code && styles.languageTextSelected,
                                        ]}>
                                            {lang.native}
                                        </Text>
                                        <Text style={[
                                            styles.languageName,
                                            selectedLanguage.code === lang.code && styles.languageTextSelected,
                                        ]}>
                                            {lang.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>

                        {/* Speak Button */}
                        <TouchableOpacity style={styles.speakButton} onPress={handleSpeak}>
                            <Ionicons name="volume-high" size={24} color="#fff" />
                            <Text style={styles.speakButtonText}>
                                Read in {selectedLanguage.name}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    fabContainer: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        zIndex: 999,
    },
    fab: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#d97706',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    fabSpeaking: {
        backgroundColor: '#ef4444',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 20,
    },
    languageList: {
        maxHeight: 350,
    },
    languageGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 10,
    },
    languageItem: {
        width: '48%',
        backgroundColor: '#f3f4f6',
        borderRadius: 12,
        padding: 14,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    languageItemSelected: {
        backgroundColor: '#fef3c7',
        borderColor: '#d97706',
    },
    languageNative: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 4,
    },
    languageName: {
        fontSize: 12,
        color: '#6b7280',
    },
    languageTextSelected: {
        color: '#92400e',
    },
    speakButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#d97706',
        borderRadius: 16,
        padding: 16,
        marginTop: 20,
        gap: 10,
    },
    speakButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Network from 'expo-network';

export const useOfflineSync = () => {
    const [isSyncing, setIsSyncing] = useState(false);

    // Helper: Update points and streak
    const updateGamificationStats = async () => {
        try {
            const statsRaw = await AsyncStorage.getItem('enumerator_stats');
            const stats = statsRaw ? JSON.parse(statsRaw) : { points: 0, streak: 0, lastSurveyDate: null };

            const today = new Date().toDateString();
            const yesterday = new Date(Date.now() - 86400000).toDateString();

            // Add points
            stats.points = (stats.points || 0) + 50;

            // Update streak
            if (stats.lastSurveyDate === yesterday) {
                stats.streak = (stats.streak || 0) + 1;
            } else if (stats.lastSurveyDate !== today) {
                stats.streak = 1; // Reset streak if not consecutive
            }

            stats.lastSurveyDate = today;
            await AsyncStorage.setItem('enumerator_stats', JSON.stringify(stats));
        } catch (e) {
            console.log('Gamification update error:', e);
        }
    };


    const saveSurvey = async (data: any) => {
        setIsSyncing(true);
        try {
            const networkState = await Network.getNetworkStateAsync();
            const isOnline = networkState.isConnected && networkState.isInternetReachable;

            // Mask Aadhaar for final storage
            const maskedAadhaar = data.beneficiary?.aadhaar
                ? 'XXXX-XXXX-' + data.beneficiary.aadhaar.slice(-4)
                : '';

            const finalData = {
                ...data,
                beneficiary: {
                    ...data.beneficiary,
                    aadhaar: maskedAadhaar // Store masked version
                },
                // Ensure GPS key structure matches requirements if not already
                gps: data.evidence?.location
                    ? { lat: data.evidence.location.lat, lng: data.evidence.location.lng }
                    : null,
                timestamp: new Date().toISOString(),
                surveyId: Math.random().toString(36).substring(2) + Date.now().toString(36),
                syncStatus: isOnline ? 'SYNCED' : 'PENDING'
            };

            // 1. Always save to local storage (Offline First / Backup)
            const existing = await AsyncStorage.getItem('pending_surveys');
            const surveys = existing ? JSON.parse(existing) : [];
            surveys.push(finalData);
            await AsyncStorage.setItem('pending_surveys', JSON.stringify(surveys));

            // 2. Also record the FULL Aadhaar as surveyed for duplication check (locally only)
            const surveyed = await AsyncStorage.getItem('surveyed_aadhaars');
            const aadhaarList = surveyed ? JSON.parse(surveyed) : [];
            if (data.beneficiary?.aadhaar) {
                aadhaarList.push(data.beneficiary.aadhaar); // Keep full for dedupe check
                await AsyncStorage.setItem('surveyed_aadhaars', JSON.stringify(aadhaarList));
            }

            // 3. Update gamification stats (points + streak)
            await updateGamificationStats();

            // 4. If Online, simulate API upload
            if (isOnline) {
                // await api.post('/surveys', finalData);
                console.log("Uploaded to cloud");
                return { status: 'Uploaded', message: 'Sent to Ministry ☁' };
            } else {
                return { status: 'Saved Offline', message: 'Saved to Device 📱' };
            }

        } catch (error) {
            console.error(error);
            return { status: 'Error', message: 'Failed to save' };
        } finally {
            setIsSyncing(false);
        }
    };

    return { saveSurvey, isSyncing };
};

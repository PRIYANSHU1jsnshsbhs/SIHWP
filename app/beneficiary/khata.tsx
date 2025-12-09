import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TextToSpeech from '../../components/TextToSpeech';

type KhataEntry = {
    id: string;
    amount: number;
    description: string;
    date: string;
};

export default function KhataScreen() {
    const router = useRouter();
    const [entries, setEntries] = useState<KhataEntry[]>([]);
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        loadEntries();
    }, []);

    const loadEntries = async () => {
        try {
            const raw = await AsyncStorage.getItem('khata_entries');
            if (raw) {
                setEntries(JSON.parse(raw));
            }
        } catch (e) {
            console.log('Error:', e);
        }
    };

    const addEntry = async () => {
        if (!amount || Number(amount) <= 0) {
            Alert.alert('Invalid Amount', 'Please enter a valid amount');
            return;
        }

        const newEntry: KhataEntry = {
            id: Date.now().toString(),
            amount: Number(amount),
            description: description || 'Daily Sale',
            date: new Date().toISOString(),
        };

        const updated = [newEntry, ...entries];
        setEntries(updated);
        await AsyncStorage.setItem('khata_entries', JSON.stringify(updated));

        setAmount('');
        setDescription('');
        setShowForm(false);
        Alert.alert('✅ Entry Added', `₹${amount} recorded successfully!`);
    };

    const trustScore = Math.min(100, Math.round(entries.length * 2.5 + (entries.length >= 30 ? 25 : 0)));
    const totalEarnings = entries.reduce((sum, e) => sum + e.amount, 0);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Digital Khata</Text>
                <TouchableOpacity onPress={() => setShowForm(!showForm)}>
                    <Ionicons name={showForm ? 'close' : 'add'} size={28} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>₹{totalEarnings.toLocaleString()}</Text>
                    <Text style={styles.statLabel}>Total Earnings</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>{entries.length}</Text>
                    <Text style={styles.statLabel}>Entries</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={[styles.statValue, { color: trustScore >= 75 ? '#059669' : '#d97706' }]}>
                        {trustScore}
                    </Text>
                    <Text style={styles.statLabel}>Trust Score</Text>
                </View>
            </View>

            {/* Add Entry Form */}
            {showForm && (
                <View style={styles.formCard}>
                    <Text style={styles.formTitle}>Add Today's Sale</Text>
                    <View style={styles.row}>
                        <TextInput
                            style={[styles.input, { flex: 1 }]}
                            placeholder="Amount (₹)"
                            keyboardType="numeric"
                            value={amount}
                            onChangeText={setAmount}
                        />
                        <TextInput
                            style={[styles.input, { flex: 2, marginLeft: 12 }]}
                            placeholder="Description (optional)"
                            value={description}
                            onChangeText={setDescription}
                        />
                    </View>
                    <TouchableOpacity style={styles.addButton} onPress={addEntry}>
                        <Ionicons name="checkmark" size={20} color="#fff" />
                        <Text style={styles.addButtonText}>Add Entry</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Entries List */}
            <FlatList
                data={entries}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="book-outline" size={48} color="#d1d5db" />
                        <Text style={styles.emptyText}>No entries yet</Text>
                        <Text style={styles.emptyHint}>Tap + to add your first sale</Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <View style={styles.entryCard}>
                        <View style={styles.entryLeft}>
                            <Text style={styles.entryAmount}>₹{item.amount.toLocaleString()}</Text>
                            <Text style={styles.entryDesc}>{item.description}</Text>
                        </View>
                        <Text style={styles.entryDate}>
                            {new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </Text>
                    </View>
                )}
            />

            <TextToSpeech content={`Digital Khata. Total Earnings: ${totalEarnings} rupees. Total Entries: ${entries.length}. Trust Score: ${trustScore}. ${trustScore >= 75 ? 'You are eligible for MUDRA Loan!' : `Keep logging to reach a Trust Score of 75.`} Tap the plus button to add today's sale.`} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    header: {
        backgroundColor: '#d97706',
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    statsRow: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    statLabel: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 4,
    },
    formCard: {
        backgroundColor: '#fff',
        margin: 16,
        marginTop: 0,
        padding: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    formTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    addButton: {
        backgroundColor: '#059669',
        padding: 14,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    list: {
        padding: 16,
        paddingTop: 0,
    },
    empty: {
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 18,
        color: '#6b7280',
        marginTop: 12,
    },
    emptyHint: {
        fontSize: 14,
        color: '#9ca3af',
        marginTop: 4,
    },
    entryCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    entryLeft: {},
    entryAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#059669',
    },
    entryDesc: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 2,
    },
    entryDate: {
        fontSize: 14,
        color: '#9ca3af',
    },
});

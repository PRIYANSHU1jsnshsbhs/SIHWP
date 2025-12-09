import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Mock Data
const LOCATIONS: Record<string, any> = {
    "Maharashtra": {
        "Pune": {
            "Haveli": ["Wagholi", "Lohegaon", "Kharadi"],
            "Mulshi": ["Hinjewadi", "Pirangut"]
        },
        "Nagpur": {
            "Nagpur Rural": ["Kamptee", "Hingna"]
        }
    },
    "Uttar Pradesh": {
        "Lucknow": {
            "Bakshi Ka Talab": ["Itaunja", "Kathwara"]
        }
    }
};

type LocationSelectorProps = {
    onSelect: (location: { state: string, district: string, block: string, village: string }) => void;
};

export default function LocationSelector({ onSelect }: LocationSelectorProps) {
    const [state, setState] = useState('');
    const [district, setDistrict] = useState('');
    const [block, setBlock] = useState('');
    const [village, setVillage] = useState('');

    const [modalVisible, setModalVisible] = useState(false);
    const [selectionType, setSelectionType] = useState<'state' | 'district' | 'block' | 'village'>('state');

    const getOptions = () => {
        switch (selectionType) {
            case 'state': return Object.keys(LOCATIONS);
            case 'district': return state ? Object.keys(LOCATIONS[state] || {}) : [];
            case 'block': return (state && district) ? Object.keys(LOCATIONS[state][district] || {}) : [];
            case 'village': return (state && district && block) ? LOCATIONS[state][district][block] || [] : [];
            default: return [];
        }
    };

    const handleSelect = (item: string) => {
        switch (selectionType) {
            case 'state':
                setState(item); setDistrict(''); setBlock(''); setVillage('');
                break;
            case 'district':
                setDistrict(item); setBlock(''); setVillage('');
                break;
            case 'block':
                setBlock(item); setVillage('');
                break;
            case 'village':
                setVillage(item);
                onSelect({ state, district, block, village: item });
                break;
        }
        setModalVisible(false);
    };

    const openSelection = (type: 'state' | 'district' | 'block' | 'village') => {
        setSelectionType(type);
        setModalVisible(true);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Select Survey Location</Text>

            <Dropdown label="State" value={state} onPress={() => openSelection('state')} />
            <Dropdown label="District" value={district} disabled={!state} onPress={() => openSelection('district')} />
            <Dropdown label="Block" value={block} disabled={!district} onPress={() => openSelection('block')} />
            <Dropdown label="Village" value={village} disabled={!block} onPress={() => openSelection('village')} />

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select {selectionType}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#000" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={getOptions()}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={styles.option} onPress={() => handleSelect(item)}>
                                    <Text style={styles.optionText}>{item}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const Dropdown = ({ label, value, onPress, disabled }: any) => (
    <TouchableOpacity style={[styles.dropdown, disabled && styles.disabled]} onPress={onPress} disabled={disabled}>
        <View>
            <Text style={styles.label}>{label}</Text>
            <Text style={[styles.value, !value && styles.placeholder]}>{value || "Select..."}</Text>
        </View>
        <Ionicons name="chevron-down" size={20} color="#6b7280" />
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#1f2937',
    },
    dropdown: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        marginBottom: 12,
        backgroundColor: '#f9fafb',
    },
    disabled: {
        opacity: 0.5,
        backgroundColor: '#f3f4f6',
    },
    label: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 2,
    },
    value: {
        fontSize: 16,
        color: '#111827',
        fontWeight: '500',
    },
    placeholder: {
        color: '#9ca3af',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '50%',
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textTransform: 'capitalize',
    },
    option: {
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    optionText: {
        fontSize: 16,
        color: '#374151',
    }
});

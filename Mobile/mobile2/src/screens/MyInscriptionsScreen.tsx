import React, { useEffect, useState, useContext, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../lib/api';
import { AuthContext } from '../context/AuthContext';

export default function MyInscriptionsScreen() {
    const [inscriptions, setInscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const { logout } = useContext(AuthContext);

    const loadInscriptions = async () => {
        try {
            setError(null);
            const response = await api.get('/inscriptions/me');
            setInscriptions(Array.isArray(response.data) ? response.data : []);
        } catch (err: any) {
            console.log('Erreur /inscriptions/me :', err);
            if (err?.response?.status === 401) {
                await logout();
                return;
            }
            setError(err?.response?.data?.message || err?.message || 'Erreur chargement inscriptions');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const cancelInscription = async (id: number) => {
        try {
            await api.delete(`/inscriptions/${id}`);
            Alert.alert('Succès', 'Inscription annulée');
            await loadInscriptions();
        } catch (err: any) {
            Alert.alert('Erreur', err?.response?.data?.message || err?.message || 'Impossible d\'annuler');
        }
    };

    useEffect(() => {
        loadInscriptions();
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadInscriptions();
        }, [])
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Chargement de vos inscriptions...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.center}>
                <Text style={styles.error}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.header}>Mes inscriptions</Text>
                <TouchableOpacity onPress={logout} style={styles.logoutButton}>
                    <Text style={styles.logoutText}>Déconnexion</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={inscriptions}
                keyExtractor={(item: any) => (item.inscription_id?.toString() || item.id?.toString())}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadInscriptions(); }} />}
                ListEmptyComponent={<Text>Aucune inscription trouvée.</Text>}
                renderItem={({ item }: { item: any }) => {
                    const event = item.evenement || item.event || {};
                    return (
                        <View style={styles.card}>
                            <Text style={styles.title}>{event.titre || 'Événement inconnu'}</Text>
                            <Text>Date : {event.date_debut ? new Date(event.date_debut).toLocaleString() : 'N/A'}</Text>
                            <Text>Lieu : {event.lieu_id || 'N/A'}</Text>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => cancelInscription(item.inscription_id)}>
                                <Text style={styles.cancelText}>Annuler</Text>
                            </TouchableOpacity>
                        </View>
                    );
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f4fb', padding: 16 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    header: { fontSize: 26, fontWeight: '800', color: '#22345a' },
    logoutButton: { backgroundColor: '#5f5cd0', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, shadowColor: '#2e3568', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.2, shadowRadius: 7, elevation: 3 },
    logoutText: { color: '#fff', fontWeight: '700' },
    card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 14, borderWidth: 0, shadowColor: '#15223f', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 4 },
    title: { fontSize: 19, fontWeight: '700', marginBottom: 6, color: '#213255' },
    metaText: { fontSize: 15, color: '#4f5d7f' },
    cancelButton: { marginTop: 12, backgroundColor: '#d44646', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
    cancelText: { color: '#fff', fontWeight: '700' },
    error: { color: '#bf2f2f', fontWeight: '700', textAlign: 'center' },
});

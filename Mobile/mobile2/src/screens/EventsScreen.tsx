import { useEffect, useState, useContext, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import api from '../lib/api';
import { AuthContext } from '../context/AuthContext';

type Event = {
    id?: number;
    evenement_id?: number;
    title?: string;
    titre?: string;
    date?: string;
    date_debut?: string;
    location?: string;
    lieu?: string;
    lieu_id?: string | number;
    price?: number;
    prix?: number;
    capacity?: number;
    capacite?: number;
    participantsCount?: number;
    participants_count?: number;
};

export default function EventsScreen() {
    const navigation = useNavigation();
    const { logout } = useContext(AuthContext);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const loadEvents = async () => {
        try {
            setError(null);
            const response = await api.get('/events');
            const data = Array.isArray(response.data) ? response.data : [];
            const normalized = data.map((item: any, index: number) => ({
                ...item,
                id: item.id ?? item.evenement_id ?? index,
                title: item.title ?? item.titre ?? 'Événement',
                date: item.date ?? item.date_debut ?? 'Date non disponible',
                location: item.location ?? item.lieu ?? item.lieu_id ?? 'Lieu non disponible',
                price: item.price ?? item.prix ?? 0,
                participantsCount: item.participantsCount ?? item.participants_count ?? (item.inscriptions ? item.inscriptions.length : 0),
            }));
            setEvents(normalized);
        } catch (err) {
            console.log('Erreur fetch:', err);
            const message = err && typeof err === 'object' && 'message' in err ? (err as any).message : 'Erreur inconnue';
            setError(message as string);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadEvents();
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadEvents();
        }, [])
    );

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Chargement des événements...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <Text style={styles.error}>⚠️ Erreur : {error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.rowTop}>
                <Text style={styles.header}>Liste des événements</Text>
                <TouchableOpacity style={styles.logoutButton} onPress={logout}><Text style={styles.logoutText}>Déconnexion</Text></TouchableOpacity>
            </View>
            <FlatList
                data={events as Event[]}
                keyExtractor={(item: Event, index) => String(item.id ?? index)}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadEvents(); }} />}
                ListEmptyComponent={() => <Text>Aucun événement disponible.</Text>}
                renderItem={({ item }: { item: Event }) => (
                    <TouchableOpacity
                        style={styles.eventCard}
                        onPress={() => (navigation as any).navigate('Detail', { eventId: item.id ?? item.evenement_id })}>
                        <Text style={styles.title}>{item.title}</Text>
                        <Text>Date : {item.date}</Text>
                        <Text>Lieu : {item.location}</Text>
                        {item.price != null && <Text>Prix : {item.price > 0 ? `${item.price} €` : 'Gratuit'}</Text>}
                        {item.participantsCount != null && <Text>Participants : {item.participantsCount}</Text>}
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f4fb', padding: 16 },
    rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    header: { fontSize: 28, fontWeight: 'bold', color: '#2a3a5d', letterSpacing: 0.5 },
    logoutButton: { backgroundColor: '#6d5bd0', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, shadowColor: '#1f2761', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 5 },
    logoutText: { color: '#fff', fontWeight: '700' },
    eventCard: { backgroundColor: '#fff', padding: 18, marginBottom: 12, borderRadius: 14, borderWidth: 0, shadowColor: '#0f214a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
    title: { fontSize: 20, fontWeight: '800', marginBottom: 8, color: '#22305e' },
    meta: { fontSize: 14, color: '#5e6d89', marginBottom: 4 },
    error: { color: '#c0392b', fontWeight: '700', marginBottom: 10, textAlign: 'center' },
});

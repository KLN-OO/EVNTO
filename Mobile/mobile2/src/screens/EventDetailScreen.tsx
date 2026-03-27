import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import api from '../lib/api';
import { AuthContext } from '../context/AuthContext';

type ParamList = {
    Detail: { eventId: number };
};

type EventDetail = {
    id: number;
    title: string;
    description: string;
    date: string;
    location: string;
    price: number;
    capacity: number;
    participantsCount: number;
    organizer?: { nom?: string; prenom?: string; username?: string };
    isParticipant?: boolean;
};

export default function EventDetailScreen() {
    const route = useRoute<RouteProp<ParamList, 'Detail'>>();
    const navigation = useNavigation();
    const { eventId } = route.params;
    const [event, setEvent] = useState(null);
    const [isParticipant, setIsParticipant] = useState(false);
    const [inscriptionId, setInscriptionId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const { logout } = useContext(AuthContext);

    const fetchEvent = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get(`/events/${eventId}`);
            setEvent(res.data);
            navigation.setOptions({ title: res.data.title || 'Détail événement' } as any);

            // Vérifie l'inscription utilisateur sur cet événement
            try {
                const me = await api.get('/inscriptions/me');
                const own = Array.isArray(me.data)
                    ? me.data.find((insc: any) => {
                        const e = insc.evenement || insc.event || null;
                        return e && Number(e.evenement_id || e.id) === Number(eventId);
                    })
                    : null;
                if (own) {
                    setIsParticipant(true);
                    setInscriptionId(own.inscription_id || own.id || null);
                } else {
                    setIsParticipant(false);
                    setInscriptionId(null);
                }
            } catch (err2: any) {
                console.log('Erreur check inscription :', err2);
            }
        } catch (err: any) {
            setError(err?.response?.data?.message || err?.message || 'Impossible de récupérer l\'événement');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvent();
    }, [eventId]);

    const joinEvent = async () => {
        if (!event) return;
        setActionLoading(true);
        try {
            const res = await api.post(`/inscriptions/events/${eventId}/inscriptions`);
            Alert.alert('Succès', res.data?.message || 'Inscription réussie');
            await fetchEvent();
        } catch (err: any) {
            Alert.alert('Erreur', err?.response?.data?.message || err?.message || 'Impossible de s\'inscrire');
            if (err?.response?.status === 401) {
                await logout();
            }
        } finally {
            setActionLoading(false);
        }
    };

    const leaveEvent = async () => {
        if (!event || !inscriptionId) {
            Alert.alert('Erreur', 'Aucune inscription trouvée à annuler');
            return;
        }
        setActionLoading(true);
        try {
            await api.delete(`/inscriptions/${inscriptionId}`);
            Alert.alert('Succès', 'Désinscription réussie');
            await fetchEvent();
        } catch (err: any) {
            Alert.alert('Erreur', err?.response?.data?.message || err?.message || 'Impossible de se désinscrire');
            if (err?.response?.status === 401) {
                await logout();
            }
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Chargement des détails...</Text>
            </View>
        );
    }

    if (error || !event) {
        return (
            <View style={styles.center}>
                <Text style={styles.error}>{error || 'Événement introuvable.'}</Text>
            </View>
        );
    }

    const isFull = event.capacity && event.participantsCount >= event.capacity;
    const actionLabel = actionLoading ? '...' : event.price > 0 ? `S'inscrire (${event.price} €)` : "S'inscrire (Gratuit)";

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <Text style={styles.title}>{event.title || event.titre || 'Titre introuvable'}</Text>
            <Text style={styles.meta}>Date : {event.date || event.date_debut || 'Non renseignée'}</Text>
            <Text style={styles.meta}>Lieu : {event.location || event.lieu || event.lieu_id || 'Non renseigné'}</Text>
            <Text style={styles.meta}>Places : {(event.participantsCount ?? event.participants_count ?? 0)}/{event.capacity ?? event.capacite ?? 'N/A'}</Text>
            <Text style={styles.meta}>Prix : {(event.price ?? event.prix ?? 0) > 0 ? `${event.price ?? event.prix} €` : 'Gratuit'}</Text>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text>{event.description || 'Aucune description'}</Text>

            <Text style={styles.sectionTitle}>Organisateur</Text>
            <Text style={styles.meta}>{event.organizer ? `${event.organizer.prenom || ''} ${event.organizer.nom || ''}`.trim() : 'Non renseigné'}</Text>

            <View style={[styles.actions, { marginTop: 24 }]}>
                {isParticipant ? (
                    <TouchableOpacity style={[styles.button, { backgroundColor: '#d32f2f' }]} onPress={leaveEvent} disabled={actionLoading}>
                        <Text style={styles.buttonText}>{actionLoading ? '...' : 'Se désinscrire'}</Text>
                    </TouchableOpacity>
                ) : isFull ? (
                    <Text style={styles.fullText}>Événement complet</Text>
                ) : (
                    <TouchableOpacity style={styles.button} onPress={joinEvent} disabled={actionLoading}>
                        <Text style={styles.buttonText}>{actionLabel}</Text>
                    </TouchableOpacity>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#ebf1fb' },
    contentContainer: { padding: 20 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    title: { fontSize: 30, fontWeight: '900', marginBottom: 12, color: '#1f3154' },
    meta: { fontSize: 15, color: '#445a80', marginBottom: 8 },
    sectionTitle: { marginTop: 18, fontSize: 20, fontWeight: '700', marginBottom: 8, color: '#2a4366' },
    actions: { marginTop: 24, alignItems: 'center' },
    button: { backgroundColor: '#4f79e0', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, shadowColor: '#3365c2', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4 },
    buttonText: { color: '#fff', fontWeight: '800', fontSize: 16 },
    fullText: { color: '#bf360c', fontWeight: '700', fontSize: 16 },
    error: { color: '#c0392b', fontSize: 16, fontWeight: '700' },
});

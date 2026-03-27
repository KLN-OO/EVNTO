import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';

export default function ProfileScreen() {
    const { user, logout, updateProfile } = useContext(AuthContext);
    const [editing, setEditing] = React.useState(false);
    const [email, setEmail] = React.useState(user?.email ?? '');
    const [username, setUsername] = React.useState(user?.nom_utilisateur ?? '');
    const [prenom, setPrenom] = React.useState(user?.prenom ?? '');
    const [nom, setNom] = React.useState(user?.nom ?? '');
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        setEmail(user?.email ?? '');
        setUsername(user?.nom_utilisateur ?? '');
        setPrenom(user?.prenom ?? '');
        setNom(user?.nom ?? '');
    }, [user]);

    const handleSave = async () => {
        if (!email.trim() || !username.trim()) {
            Alert.alert('Validation', 'Email et nom d\'utilisateur sont requis.');
            return;
        }
        setLoading(true);
        try {
            await updateProfile({ email, nom_utilisateur: username, prenom, nom });
            setEditing(false);
        } catch (_) {
            // message géré par context
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Mon profil</Text>
                {editing ? (
                    <>
                        <Text style={styles.label}>Email</Text>
                        <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
                        <Text style={styles.label}>Nom d'utilisateur</Text>
                        <TextInput style={styles.input} value={username} onChangeText={setUsername} />
                        <Text style={styles.label}>Prénom</Text>
                        <TextInput style={styles.input} value={prenom} onChangeText={setPrenom} />
                        <Text style={styles.label}>Nom</Text>
                        <TextInput style={styles.input} value={nom} onChangeText={setNom} />
                        <TouchableOpacity style={[styles.saveButton, { opacity: loading ? 0.6 : 1 }]} onPress={handleSave} disabled={loading}>
                            <Text style={styles.saveText}>{loading ? 'Enregistrement...' : 'Enregistrer'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setEditing(false)} style={styles.cancelButton}>
                            <Text style={styles.cancelText}>Annuler</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <Text style={styles.label}>Email</Text>
                        <Text style={styles.value}>{user?.email ?? 'Email non disponible'}</Text>
                        <Text style={styles.label}>Nom d'utilisateur</Text>
                        <Text style={styles.value}>{user?.nom_utilisateur ?? user?.username ?? 'Non défini'}</Text>
                        <Text style={styles.label}>Prénom</Text>
                        <Text style={styles.value}>{user?.prenom ?? 'Non défini'}</Text>
                        <Text style={styles.label}>Nom</Text>
                        <Text style={styles.value}>{user?.nom ?? 'Non défini'}</Text>
                        <TouchableOpacity style={styles.editButton} onPress={() => setEditing(true)}>
                            <Text style={styles.editText}>Modifier le profil</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>

            <TouchableOpacity onPress={logout} style={styles.logoutButton}>
                <Text style={styles.logoutText}>Déconnexion</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#eef2f9', padding: 16, justifyContent: 'center' },
    card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 18, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
    title: { fontSize: 24, fontWeight: '800', marginBottom: 16, textAlign: 'center', color: '#2c3e50' },
    label: { fontSize: 14, color: '#526480', marginTop: 8 },
    value: { fontSize: 16, fontWeight: '600', color: '#23304a' },
    input: { borderWidth: 1, borderColor: '#d5dbe8', borderRadius: 10, padding: 10, marginTop: 6, color: '#2c3e50' },
    editButton: { marginTop: 18, backgroundColor: '#4f79e0', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
    editText: { color: '#fff', fontWeight: '700', fontSize: 16 },
    saveButton: { marginTop: 16, backgroundColor: '#2e8b57', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
    saveText: { color: '#fff', fontWeight: '700', fontSize: 16 },
    cancelButton: { marginTop: 10, alignItems: 'center' },
    cancelText: { color: '#7a7f8f', fontWeight: '700' },
    logoutButton: { backgroundColor: '#e74c3c', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginHorizontal: 16 },
    logoutText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
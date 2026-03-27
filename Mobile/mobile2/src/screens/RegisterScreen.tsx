import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { AuthContext } from '../context/AuthContext';

interface RegisterForm {
    nom_utilisateur: string;
    email: string;
    mot_de_passe: string;
    prenom: string;
    nom: string;
}

export default function RegisterScreen({ navigation }: any) {
    const [form, setForm] = useState<RegisterForm>({ nom_utilisateur: '', email: '', mot_de_passe: '', prenom: '', nom: '' });
    const [loading, setLoading] = useState(false);
    const { register } = useContext(AuthContext);

    const handleChange = (field: keyof RegisterForm, value: string) => setForm({ ...form, [field]: value });

    const handleRegister = async () => {
        if (!form.nom_utilisateur.trim() || !form.email.trim() || !form.mot_de_passe.trim()) {
            alert('Pseudo, email et mot de passe sont requis');
            return;
        }
        setLoading(true);
        try {
            await register(form);
            navigation.navigate('Login');
        } catch (err) {
            console.log('Register error', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={styles.box}>
                <Text style={styles.title}>Inscription</Text>

                <Text style={styles.label}>Pseudo</Text>
                <TextInput style={styles.input} placeholder="Votre pseudo" value={form.nom_utilisateur} onChangeText={(t) => handleChange('nom_utilisateur', t)} />

                <Text style={styles.label}>Prénom (optionnel)</Text>
                <TextInput style={styles.input} placeholder="Votre prénom" value={form.prenom} onChangeText={(t) => handleChange('prenom', t)} />

                <Text style={styles.label}>Nom (optionnel)</Text>
                <TextInput style={styles.input} placeholder="Votre nom" value={form.nom} onChangeText={(t) => handleChange('nom', t)} />

                <Text style={styles.label}>Email</Text>
                <TextInput style={styles.input} placeholder="exemple@domaine.com" keyboardType="email-address" autoCapitalize="none" value={form.email} onChangeText={(t) => handleChange('email', t)} />

                <Text style={styles.label}>Mot de passe</Text>
                <TextInput style={styles.input} placeholder="••••••••" secureTextEntry value={form.mot_de_passe} onChangeText={(t) => handleChange('mot_de_passe', t)} />

                <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>S'inscrire</Text>}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.linkButton}>
                    <Text style={styles.linkText}>Déjà un compte ? Se connecter</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f7f7f7', padding: 16 },
    box: { width: '100%', maxWidth: 420, backgroundColor: '#fff', padding: 20, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20, elevation: 5 },
    title: { fontSize: 26, fontWeight: '700', marginBottom: 20, textAlign: 'center' },
    label: { color: '#333', fontWeight: '600', marginBottom: 4, marginTop: 8 },
    input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12 },
    button: { backgroundColor: '#0066cc', padding: 14, borderRadius: 8, alignItems: 'center' },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    linkButton: { marginTop: 14 },
    linkText: { color: '#0066cc', textAlign: 'center' },
});
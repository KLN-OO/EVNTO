import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ImageBackground } from 'react-native';
import { AuthContext } from '../context/AuthContext';

export default function LoginScreen({ navigation }: any) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);

    const handleSubmit = async () => {
        if (!email.trim() || !password.trim()) {
            alert('Veuillez remplir tous les champs');
            return;
        }
        setLoading(true);
        try {
            await login(email, password);
        } catch (err) {
            console.log('Login error', err);
        } finally {
            setLoading(false);
        }
    };

    const bgImage = { uri: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80' };

    return (
        <ImageBackground source={bgImage} style={styles.background} resizeMode="cover">
            <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <View style={styles.box}>
                    <Text style={styles.title}>Connexion</Text>
                    <Text style={styles.label}>Adresse e-mail</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="exemple@domaine.com"
                        autoCapitalize="none"
                        keyboardType="email-address"
                        value={email}
                        onChangeText={setEmail}
                        accessibilityLabel="Email"
                    />

                    <Text style={styles.label}>Mot de passe</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="••••••••••"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                        accessibilityLabel="Mot de passe"
                    />
                    <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Se connecter</Text>}
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('Register')}>
                        <Text style={styles.linkText}>Créer un compte</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: { flex: 1, width: '100%', height: '100%' },
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16, backgroundColor: 'rgba(0,0,0,0.35)' },
    box: { width: '100%', maxWidth: 420, backgroundColor: 'rgba(255,255,255,0.95)', padding: 22, borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 22, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
    title: { fontSize: 26, fontWeight: '700', marginBottom: 20, textAlign: 'center', color: '#1f2e4f' },
    label: { fontSize: 14, color: '#546a80', marginBottom: 6, fontWeight: '600' },
    input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12 },
    button: { backgroundColor: '#0066cc', padding: 14, borderRadius: 8, alignItems: 'center' },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    linkButton: { marginTop: 10, alignItems: 'center' },
    linkText: { color: '#0066cc', fontSize: 15 },
});

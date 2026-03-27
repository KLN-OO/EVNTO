import React, { createContext, useState, useEffect, useMemo } from 'react';
import { Alert } from 'react-native';
import api from '../lib/api';
import { getToken, saveToken, removeToken, saveUser, getUser, clearStorage } from '../lib/storage';

type AuthContextType = {
    userToken: string | null;
    user: any | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (payload: { nom_utilisateur: string; email: string; mot_de_passe: string; prenom?: string; nom?: string }) => Promise<void>;
    updateProfile: (payload: { nom_utilisateur?: string; email?: string; prenom?: string; nom?: string }) => Promise<void>;
    logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
    userToken: null,
    user: null,
    isLoading: true,
    login: async (email: string, password: string) => { },
    register: async (payload: any) => { },
    updateProfile: async (payload: any) => { },
    logout: async () => { },
});

export const AuthProvider = ({ children }: { children: any }) => {
    const [userToken, setUserToken] = useState(null);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            try {
                const token = await getToken();
                const savedUser = await getUser();
                if (token) {
                    setUserToken(token);
                    if (savedUser) {
                        setUser(savedUser);
                    } else {
                        const profile = await api.get('/utilisateurs/me');
                        setUser(profile.data);
                        await saveUser(profile.data);
                    }
                }
            } catch (err) {
                console.log('Auth init error', err);
            } finally {
                setIsLoading(false);
            }
        };
        initAuth();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response = await api.post('/utilisateurs/login', { email, mot_de_passe: password });
            const { token } = response.data;
            if (!token) throw new Error('Token introuvable');
            await saveToken(token);
            setUserToken(token);

            const profile = await api.get('/utilisateurs/me');
            const userData = profile.data;
            setUser(userData);
            await saveUser(userData);
        } catch (error: any) {
            const msg = error?.response?.data?.message || error?.message || 'Erreur login';
            Alert.alert('Échec de connexion', msg);
            throw error;
        }
    };

    const register = async (payload: { nom_utilisateur: string; email: string; mot_de_passe: string; prenom?: string; nom?: string }) => {
        try {
            const response = await api.post('/utilisateurs/register', payload);
            if (response.status === 201) {
                Alert.alert('Inscription réussie', 'Vous pouvez maintenant vous connecter');
            } else {
                throw new Error('Erreur inscription');
            }
        } catch (error: any) {
            const msg = error?.response?.data?.message || error?.message || 'Erreur inscription';
            Alert.alert('Échec de l’inscription', msg);
            throw error;
        }
    };

    const updateProfile = async (payload: { nom_utilisateur?: string; email?: string; prenom?: string; nom?: string }) => {
        try {
            const response = await api.put('/utilisateurs/me', payload);
            const updated = response.data;
            setUser(updated);
            await saveUser(updated);
            Alert.alert('Profil mis à jour', 'Vos informations ont bien été enregistrées.');
        } catch (error: any) {
            const msg = error?.response?.data?.message || error?.message || 'Erreur mise à jour du profil';
            Alert.alert('Erreur', msg);
            throw error;
        }
    };

    const logout = async () => {
        await clearStorage();
        setUserToken(null);
        setUser(null);
    };

    const value = useMemo(
        () => ({ userToken, user, isLoading, login, register, updateProfile, logout }),
        [userToken, user, isLoading]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

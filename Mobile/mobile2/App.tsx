import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, ActivityIndicator, ImageBackground } from 'react-native';
import { AuthProvider, AuthContext } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import EventsScreen from './src/screens/EventsScreen';
import EventDetailScreen from './src/screens/EventDetailScreen';
import MyInscriptionsScreen from './src/screens/MyInscriptionsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import { StatusBar } from 'expo-status-bar';

function HomeScreen() {
    const backgroundImage = { uri: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80' };

    return (
        <ImageBackground source={backgroundImage} style={styles.background} resizeMode="cover">
            <View style={styles.overlay}>
                <Text style={styles.title}>Bienvenue sur Events Mobile 2</Text>
                <Text style={styles.subtitle}>Accédez aux événements et gérez vos inscriptions</Text>
            </View>
        </ImageBackground>
    );
}

function LoadingScreen() {
    return (
        <View style={styles.center}>
            <ActivityIndicator size="large" color="#000" />
            <Text>Chargement...</Text>
        </View>
    );
}

const Tab = createBottomTabNavigator<any>();
const Stack = createNativeStackNavigator<any>();

function AppStack() {
    return (
        <Tab.Navigator id="tab-navigator">
            <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            <Tab.Screen name="Events" component={EventsScreen} options={{ headerShown: false }} />
            <Tab.Screen name="Mes Inscriptions" component={MyInscriptionsScreen} options={{ headerShown: false }} />
            <Tab.Screen name="Profil" component={ProfileScreen} options={{ headerShown: false }} />
        </Tab.Navigator>
    );
}

function RootNavigator() {
    const { userToken, isLoading } = useContext(AuthContext);

    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <Stack.Navigator id="root-stack" screenOptions={{ headerShown: false }}>
            {userToken ? (
                <>
                    <Stack.Screen name="App" component={AppStack} />
                    <Stack.Screen name="Detail" component={EventDetailScreen} options={{ headerShown: true, title: 'Détail Événement' }} />
                </>
            ) : (
                <>
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Register" component={RegisterScreen} />
                </>
            )}
        </Stack.Navigator>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <NavigationContainer>
                <RootNavigator />
            </NavigationContainer>
            <StatusBar style="auto" />
        </AuthProvider>
    );
}

const styles = StyleSheet.create({
    background: { flex: 1 },
    overlay: { flex: 1, backgroundColor: 'rgba(18, 18, 38, 0.45)', justifyContent: 'center', alignItems: 'center', padding: 26 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 22 },
    title: { fontSize: 30, fontWeight: '800', marginBottom: 14, color: '#fff', textAlign: 'center', fontFamily: 'Georgia' },
    subtitle: { fontSize: 18, color: '#f1f5f9', textAlign: 'center', maxWidth: 300, lineHeight: 26, fontFamily: 'Avenir Next' },
    loadingText: { marginTop: 10, color: '#fff', fontSize: 16 },
});

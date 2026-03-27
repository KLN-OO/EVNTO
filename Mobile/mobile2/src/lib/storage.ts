import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@events_mobile_token';
const USER_KEY = '@events_mobile_user';

export async function saveToken(token: string) {
    await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
    return AsyncStorage.getItem(TOKEN_KEY);
}

export async function removeToken() {
    await AsyncStorage.removeItem(TOKEN_KEY);
}

export async function saveUser(user: any) {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function getUser(): Promise<any> {
    const value = await AsyncStorage.getItem(USER_KEY);
    return value ? JSON.parse(value) : null;
}

export async function clearStorage() {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
}

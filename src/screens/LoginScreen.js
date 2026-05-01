import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '../contexts/AuthContext';

const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';
const BIOMETRIC_EMAIL_KEY = 'biometric_email';
const BIOMETRIC_PASSWORD_KEY = 'biometric_password';

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { ensureEmailVerified } = useAuth();

    const handleLogin = async () => {
        if (isLoading) return;

        setIsLoading(true);
        try {
            const cred = await signInWithEmailAndPassword(auth, email, password);
            const isVerified = await ensureEmailVerified(cred.user);
            if (!isVerified) {
                return;
            }

            await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'true');
            await SecureStore.setItemAsync(BIOMETRIC_EMAIL_KEY, email);
            await SecureStore.setItemAsync(BIOMETRIC_PASSWORD_KEY, password);
        } catch (e) {
            Alert.alert('Login gagal', e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBiometric = async () => {
        if (isLoading) return;

        const biometricEnabled = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
        if (!biometricEnabled) {
            Alert.alert('Biometric belum aktif', 'Login sekali dengan email/password untuk mengaktifkan.');
            return;
        }

        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        if (!hasHardware || !isEnrolled) {
            Alert.alert('Biometric tidak tersedia', 'Perangkat belum mendukung atau belum ada data biometric.');
            return;
        }

        const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Login dengan biometric',
            fallbackLabel: 'Gunakan password',
        });

        if (result.success) {
            const savedEmail = await SecureStore.getItemAsync(BIOMETRIC_EMAIL_KEY);
            const savedPassword = await SecureStore.getItemAsync(BIOMETRIC_PASSWORD_KEY);

            if (!savedEmail || !savedPassword) {
                Alert.alert(
                    'Data login tidak ditemukan',
                    'Login ulang dengan email/password untuk menyimpan data biometric login.'
                );
                return;
            }

            setIsLoading(true);
            try {
                const cred = await signInWithEmailAndPassword(auth, savedEmail, savedPassword);
                const isVerified = await ensureEmailVerified(cred.user);
                if (!isVerified) {
                    return;
                }
            } catch (e) {
                Alert.alert('Biometric login gagal', e?.message || 'Terjadi kesalahan saat login.');
            } finally {
                setIsLoading(false);
            }
        } else {
            Alert.alert('Gagal', 'Biometric tidak cocok.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>
            <Text style={styles.subtitle}>Masuk untuk melanjutkan</Text>

            <TextInput
                placeholder="Email"
                placeholderTextColor="#94a3b8"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.input}
            />
            <TextInput
                placeholder="Password"
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
            />

            <TouchableOpacity
                style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.85}
            >
                <Text style={styles.primaryButtonText}>{isLoading ? 'Processing...' : 'Login'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.secondaryButton, isLoading && styles.secondaryButtonDisabled]}
                onPress={handleBiometric}
                activeOpacity={0.85}
                disabled={isLoading}
            >
                <Text style={styles.secondaryButtonText}>Login dengan Biometric</Text>
            </TouchableOpacity>

            <Text style={styles.link} onPress={() => navigation.navigate('Register')}>
                Belum punya akun? Daftar
            </Text>
            <Text style={styles.link} onPress={() => navigation.navigate('Forgot Password')}>
                Lupa password?
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
        paddingHorizontal: 20,
        justifyContent: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#0f172a',
    },
    subtitle: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 6,
        marginBottom: 20,
    },
    input: {
        backgroundColor: '#ffffff',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        color: '#0f172a',
        marginBottom: 12,
    },
    primaryButton: {
        backgroundColor: '#0f172a',
        borderRadius: 10,
        alignItems: 'center',
        paddingVertical: 13,
        marginTop: 4,
    },
    primaryButtonText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '600',
    },
    secondaryButton: {
        backgroundColor: '#e2e8f0',
        borderRadius: 10,
        alignItems: 'center',
        paddingVertical: 13,
        marginTop: 10,
    },
    secondaryButtonDisabled: {
        opacity: 0.6,
    },
    secondaryButtonText: {
        color: '#0f172a',
        fontSize: 14,
        fontWeight: '600',
    },
    buttonDisabled: {
        backgroundColor: '#94a3b8',
    },
    link: {
        color: '#334155',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 14,
    },
});
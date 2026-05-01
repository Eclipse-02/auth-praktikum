import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function HomeScreen() {
    const { user, logout, idleRemainingMs, idleTimeoutMs } = useAuth();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const remainingSeconds = Math.ceil((idleRemainingMs ?? 0) / 1000);
    const timeoutSeconds = Math.ceil(idleTimeoutMs / 1000);

    const handleLogout = async () => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);

        try {
            await logout();
        } catch (error) {
            Alert.alert('Logout gagal', error?.message || 'Terjadi kesalahan.');
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Selamat datang</Text>

            <View style={styles.infoCard}>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.value}>{user?.email || '-'}</Text>

                <Text style={styles.label}>UID</Text>
                <Text style={styles.value}>{user?.uid || '-'}</Text>

                <Text style={styles.label}>Status verifikasi</Text>
                <Text style={styles.value}>
                    {user?.emailVerified ? 'Sudah verifikasi' : 'Belum verifikasi'}
                </Text>

                <Text style={styles.label}>Logout timer</Text>
                <Text style={styles.value}>
                    {idleRemainingMs == null ? '-' : `${remainingSeconds}s / ${timeoutSeconds}s`}
                </Text>
            </View>

            <TouchableOpacity
                style={[styles.logoutButton, isLoggingOut && styles.logoutButtonDisabled]}
                onPress={handleLogout}
                disabled={isLoggingOut}
                activeOpacity={0.8}
            >
                <Text style={styles.logoutButtonText}>
                    {isLoggingOut ? 'Processing...' : 'Logout'}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 16,
        color: '#0f172a',
    },
    infoCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    label: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 10,
    },
    value: {
        fontSize: 15,
        color: '#0f172a',
        marginTop: 2,
    },
    logoutButton: {
        backgroundColor: '#0f172a',
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 10,
    },
    logoutButtonDisabled: {
        backgroundColor: '#94a3b8',
    },
    logoutButtonText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '600',
    },
});
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Alert, AppState } from 'react-native';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import * as SecureStore from 'expo-secure-store';
import { auth } from '../config/firebase';

const AuthContext = createContext();
const IDLE_TIMEOUT_MS = 5 * 60 * 1000;

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [idleRemainingMs, setIdleRemainingMs] = useState(null);
    const idleTimerRef = useRef(null);
    const idleDeadlineRef = useRef(null);
    const countdownIntervalRef = useRef(null);
    const appStateRef = useRef(AppState.currentState);
    const suppressNextUnverifiedAlertRef = useRef(false);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (u) => {
            if (u) {
                const isVerified = await ensureEmailVerified(u, {
                    showAlert: !suppressNextUnverifiedAlertRef.current,
                });
                suppressNextUnverifiedAlertRef.current = false;

                if (!isVerified) {
                    setUser(null);
                    setLoading(false);
                    return;
                }

                setUser(u);
                const token = await u.getIdToken();
                await SecureStore.setItemAsync('auth_token', token);
                resetIdleTimer(u);
            } else {
                clearIdleTimer();
                clearCountdownInterval();
                suppressNextUnverifiedAlertRef.current = false;
                setUser(null);
                await SecureStore.deleteItemAsync('auth_token');
            }
            setLoading(false);
        });

        return unsub;
    }, []);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextState) => {
            const wasInBackground = /inactive|background/.test(appStateRef.current);
            appStateRef.current = nextState;

            if (nextState === 'active') {
                if (wasInBackground && user) {
                    resetIdleTimer();
                }
            } else if (user) {
                clearIdleTimer();
                clearCountdownInterval();
            }
        });

        return () => subscription.remove();
    }, [user]);

    const clearIdleTimer = () => {
        if (idleTimerRef.current) {
            clearTimeout(idleTimerRef.current);
            idleTimerRef.current = null;
        }
        idleDeadlineRef.current = null;
        setIdleRemainingMs(null);
    };

    const clearCountdownInterval = () => {
        if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
        }
    };

    const startCountdownInterval = () => {
        clearCountdownInterval();
        countdownIntervalRef.current = setInterval(() => {
            if (!idleDeadlineRef.current) {
                setIdleRemainingMs(null);
                return;
            }

            const remaining = Math.max(0, idleDeadlineRef.current - Date.now());
            setIdleRemainingMs(remaining);
        }, 250);
    };

    const resetIdleTimer = (activeUser = user) => {
        if (!activeUser) return;
        clearIdleTimer();
        idleDeadlineRef.current = Date.now() + IDLE_TIMEOUT_MS;
        setIdleRemainingMs(IDLE_TIMEOUT_MS);
        startCountdownInterval();
        idleTimerRef.current = setTimeout(async () => {
            await logout(true);
        }, IDLE_TIMEOUT_MS);
    };

    const reportActivity = () => {
        if (user && appStateRef.current === 'active') {
            resetIdleTimer();
        }
    };

    const ensureEmailVerified = async (firebaseUser, options = {}) => {
        const { showAlert = true } = options;
        if (!firebaseUser) return false;

        await firebaseUser.reload();
        if (firebaseUser.emailVerified) return true;

        clearIdleTimer();
        clearCountdownInterval();
        await SecureStore.deleteItemAsync('auth_token');
        suppressNextUnverifiedAlertRef.current = true;
        await signOut(auth);

        if (showAlert) {
            Alert.alert('Akun belum terverifikasi', 'Silakan verifikasi email Anda terlebih dahulu.');
        }
        return false;
    };

    const logout = async (isIdle = false) => {
        clearIdleTimer();
        clearCountdownInterval();
        await signOut(auth);
        await SecureStore.deleteItemAsync('auth_token');
        if (isIdle) {
            Alert.alert(
                'Sesi berakhir',
                'Anda telah keluar karena tidak ada aktivitas untuk sementara waktu.',
                [{ text: 'OK' }]
            );
        }
    };

    useEffect(() => {
        return () => {
            clearIdleTimer();
            clearCountdownInterval();
        };
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                logout,
                reportActivity,
                ensureEmailVerified,
                idleRemainingMs,
                idleTimeoutMs: IDLE_TIMEOUT_MS,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
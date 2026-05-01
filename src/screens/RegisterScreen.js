import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { ensureEmailVerified } = useAuth();

  const handleRegister = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      if (!email.trim() || !password) {
        Alert.alert('Data belum lengkap', 'Masukkan email dan password.');
        return;
      }

      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(cred.user);
      await ensureEmailVerified(cred.user, { showAlert: false });
      Alert.alert('Sukses', 'Cek email Anda untuk verifikasi.');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Register gagal', e?.message || 'Terjadi kesalahan.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daftar</Text>
      <Text style={styles.subtitle}>Buat akun baru</Text>

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
        onPress={handleRegister}
        disabled={isLoading}
        activeOpacity={0.85}
      >
        <Text style={styles.primaryButtonText}>{isLoading ? 'Processing...' : 'Daftar'}</Text>
      </TouchableOpacity>

      <Text
        style={styles.link}
        onPress={() => (navigation.goBack())}
      >
        Sudah punya akun? Login
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
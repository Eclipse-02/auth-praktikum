import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../config/firebase';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      if (!email.trim()) {
        Alert.alert('Data belum lengkap', 'Masukkan email Anda.');
        return;
      }
      await sendPasswordResetEmail(auth, email);
      Alert.alert('Sukses', 'Email reset password telah dikirim.');
      navigation.navigate('Login');
    } catch (e) {
      Alert.alert('Gagal', e?.message || 'Terjadi kesalahan.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.subtitle}>Masukkan email untuk reset password</Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor="#94a3b8"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />

      <TouchableOpacity
        style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
        onPress={handleReset}
        disabled={isLoading}
        activeOpacity={0.85}
      >
        <Text style={styles.primaryButtonText}>
          {isLoading ? 'Processing...' : 'Reset Password'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.link} onPress={() => navigation.goBack()}>
        Kembali ke Login
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
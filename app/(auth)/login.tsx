import {
  View, Text, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, TextInput,
  TouchableOpacity, Alert, Image,
} from 'react-native';
import { Link } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { Colors, Radius } from '@/constants/Colors';

export default function LoginScreen() {
  const { login, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    clearError();
    await login({ email, password });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoSection}>
            <Image
              source={require('@/assets/candy.png')}
              style={{ width: 80, height: 80 }}
              resizeMode="contain"
            />
            <Text style={styles.appName}>Zahra D2</Text>
            <Text style={styles.tagline}>BONBONS & BISCUITS</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Content de vous revoir !</Text>
            <Text style={styles.subtitle}>Connectez-vous à votre compte</Text>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </View>
            ) : null}

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="votre@email.com"
              placeholderTextColor={Colors.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>Mot de passe</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={Colors.muted}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              style={[styles.btn, isLoading && { opacity: 0.6 }]}
              onPress={onSubmit}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.btnText}>
                {isLoading ? 'Connexion...' : 'Se connecter'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Pas encore de compte ? </Text>
            <Link href="/(auth)/register" style={styles.footerLink}>
              Créer un compte
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
    justifyContent: 'center',
    gap: 24,
  },
  logoSection: { alignItems: 'center', gap: 6, paddingVertical: 20 },
  appName: { fontSize: 40, fontWeight: '900', color: Colors.candy, letterSpacing: -1 },
  tagline: { fontSize: 12, color: Colors.muted, letterSpacing: 2 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: 24,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  title: { fontSize: 22, fontWeight: '900', color: Colors.ink },
  subtitle: { fontSize: 14, color: Colors.muted, marginBottom: 4 },
  errorBox: {
    backgroundColor: 'rgba(230,57,70,0.08)',
    borderRadius: Radius.sm,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.error,
  },
  errorText: { fontSize: 13, color: Colors.error },
  label: { fontSize: 13, fontWeight: '700', color: Colors.ink },
  input: {
    backgroundColor: Colors.surface2,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.ink,
  },
  btn: {
    backgroundColor: Colors.candy,
    borderRadius: Radius.md,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 6,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { fontSize: 14, color: Colors.muted },
  footerLink: { fontSize: 14, fontWeight: '700', color: Colors.candy },
});
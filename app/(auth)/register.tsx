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

export default function RegisterScreen() {
  const { register: registerUser, isLoading, error, clearError } = useAuthStore();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const onSubmit = async () => {
    if (!firstName || !lastName || !phone || !email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }
    clearError();
    await registerUser({ firstName, lastName, phoneNumber: phone, email, password });
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
          <View style={styles.header}>
            <Image 
              source={require('@/assets/candy.png')} 
              style={{ width: 80, height: 80 }} 
              resizeMode="contain"
            />
            <Text style={styles.title}>Créer un compte</Text>
            <Text style={styles.subtitle}>Rejoignez Zahra D2 !</Text>
          </View>

          <View style={styles.card}>
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </View>
            ) : null}

            <View style={styles.row}>
              <View style={styles.half}>
                <Text style={styles.label}>Prénom</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Koffi"
                  placeholderTextColor={Colors.muted}
                  autoCapitalize="words"
                  value={firstName}
                  onChangeText={setFirstName}
                />
              </View>
              <View style={styles.half}>
                <Text style={styles.label}>Nom</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Amegan"
                  placeholderTextColor={Colors.muted}
                  autoCapitalize="words"
                  value={lastName}
                  onChangeText={setLastName}
                />
              </View>
            </View>

            <Text style={styles.label}>Téléphone</Text>
            <TextInput
              style={styles.input}
              placeholder="+225 07 00 00 00"
              placeholderTextColor={Colors.muted}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
            <Text style={styles.hint}>
              📌 Ce numéro sera visible par le propriétaire lors de vos commandes
            </Text>

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

            <Text style={styles.label}>Confirmer le mot de passe</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={Colors.muted}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <TouchableOpacity
              style={[styles.btn, isLoading && { opacity: 0.6 }]}
              onPress={onSubmit}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.btnText}>
                {isLoading ? 'Création...' : 'Créer mon compte'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Déjà un compte ? </Text>
            <Link href="/(auth)/login" style={styles.footerLink}>
              Se connecter
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40, gap: 16 },
  header: { alignItems: 'center', paddingTop: 32, gap: 4 },
  emoji: { fontSize: 52 },
  title: { fontSize: 26, fontWeight: '900', color: Colors.ink },
  subtitle: { fontSize: 14, color: Colors.muted },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: 24,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  errorBox: {
    backgroundColor: 'rgba(230,57,70,0.08)',
    borderRadius: Radius.sm,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.error,
  },
  errorText: { fontSize: 13, color: Colors.error },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  label: { fontSize: 13, fontWeight: '700', color: Colors.ink },
  hint: { fontSize: 11, color: Colors.muted, marginTop: -4 },
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
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingBottom: 8 },
  footerText: { fontSize: 14, color: Colors.muted },
  footerLink: { fontSize: 14, fontWeight: '700', color: Colors.candy },
});
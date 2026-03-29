import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { Colors, Radius } from '@/constants/Colors';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Déconnecter', style: 'destructive', onPress: () => logout() },
      ]
    );
  };

  if (!user) return null;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.firstName[0]}{user.lastName[0]}
            </Text>
          </View>
          <Text style={styles.name}>{user.firstName} {user.lastName}</Text>
          <Text style={styles.phone}>📱 {user.phoneNumber}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>MES INFORMATIONS</Text>
          {[
            { label: 'Prénom', value: user.firstName },
            { label: 'Nom', value: user.lastName },
            { label: 'Email', value: user.email },
            { label: 'Téléphone', value: user.phoneNumber },
          ].map((row, i) => (
            <View key={i} style={styles.row}>
              <Text style={styles.rowLabel}>{row.label}</Text>
              <Text style={styles.rowValue}>{row.value}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={styles.logoutText}>🚪 Se déconnecter</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: 24, gap: 20, paddingBottom: 40 },
  avatarSection: { alignItems: 'center', gap: 8, paddingVertical: 16 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.candy,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 28, fontWeight: '900', color: '#fff' },
  name: { fontSize: 22, fontWeight: '900', color: Colors.ink },
  phone: { fontSize: 13, color: Colors.caramel },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  cardTitle: { fontSize: 11, color: Colors.muted, letterSpacing: 1, marginBottom: 12 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rowLabel: { fontSize: 14, color: Colors.muted },
  rowValue: { fontSize: 14, fontWeight: '700', color: Colors.ink },
  logoutBtn: {
    paddingVertical: 14,
    backgroundColor: 'rgba(230,57,70,0.07)',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(230,57,70,0.2)',
    alignItems: 'center',
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: Colors.error },
});
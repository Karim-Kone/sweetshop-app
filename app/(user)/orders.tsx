import {
  View, Text, StyleSheet, FlatList,
  ActivityIndicator, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { useOrderStore } from '@/store/orderStore';
import { Colors, Radius } from '@/constants/Colors';
import type { Order } from '@/types';
import { useAuthStore } from '@/store/authStore';

function statusLabel(status: Order['status']) {
  switch (status) {
    case 'NEW': return { label: '🆕 Nouvelle', color: '#E07B30' };
    case 'CONFIRMED': return { label: '✅ Confirmée', color: '#2EC4B6' };
    case 'READY': return { label: '📦 Prête', color: '#0077B6' };
    case 'DONE': return { label: '🎉 Livrée', color: '#2EC4B6' };
    case 'CANCELLED': return { label: '❌ Annulée', color: Colors.error };
    default: return { label: status, color: Colors.muted };
  }
}

function OrderCard({ order }: { order: Order }) {
  const { label, color } = statusLabel(order.status);
  const date = new Date(order.createdAt).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.orderId}>Commande #{order.id.slice(-6)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: color + '22' }]}>
          <Text style={[styles.statusText, { color }]}>{label}</Text>
        </View>
      </View>

      <Text style={styles.date}>📅 {date}</Text>

      <View style={styles.divider} />

      {order.items.map((item, i) => (
        <View key={i} style={styles.itemRow}>
          <Image 
            source={require('@/assets/candy.png')} 
            style={{ width: 48, height: 48 }} 
            resizeMode="contain"
          />
          <Text style={styles.itemName}>🍬 {item.quantity}x Produit</Text>
          <Text style={styles.itemPrice}>
            {(item.unitPrice * item.quantity).toLocaleString()} FCFA
          </Text>
        </View>
      ))}

      <View style={styles.divider} />

      <View style={styles.cardFooter}>
        <Text style={styles.deliveryType}>
          {order.deliveryType === 'DELIVERY' ? '🚚 Livraison' : '🏪 Retrait boutique'}
        </Text>
        <Text style={styles.total}>{order.totalAmount.toLocaleString()} FCFA</Text>
      </View>
    </View>
  );
}

export default function OrdersScreen() {
  const { orders, isLoading, fetchOrders } = useOrderStore();

  const { user } = useAuthStore();

useEffect(() => {
  fetchOrders(user?.id, false);
}, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📦 Mes Commandes</Text>
        <Text style={styles.headerCount}>{orders.length} commande(s)</Text>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.candy} />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <OrderCard order={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyEmoji}>📦</Text>
              <Text style={styles.emptyTitle}>Aucune commande</Text>
              <Text style={styles.emptyText}>Vos commandes apparaîtront ici</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: 20, fontWeight: '900', color: Colors.ink },
  headerCount: { fontSize: 13, color: Colors.muted },

  list: { padding: 16, gap: 14 },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: 16,
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: { fontSize: 15, fontWeight: '900', color: Colors.ink },
  statusBadge: {
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: { fontSize: 12, fontWeight: '700' },
  date: { fontSize: 12, color: Colors.muted },
  divider: { height: 1, backgroundColor: Colors.border },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: { fontSize: 14, color: Colors.ink },
  itemPrice: { fontSize: 14, fontWeight: '700', color: Colors.candy },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deliveryType: { fontSize: 13, color: Colors.muted },
  total: { fontSize: 16, fontWeight: '900', color: Colors.candy },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40 },
  emptyEmoji: { fontSize: 64 },
  emptyTitle: { fontSize: 20, fontWeight: '900', color: Colors.ink },
  emptyText: { fontSize: 14, color: Colors.muted, textAlign: 'center' },
});
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Alert, RefreshControl,
  ActivityIndicator, ScrollView, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useProductStore } from '@/store/productStore';
import { useOrderStore } from '@/store/orderStore';
import { Colors, Radius } from '@/constants/Colors';
import type { Order, Product } from '@/types';

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

function OrderCard({ order, onUpdateStatus }: {
  order: Order;
  onUpdateStatus: (id: string, status: Order['status']) => void;
}) {
  const { label, color } = statusLabel(order.status);

  const nextStatus = (): Order['status'] | null => {
    switch (order.status) {
      case 'NEW': return 'CONFIRMED';
      case 'CONFIRMED': return 'READY';
      case 'READY': return 'DONE';
      default: return null;
    }
  };

  const next = nextStatus();

  return (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderId}>Commande #{order.id.slice(-6)}</Text>
          <Text style={styles.orderDate}>
            {new Date(order.createdAt).toLocaleDateString('fr-FR', {
              day: '2-digit', month: 'short',
              hour: '2-digit', minute: '2-digit',
            })}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: color + '22' }]}>
          <Text style={[styles.statusText, { color }]}>{label}</Text>
        </View>
      </View>

      {/* Infos client */}
      <View style={styles.clientInfo}>
        <Text style={styles.clientName}>👤 {order.customerName}</Text>
        <Text style={styles.clientPhone}>📱 {order.customerPhone}</Text>
      </View>

      <View style={styles.divider} />

      {/* Articles */}
      {order.items.map((item, i) => (
        <View key={i} style={styles.itemRow}>
          <Image 
            source={require('@/assets/candy.png')} 
            style={{ width: 40, height: 40 }} 
            resizeMode="contain"
          />
          <Text style={styles.itemPrice}>
            {(item.unitPrice * item.quantity).toLocaleString()} FCFA
          </Text>
        </View>
      ))}

      <View style={styles.divider} />

      <View style={styles.orderFooter}>
        <View>
          <Text style={styles.deliveryType}>
            {order.deliveryType === 'DELIVERY' ? '🚚 Livraison' : '🏪 Retrait'}
          </Text>
          {order.deliveryAddress && (
            <Text style={styles.address}>📍 {order.deliveryAddress}</Text>
          )}
        </View>
        <Text style={styles.total}>{order.totalAmount.toLocaleString()} FCFA</Text>
      </View>

      {/* Boutons actions */}
      <View style={styles.actionRow}>
        {next && (
          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={() => onUpdateStatus(order.id, next)}
            activeOpacity={0.8}
          >
            <Text style={styles.confirmBtnText}>
              {next === 'CONFIRMED' ? '✅ Confirmer' :
               next === 'READY' ? '📦 Marquer prête' :
               '🎉 Marquer livrée'}
            </Text>
          </TouchableOpacity>
        )}
        {order.status !== 'CANCELLED' && order.status !== 'DONE' && (
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => onUpdateStatus(order.id, 'CANCELLED')}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelBtnText}>❌ Annuler</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function ProductRow({ product, onDelete, onToggle }: {
  product: Product;
  onDelete: (id: string) => void;
  onToggle: (id: string, available: boolean) => void;
}) {
  return (
    <View style={styles.productRow}>
      <View style={styles.rowLeft}>
        <Image 
          source={require('@/assets/candy.png')} 
          style={{ width: 48, height: 48 }} 
          resizeMode="contain"
        />
        <View style={styles.rowInfo}>
          <Text style={styles.rowName}>{product.name}</Text>
          <Text style={styles.rowPrice}>{product.price.toLocaleString()} FCFA</Text>
          <Text style={styles.rowStock}>Stock : {product.stockQuantity}</Text>
        </View>
      </View>
      <View style={styles.rowActions}>
        <TouchableOpacity
          style={[styles.toggleBtn, product.isAvailable ? styles.toggleOn : styles.toggleOff]}
          onPress={() => onToggle(product.id, !product.isAvailable)}
        >
          <Text>{product.isAvailable ? '✅' : '❌'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => onDelete(product.id)}
        >
          <Text>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function OwnerDashboard() {
  const { logout } = useAuthStore();
  const { products, isLoading: loadingProducts, fetchProducts, deleteProduct, updateProduct } = useProductStore();
  const { orders, isLoading: loadingOrders, fetchOrders, updateOrderStatus } = useOrderStore();
  const router = useRouter();
  const [tab, setTab] = useState<'orders' | 'products'>('orders');

  useEffect(() => {
    fetchProducts();
    fetchOrders(undefined, true);
  }, []);

  const handleDelete = (id: string) => {
    Alert.alert('Supprimer', 'Voulez-vous vraiment supprimer ce produit ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => deleteProduct(id) },
    ]);
  };

  const newOrdersCount = orders.filter(o => o.status === 'NEW').length;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>🏪 Zahra D2</Text>
          <Text style={styles.subtitle}>Tableau de bord</Text>
        </View>
        <TouchableOpacity onPress={() => Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Déconnecter', style: 'destructive', onPress: logout },
        ])}>
          <Text style={styles.logoutIcon}>🚪</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{products.length}</Text>
          <Text style={styles.statLabel}>Produits</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{orders.length}</Text>
          <Text style={styles.statLabel}>Commandes</Text>
        </View>
        <View style={[styles.statCard, newOrdersCount > 0 && styles.statCardAlert]}>
          <Text style={[styles.statNumber, newOrdersCount > 0 && { color: Colors.error }]}>
            {newOrdersCount}
          </Text>
          <Text style={styles.statLabel}>Nouvelles</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'orders' && styles.tabActive]}
          onPress={() => setTab('orders')}
        >
          <Text style={[styles.tabText, tab === 'orders' && styles.tabTextActive]}>
            {`📦 Commandes ${newOrdersCount > 0 ? `(${newOrdersCount})` : ''}`}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'products' && styles.tabActive]}
          onPress={() => setTab('products')}
        >
          <Image 
            source={require('@/assets/candy.png')} 
            style={{ width: 48, height: 48 }} 
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      {/* Contenu */}
      {tab === 'orders' ? (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <OrderCard order={item} onUpdateStatus={updateOrderStatus} />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={loadingOrders} onRefresh={fetchOrders} tintColor={Colors.candy} />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyEmoji}>📭</Text>
              <Text style={styles.emptyText}>Aucune commande pour le moment</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProductRow
              product={item}
              onDelete={handleDelete}
              onToggle={(id, available) => updateProduct(id, { isAvailable: available })}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => router.push('/(owner)/add-product')}
              activeOpacity={0.8}
            >
              <Text style={styles.addBtnText}>+ Ajouter un produit</Text>
            </TouchableOpacity>
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyEmoji}>📦</Text>
              <Text style={styles.emptyText}>Aucun produit. Ajoutez-en un !</Text>
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
  greeting: { fontSize: 20, fontWeight: '900', color: Colors.ink },
  subtitle: { fontSize: 13, color: Colors.muted },
  logoutIcon: { fontSize: 24 },

  statsRow: { flexDirection: 'row', padding: 16, gap: 12 },
  statCard: {
    flex: 1, backgroundColor: Colors.surface,
    borderRadius: Radius.lg, padding: 14,
    alignItems: 'center', elevation: 2,
  },
  statCardAlert: { borderWidth: 1.5, borderColor: Colors.error },
  statNumber: { fontSize: 24, fontWeight: '900', color: Colors.candy },
  statLabel: { fontSize: 11, color: Colors.muted, marginTop: 2 },

  tabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: Colors.surface2,
    borderRadius: Radius.lg,
    padding: 4,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: Radius.md },
  tabActive: { backgroundColor: Colors.surface, elevation: 2 },
  tabText: { fontSize: 13, fontWeight: '700', color: Colors.muted },
  tabTextActive: { color: Colors.candy },

  list: { padding: 16, gap: 14 },

  orderCard: {
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
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderId: { fontSize: 15, fontWeight: '900', color: Colors.ink },
  orderDate: { fontSize: 11, color: Colors.muted, marginTop: 2 },
  statusBadge: { borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 12, fontWeight: '700' },

  clientInfo: { gap: 2 },
  clientName: { fontSize: 14, fontWeight: '700', color: Colors.ink },
 clientPhone: { fontSize: 13, color: '#E07B30', fontWeight: '700' },

  divider: { height: 1, backgroundColor: Colors.border },

  itemRow: { flexDirection: 'row', justifyContent: 'space-between' },
  itemText: { fontSize: 14, color: Colors.ink },
  itemPrice: { fontSize: 14, fontWeight: '700', color: Colors.candy },

  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  deliveryType: { fontSize: 13, color: Colors.muted },
  address: { fontSize: 12, color: Colors.muted, marginTop: 2 },
  total: { fontSize: 16, fontWeight: '900', color: Colors.candy },

  actionRow: { flexDirection: 'row', gap: 8 },
  confirmBtn: {
    flex: 1, backgroundColor: Colors.candy,
    borderRadius: Radius.md, paddingVertical: 10,
    alignItems: 'center',
  },
  confirmBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  cancelBtn: {
    borderRadius: Radius.md, paddingVertical: 10,
    paddingHorizontal: 14, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.error,
  },
  cancelBtnText: { color: Colors.error, fontSize: 13, fontWeight: '700' },

  productRow: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg, padding: 14,
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', elevation: 2,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  rowEmoji: { fontSize: 32 },
  rowInfo: { flex: 1 },
  rowName: { fontSize: 15, fontWeight: '700', color: Colors.ink },
  rowPrice: { fontSize: 13, color: Colors.candy, fontWeight: '700' },
  rowStock: { fontSize: 12, color: Colors.muted },
  rowActions: { flexDirection: 'row', gap: 8 },
  toggleBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  toggleOn: { backgroundColor: 'rgba(46,196,182,0.15)' },
  toggleOff: { backgroundColor: 'rgba(230,57,70,0.15)' },
  deleteBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(230,57,70,0.15)',
  },

  addBtn: {
    backgroundColor: Colors.candy,
    borderRadius: Radius.md, paddingVertical: 14,
    alignItems: 'center', marginBottom: 8,
  },
  addBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: 16, color: Colors.muted, textAlign: 'center' },
});
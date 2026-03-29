import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Alert, TextInput, Image,
} from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useOrderStore } from '@/store/orderStore'; 
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCartStore } from '@/store/cartStore';
import { Colors, Radius } from '@/constants/Colors';
import type { CartItem } from '@/types';

function CartRow({ item }: { item: CartItem }) {
  const { increaseQty, decreaseQty, removeItem } = useCartStore();

  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Image 
          source={require('@/assets/candy.png')} 
          style={{ width: 80, height: 80 }} 
          resizeMode="contain"
        />
        <View style={styles.rowInfo}>
          <Text style={styles.rowName}>{item.product.name}</Text>
          <Text style={styles.rowPrice}>
            {(item.product.price * item.quantity).toLocaleString()} FCFA
          </Text>
          <Text style={styles.rowUnitPrice}>
            {item.product.price.toLocaleString()} FCFA / unité
          </Text>
        </View>
      </View>

      <View style={styles.qtyContainer}>
        <TouchableOpacity
          style={styles.qtyBtn}
          onPress={() => decreaseQty(item.product.id)}
        >
          <Text style={styles.qtyBtnText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.qtyText}>{item.quantity}</Text>
        <TouchableOpacity
          style={styles.qtyBtn}
          onPress={() => increaseQty(item.product.id)}
        >
          <Text style={styles.qtyBtnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function CartScreen() {
  const {
    items, deliveryType, deliveryAddress,
    setDeliveryType, setDeliveryAddress,
    clearCart, getTotalPrice, getTotalItems,
  } = useCartStore();

  const { user } = useAuthStore();
  const { placeOrder } = useOrderStore();

const handleOrder = async () => {
    if (deliveryType === 'DELIVERY' && !deliveryAddress.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre adresse de livraison');
      return;
    }
    await placeOrder(
      items,
      deliveryType,
      deliveryAddress,
      `${user?.firstName} ${user?.lastName}`,
      user?.phoneNumber || '',
      user?.id || '',
    );
    clearCart();
    Alert.alert(
      '✅ Commande passée !',
      'Votre commande a été envoyée. Le propriétaire va la confirmer.',
      [{ text: 'OK' }]
    );
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🛒 Mon Panier</Text>
        </View>
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>🛒</Text>
          <Text style={styles.emptyTitle}>Panier vide</Text>
          <Text style={styles.emptyText}>Ajoutez des produits depuis l'accueil</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🛒 Mon Panier</Text>
        <Text style={styles.headerCount}>{getTotalItems()} article(s)</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.product.id}
        renderItem={({ item }) => <CartRow item={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <View style={styles.footer}>

            {/* Choix livraison */}
            <Text style={styles.sectionTitle}>Mode de réception</Text>
            <View style={styles.deliveryRow}>
              <TouchableOpacity
                style={[styles.deliveryBtn, deliveryType === 'PICKUP' && styles.deliveryBtnActive]}
                onPress={() => setDeliveryType('PICKUP')}
                activeOpacity={0.8}
              >
                <Text style={styles.deliveryEmoji}>🏪</Text>
                <Text style={[styles.deliveryText, deliveryType === 'PICKUP' && styles.deliveryTextActive]}>
                  Retrait boutique
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.deliveryBtn, deliveryType === 'DELIVERY' && styles.deliveryBtnActive]}
                onPress={() => setDeliveryType('DELIVERY')}
                activeOpacity={0.8}
              >
                <Text style={styles.deliveryEmoji}>🚚</Text>
                <Text style={[styles.deliveryText, deliveryType === 'DELIVERY' && styles.deliveryTextActive]}>
                  Livraison
                </Text>
              </TouchableOpacity>
            </View>

            {/* Adresse livraison */}
            {deliveryType === 'DELIVERY' && (
              <View style={styles.addressContainer}>
                <Text style={styles.sectionTitle}>Adresse de livraison</Text>
                <TextInput
                  style={styles.addressInput}
                  placeholder="Ex: Cocody, Rue des Jardins..."
                  placeholderTextColor={Colors.muted}
                  value={deliveryAddress}
                  onChangeText={setDeliveryAddress}
                  multiline
                />
              </View>
            )}

            {/* Total */}
            <View style={styles.totalContainer}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Sous-total</Text>
                <Text style={styles.totalValue}>{getTotalPrice().toLocaleString()} FCFA</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Livraison</Text>
                <Text style={styles.totalValue}>
                  {deliveryType === 'DELIVERY' ? '1 000 FCFA' : 'Gratuit'}
                </Text>
              </View>
              <View style={[styles.totalRow, styles.totalFinalRow]}>
                <Text style={styles.totalFinalLabel}>Total</Text>
                <Text style={styles.totalFinalValue}>
                  {(getTotalPrice() + (deliveryType === 'DELIVERY' ? 1000 : 0)).toLocaleString()} FCFA
                </Text>
              </View>
            </View>

            {/* Bouton commander */}
            <TouchableOpacity
              style={styles.orderBtn}
              onPress={handleOrder}
              activeOpacity={0.8}
            >
              <Text style={styles.orderBtnText}>✅ Passer la commande</Text>
            </TouchableOpacity>

            {/* Vider le panier */}
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={() => Alert.alert('Vider le panier', 'Voulez-vous vider votre panier ?', [
                { text: 'Annuler', style: 'cancel' },
                { text: 'Vider', style: 'destructive', onPress: clearCart },
              ])}
            >
              <Text style={styles.clearBtnText}>🗑️ Vider le panier</Text>
            </TouchableOpacity>

          </View>
        }
      />
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

  list: { padding: 16, gap: 10 },

  row: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  rowEmoji: { fontSize: 32 },
  rowInfo: { flex: 1 },
  rowName: { fontSize: 15, fontWeight: '700', color: Colors.ink },
  rowPrice: { fontSize: 14, color: Colors.candy, fontWeight: '700' },
  rowUnitPrice: { fontSize: 11, color: Colors.muted },

  qtyContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qtyBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.candy,
    alignItems: 'center', justifyContent: 'center',
  },
  qtyBtnText: { color: Colors.bg, fontSize: 18, fontWeight: '900' },
  qtyText: { fontSize: 16, fontWeight: '900', color: Colors.ink, minWidth: 20, textAlign: 'center' },

  footer: { gap: 16, paddingBottom: 32 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: Colors.muted },

  deliveryRow: { flexDirection: 'row', gap: 12 },
  deliveryBtn: {
    flex: 1, padding: 14,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    alignItems: 'center', gap: 6,
    borderWidth: 2, borderColor: Colors.border,
    elevation: 2,
  },
  deliveryBtnActive: { borderColor: Colors.candy, backgroundColor: 'rgba(0,180,216,0.1)' },
  deliveryEmoji: { fontSize: 24 },
  deliveryText: { fontSize: 13, fontWeight: '700', color: Colors.muted },
  deliveryTextActive: { color: Colors.candy },

  addressContainer: { gap: 8 },
  addressInput: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.ink,
    minHeight: 80,
    textAlignVertical: 'top',
  },

  totalContainer: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: 16,
    gap: 10,
    elevation: 2,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalLabel: { fontSize: 14, color: Colors.muted },
  totalValue: { fontSize: 14, fontWeight: '700', color: Colors.ink },
  totalFinalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 10,
    marginTop: 4,
  },
  totalFinalLabel: { fontSize: 16, fontWeight: '900', color: Colors.ink },
  totalFinalValue: { fontSize: 16, fontWeight: '900', color: Colors.candy },

  orderBtn: {
    backgroundColor: Colors.candy,
    borderRadius: Radius.md,
    paddingVertical: 15,
    alignItems: 'center',
  },
  orderBtnText: { color: Colors.bg, fontSize: 16, fontWeight: '700' },

  clearBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.3)',
  },
  clearBtnText: { fontSize: 14, color: Colors.error, fontWeight: '700' },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyEmoji: { fontSize: 64 },
  emptyTitle: { fontSize: 20, fontWeight: '900', color: Colors.ink },
  emptyText: { fontSize: 14, color: Colors.muted, textAlign: 'center' },
});
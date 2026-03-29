import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, RefreshControl, ActivityIndicator,
  Image, TextInput, Modal, Dimensions, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useProductStore } from '@/store/productStore';
import { useCartStore } from '@/store/cartStore';
import { Colors, Radius } from '@/constants/Colors';
import type { Product } from '@/types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 3;

function ProductCard({ product, onPress }: { product: Product; onPress: () => void }) {
  const { addItem, items } = useCartStore();
  const outOfStock = product.stockQuantity === 0;
  const cartItem = items.find((i) => i.product.id === product.id);

  return (
    <View style={[styles.card, outOfStock && styles.cardDisabled]}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        {product.imageUrl ? (
          <Image source={{ uri: product.imageUrl }} style={styles.productImage} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Image 
              source={require('@/assets/candy.png')} 
              style={{ width: 64, height: 64 }} 
              resizeMode="contain"
            />
          </View>
        )}
        {cartItem && (
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{cartItem.quantity}</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.cardBody}>
        <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
        <Text style={styles.price}>{product.price.toLocaleString()} F</Text>

        {outOfStock ? (
          <View style={styles.badgeOut}>
            <Text style={styles.badgeOutText}>Rupture</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => addItem(product)}
            activeOpacity={0.8}
          >
            <Text style={styles.addBtnText}>
              {cartItem ? `✅ (${cartItem.quantity})` : '+ Panier'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function ImageModal({ product, onClose }: { product: Product | null; onClose: () => void }) {
  if (!product) return null;
  return (
    <Modal visible={!!product} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} onPress={onClose} activeOpacity={1}>
        <View style={styles.modalContent}>
          {product.imageUrl ? (
            <Image source={{ uri: product.imageUrl }} style={styles.modalImage} resizeMode="contain" />
          ) : (
            <Image 
              source={require('@/assets/candy.png')} 
              style={{ width: 64, height: 64 }} 
              resizeMode="contain"
            />
          )}
          <Text style={styles.modalName}>{product.name}</Text>
          <Text style={styles.modalPrice}>{product.price.toLocaleString()} FCFA</Text>
          <Text style={styles.modalDesc}>{product.description}</Text>
          <TouchableOpacity style={styles.modalClose} onPress={onClose}>
            <Text style={styles.modalCloseText}>✕ Fermer</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

export default function HomeScreen() {
  const { user } = useAuthStore();
  const { products, isLoading, fetchProducts } = useProductStore();
  const { getTotalItems } = useCartStore();
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }: { item: Product }) => (
    <ProductCard product={item} onPress={() => setSelectedProduct(item)} />
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bonjour {user?.firstName} 👋</Text>
          <Text style={styles.subtitle}>Que souhaitez-vous aujourd'hui ?</Text>
        </View>
        <View style={styles.cartIconContainer}>
          <Text style={styles.cartIcon}>🛒</Text>
          {getTotalItems() > 0 && (
            <View style={styles.cartCount}>
              <Text style={styles.cartCountText}>{getTotalItems()}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un produit..."
          placeholderTextColor={Colors.muted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={styles.searchClear}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Catalogue */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.candy} />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={3}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={fetchProducts} tintColor={Colors.candy} />
          }
          ListHeaderComponent={
            <Text style={styles.sectionTitle}>
              🛍️ {filtered.length} produit(s)
            </Text>
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyText}>Aucun produit trouvé</Text>
            </View>
          }
        />
      )}

      {/* Modal image */}
      <ImageModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  greeting: { fontSize: 16, fontWeight: '900', color: Colors.ink },
  subtitle: { fontSize: 12, color: Colors.muted },
  cartIconContainer: { position: 'relative' },
  cartIcon: { fontSize: 28 },
  cartCount: {
    position: 'absolute', top: -4, right: -4,
    backgroundColor: Colors.error,
    borderRadius: 10, width: 18, height: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  cartCountText: { color: '#fff', fontSize: 10, fontWeight: '900' },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 12,
    paddingHorizontal: 12,
    backgroundColor: Colors.surface,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    height: 42,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: Colors.ink },
  searchClear: { fontSize: 14, color: Colors.muted, paddingLeft: 8 },

  sectionTitle: { fontSize: 13, fontWeight: '700', color: Colors.muted, marginBottom: 8 },

  list: { paddingHorizontal: 12, paddingBottom: 16 },
  row: { gap: 8, marginBottom: 8 },

  card: {
    width: CARD_WIDTH,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardDisabled: { opacity: 0.6 },

  productImage: { width: '100%', height: CARD_WIDTH * 0.9 },
  imagePlaceholder: {
    width: '100%', height: CARD_WIDTH * 0.9,
    backgroundColor: Colors.surface2,
    alignItems: 'center', justifyContent: 'center',
  },
  imageEmoji: { fontSize: 28 },

  cartBadge: {
    position: 'absolute', top: 4, right: 4,
    backgroundColor: Colors.candy,
    borderRadius: 10, width: 18, height: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  cartBadgeText: { color: '#fff', fontSize: 10, fontWeight: '900' },

  cardBody: { padding: 6, gap: 4 },
  productName: { fontSize: 11, fontWeight: '700', color: Colors.ink },
  price: { fontSize: 11, fontWeight: '900', color: Colors.candy },

  badgeOut: {
    backgroundColor: 'rgba(230,57,70,0.1)',
    borderRadius: Radius.sm,
    paddingVertical: 3,
    alignItems: 'center',
  },
  badgeOutText: { fontSize: 9, fontWeight: '700', color: Colors.error },

  addBtn: {
    backgroundColor: Colors.candy,
    borderRadius: Radius.sm,
    paddingVertical: 5,
    alignItems: 'center',
  },
  addBtnText: { color: '#fff', fontSize: 10, fontWeight: '700' },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40 },
  loadingText: { fontSize: 14, color: Colors.muted },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: 16, color: Colors.muted, textAlign: 'center' },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.8)',
    alignItems: 'center', justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    gap: 10,
  },
  modalImage: { width: '100%', height: 280, borderRadius: Radius.lg },
  modalName: { fontSize: 20, fontWeight: '900', color: Colors.ink, textAlign: 'center' },
  modalPrice: { fontSize: 18, fontWeight: '900', color: Colors.candy },
  modalDesc: { fontSize: 14, color: Colors.muted, textAlign: 'center' },
  modalClose: {
    backgroundColor: Colors.surface2,
    borderRadius: Radius.md,
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginTop: 4,
  },
  modalCloseText: { fontSize: 14, fontWeight: '700', color: Colors.ink },
});
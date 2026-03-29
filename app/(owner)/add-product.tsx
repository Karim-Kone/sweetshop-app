import {
  View, Text, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, TextInput,
  TouchableOpacity, Alert, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useProductStore } from '@/store/productStore';
import { Colors, Radius } from '@/constants/Colors';

export default function AddProductScreen() {
  const { addProduct } = useProductStore();
  const router = useRouter();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission refusée', 'Autorisez l\'accès à la caméra');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const onSubmit = async () => {
    if (!name || !price || !stock) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }
    if (isNaN(Number(price)) || Number(price) <= 0) {
      Alert.alert('Erreur', 'Le prix doit être un nombre positif');
      return;
    }
    if (isNaN(Number(stock)) || Number(stock) < 0) {
      Alert.alert('Erreur', 'Le stock doit être un nombre positif');
      return;
    }

    setIsLoading(true);
    try {
      await addProduct({
        name,
        description,
        price: Number(price),
        stockQuantity: Number(stock),
        imageUrl: '',
        isAvailable: Number(stock) > 0,
      }, imageUri || undefined);

      Alert.alert('Succès', 'Produit ajouté avec succès !', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert('Erreur', 'Impossible d\'ajouter le produit');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Retour</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ajouter un produit</Text>
          <View style={{ width: 80 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>

            {/* Photo */}
            <Text style={styles.label}>Photo du produit</Text>
            {imageUri ? (
              <TouchableOpacity onPress={pickImage}>
                <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                <Text style={styles.changePhoto}>Changer la photo</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.photoButtons}>
                <TouchableOpacity style={styles.photoBtn} onPress={pickImage} activeOpacity={0.8}>
                  <Text style={styles.photoBtnEmoji}>🖼️</Text>
                  <Text style={styles.photoBtnText}>Galerie</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.photoBtn} onPress={takePhoto} activeOpacity={0.8}>
                  <Text style={styles.photoBtnEmoji}>📷</Text>
                  <Text style={styles.photoBtnText}>Caméra</Text>
                </TouchableOpacity>
              </View>
            )}

            <Text style={styles.label}>Nom du produit *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Caramels au beurre salé"
              placeholderTextColor={Colors.muted}
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Décrivez votre produit..."
              placeholderTextColor={Colors.muted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />

            <Text style={styles.label}>Prix (FCFA) *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 2500"
              placeholderTextColor={Colors.muted}
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />

            <Text style={styles.label}>Quantité en stock *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 50"
              placeholderTextColor={Colors.muted}
              keyboardType="numeric"
              value={stock}
              onChangeText={setStock}
            />

            <TouchableOpacity
              style={[styles.submitBtn, isLoading && { opacity: 0.6 }]}
              onPress={onSubmit}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.submitText}>
                {isLoading ? 'Ajout en cours...' : '✅ Ajouter le produit'}
              </Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { width: 80 },
  backText: { fontSize: 14, color: Colors.candy, fontWeight: '700' },
  headerTitle: { fontSize: 16, fontWeight: '900', color: Colors.ink },

  scroll: { padding: 20 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: 24,
    gap: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
  },

  label: { fontSize: 13, fontWeight: '700', color: Colors.ink },

  imagePreview: {
    width: '100%',
    height: 180,
    borderRadius: Radius.lg,
    marginBottom: 4,
  },
  changePhoto: {
    fontSize: 13,
    color: Colors.candy,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  photoButtons: { flexDirection: 'row', gap: 12 },
  photoBtn: {
    flex: 1,
    backgroundColor: Colors.surface2,
    borderRadius: Radius.lg,
    padding: 16,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  photoBtnEmoji: { fontSize: 28 },
  photoBtnText: { fontSize: 13, fontWeight: '700', color: Colors.muted },

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
  textarea: { height: 90, textAlignVertical: 'top' },

  submitBtn: {
    backgroundColor: Colors.candy,
    borderRadius: Radius.md,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
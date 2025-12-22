import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { PRODUCTS } from "@/constants/products";
import { useCart } from "@/context/CartContext";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const product = PRODUCTS.find((p) => p.id === id);

  const [selectedSize, setSelectedSize] = useState(product?.sizes[0] || "");
  const [addedToCart, setAddedToCart] = useState(false);

  if (!product) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Product not found</ThemedText>
      </ThemedView>
    );
  }

  const handleAddToCart = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addToCart(product, selectedSize);
    setAddedToCart(true);
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: product.name }} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image
            source={product.image}
            style={styles.image}
            contentFit="cover"
          />
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.headerRow}>
            <View>
              <ThemedText style={styles.category}>
                {product.category}
              </ThemedText>
              <ThemedText type="title" style={styles.name}>
                {product.name}
              </ThemedText>
            </View>
            <View style={styles.priceBadge}>
              <ThemedText style={styles.priceText}>
                ₹
                {(
                  product.sizePrices?.[selectedSize] ?? product.price
                ).toLocaleString("en-IN")}
              </ThemedText>
            </View>
          </View>

          <View style={styles.ratingRow}>
            <IconSymbol name="star.fill" size={16} color="#FFD700" />
            <ThemedText style={styles.ratingText}>{product.rating}</ThemedText>
            <ThemedText style={styles.reviewsText}>
              ({product.reviews} reviews)
            </ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Description
            </ThemedText>
            <ThemedText style={styles.description}>
              {product.description}
            </ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Select Size
            </ThemedText>
            <View style={styles.sizesGrid}>
              {product.sizes.map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.sizeOption,
                    selectedSize === size && styles.selectedSizeOption,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedSize(size);
                  }}
                >
                  <ThemedText
                    style={[
                      styles.sizeOptionText,
                      selectedSize === size && styles.selectedSizeOptionText,
                    ]}
                  >
                    {size}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {addedToCart ? (
          <TouchableOpacity
            style={[styles.cartButton, styles.addedButton]}
            onPress={() => router.push("/cart")}
          >
            <IconSymbol name="cart.fill" size={20} color="#FFF" />
            <ThemedText style={styles.cartButtonText}>Go to Cart</ThemedText>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.cartButton} onPress={handleAddToCart}>
            <IconSymbol name="cart.fill" size={20} color="#FFF" />
            <ThemedText style={styles.cartButtonText}>Add to Cart</ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageContainer: {
    width: width,
    height: width,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  detailsContainer: {
    padding: 24,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32,
    backgroundColor: "#000", // Assuming dark theme for premium feel
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  category: {
    fontSize: 14,
    opacity: 0.6,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
  },
  priceBadge: {
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  priceText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#007AFF",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 6,
  },
  reviewsText: {
    fontSize: 14,
    opacity: 0.5,
    marginLeft: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.7,
  },
  sizesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  sizeOption: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  selectedSizeOption: {
    borderColor: "#007AFF",
    backgroundColor: "rgba(0, 122, 255, 0.1)",
  },
  sizeOptionText: {
    fontSize: 16,
    fontWeight: "500",
    opacity: 0.8,
  },
  selectedSizeOptionText: {
    color: "#007AFF",
    opacity: 1,
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  cartButton: {
    backgroundColor: "#007AFF",
    height: 56,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  addedButton: {
    backgroundColor: "#34C759",
  },
  cartButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});

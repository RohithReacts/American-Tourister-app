import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { PRODUCTS } from "@/constants/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
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
  const { toggleWishlist, isInWishlist } = useWishlist();
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

  const isWishlisted = isInWishlist(product.id);

  const handleToggleWishlist = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleWishlist(product);
  };

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
          <TouchableOpacity
            style={styles.wishlistButton}
            onPress={handleToggleWishlist}
          >
            <IconSymbol
              name={isWishlisted ? "heart.fill" : "heart"}
              size={28}
              color={isWishlisted ? "#FF3B30" : "#FFF"}
              style={styles.wishlistIcon}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.headerSection}>
            <ThemedText style={styles.category}>{product.category}</ThemedText>
            <View style={styles.titleRow}>
              <ThemedText type="title" style={styles.name}>
                {product.name}
              </ThemedText>
            </View>
            <View style={styles.priceSection}>
              <View style={styles.priceRow}>
                <ThemedText style={styles.priceText}>
                  ₹
                  {(
                    product.sizePrices?.[selectedSize] ?? product.price
                  ).toLocaleString("en-IN")}
                </ThemedText>
                <ThemedText style={styles.mrpText}>
                  ₹
                  {(
                    product.sizeMrps?.[selectedSize] ?? product.mrp
                  ).toLocaleString("en-IN")}
                </ThemedText>
                <View style={styles.saveBadge}>
                  <ThemedText style={styles.saveBadgeText}>
                    SAVE ₹
                    {(
                      (product.sizeMrps?.[selectedSize] ?? product.mrp) -
                      (product.sizePrices?.[selectedSize] ?? product.price)
                    ).toLocaleString("en-IN")}
                  </ThemedText>
                </View>
              </View>
              <ThemedText style={styles.discountLabel}>
                {Math.round(
                  (((product.sizeMrps?.[selectedSize] ?? product.mrp) -
                    (product.sizePrices?.[selectedSize] ?? product.price)) /
                    (product.sizeMrps?.[selectedSize] ?? product.mrp)) *
                    100
                )}
                % OFF
              </ThemedText>
            </View>
          </View>

          <View style={styles.ratingRow}>
            <View style={styles.ratingBadge}>
              <IconSymbol name="star.fill" size={14} color="#FFD700" />
              <ThemedText style={styles.ratingText}>
                {product.rating}
              </ThemedText>
            </View>
            <ThemedText style={styles.reviewsText}>
              {product.reviews} Verified Reviews
            </ThemedText>
          </View>

          <View style={styles.trustBadges}>
            <View style={styles.badgeItem}>
              <IconSymbol name="globe" size={18} color="#34C759" />
              <ThemedText style={styles.badgeLabel}>
                3 Years Global Warranty
              </ThemedText>
            </View>
            <View style={styles.badgeDivider} />
            <View style={styles.badgeItem}>
              <IconSymbol name="seal.fill" size={18} color="#34C759" />
              <ThemedText style={styles.badgeLabel}>Genuine Product</ThemedText>
            </View>
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
        <View style={styles.footerPriceContainer}>
          <ThemedText style={styles.footerPriceLabel}>Total Price</ThemedText>
          <ThemedText style={styles.footerPriceValue}>
            ₹
            {(
              product.sizePrices?.[selectedSize] ?? product.price
            ).toLocaleString("en-IN")}
          </ThemedText>
        </View>
        {addedToCart ? (
          <TouchableOpacity
            style={styles.cartButtonContainer}
            onPress={() => router.push("/cart")}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={["#34C759", "#30D158", "#32D74B"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cartButton}
            >
              <View style={styles.buttonContent}>
                <IconSymbol name="cart.fill" size={22} color="#FFF" />
                <ThemedText style={styles.cartButtonText}>
                  Go to Cart
                </ThemedText>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.cartButtonContainer}
            onPress={handleAddToCart}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={["#007AFF", "#5856D6", "#0A84FF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cartButton}
            >
              <View style={styles.buttonContent}>
                <IconSymbol name="cart.fill" size={22} color="#FFF" />
                <ThemedText style={styles.cartButtonText}>
                  Add to Cart
                </ThemedText>
              </View>
            </LinearGradient>
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
    padding: 20,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32,
    backgroundColor: "#000",
  },
  wishlistButton: {
    position: "absolute",
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  wishlistIcon: {
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  headerSection: {
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
  },
  category: {
    fontSize: 12,
    opacity: 0.5,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 6,
    fontWeight: "600",
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    flex: 1,
    lineHeight: 28,
  },
  priceSection: {
    marginTop: 12,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  priceText: {
    fontSize: 32,
    fontWeight: "900",
    color: "#007AFF",
  },
  mrpText: {
    fontSize: 16,
    opacity: 0.4,
    textDecorationLine: "line-through",
    marginTop: 4,
  },
  saveBadge: {
    backgroundColor: "rgba(52, 199, 89, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(52, 199, 89, 0.2)",
  },
  saveBadgeText: {
    color: "#34C759",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  discountLabel: {
    color: "#34C759",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 4,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 12,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFD700",
  },
  reviewsText: {
    fontSize: 14,
    opacity: 0.5,
  },
  trustBadges: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 32,
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  badgeItem: {
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  badgeLabel: {
    fontSize: 10,
    fontWeight: "600",
    opacity: 0.8,
    textAlign: "center",
  },
  badgeDivider: {
    width: 1,
    height: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
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
    padding: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    backgroundColor: "#000",
  },
  footerPriceContainer: {
    flex: 1,
  },
  footerPriceLabel: {
    fontSize: 12,
    opacity: 0.5,
    marginBottom: 2,
  },
  footerPriceValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFF",
  },
  cartButtonContainer: {
    flex: 1.5,
    borderRadius: 18,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  cartButton: {
    height: 58,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  cartButtonText: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
});

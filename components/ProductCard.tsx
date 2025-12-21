import { Product } from "@/constants/products";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import { Dimensions, StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";
import { IconSymbol } from "./ui/icon-symbol";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() =>
        router.push({
          pathname: "/product/[id]",
          params: { id: product.id },
        } as any)
      }
      activeOpacity={0.8}
    >
      <ThemedView style={styles.card}>
        <View style={styles.imageContainer}>
          <Image
            source={product.image}
            style={styles.image}
            contentFit="cover"
            transition={1000}
          />
          {product.isNew && (
            <View style={styles.badge}>
              <ThemedText style={styles.badgeText}>NEW</ThemedText>
            </View>
          )}
        </View>
        <View style={styles.info}>
          <ThemedText
            type="defaultSemiBold"
            numberOfLines={1}
            style={styles.name}
          >
            {product.name}
          </ThemedText>
          <ThemedText style={styles.category}>{product.category}</ThemedText>

          <View style={styles.sizesContainer}>
            {product.sizes.map((size, index) => (
              <View key={index} style={styles.sizeBadge}>
                <ThemedText style={styles.sizeText}>{size}</ThemedText>
              </View>
            ))}
          </View>

          <View style={styles.ratingContainer}>
            <IconSymbol name="star.fill" size={12} color="#FFD700" />
            <ThemedText style={styles.ratingText}>{product.rating}</ThemedText>
            <ThemedText style={styles.reviewsText}>
              ({product.reviews})
            </ThemedText>
          </View>
          <View style={styles.footer}>
            <ThemedText type="subtitle" style={styles.price}>
              ₹{product.price.toLocaleString("en-IN")}
            </ThemedText>
          </View>
        </View>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    marginBottom: 16,
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  imageContainer: {
    height: 150,
    width: "100%",
    position: "relative",
  },
  image: {
    height: "100%",
    width: "100%",
  },
  badge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#007AFF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  info: {
    padding: 12,
  },
  name: {
    fontSize: 14,
    marginBottom: 2,
  },
  category: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 8,
  },
  sizesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginBottom: 10,
  },
  sizeBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sizeText: {
    fontSize: 10,
    opacity: 0.8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  reviewsText: {
    fontSize: 12,
    opacity: 0.5,
    marginLeft: 2,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

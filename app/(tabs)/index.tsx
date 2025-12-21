import { CategoryTab } from "@/components/CategoryTab";
import { ProductCard } from "@/components/ProductCard";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { PRODUCTS } from "@/constants/products";
import { Image } from "expo-image";
import React, { useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const featuredProducts = PRODUCTS.filter(
    (p) =>
      p.isFeatured &&
      (selectedCategory === "All" || p.category === selectedCategory)
  );
  const filteredProducts =
    selectedCategory === "All"
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.category === selectedCategory);

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header / Hero */}
        <View style={styles.heroContainer}>
          <Image
            source={require("@/assets/images/segno4.0.png")}
            style={styles.heroImage}
            contentFit="cover"
          />
          <View style={styles.logoContainer}>
            <Image
              source={require("@/assets/American_Tourister_logo.svg")}
              style={styles.logo}
              contentFit="contain"
            />
          </View>
          <View style={styles.heroOverlay}>
            <ThemedText type="title" style={styles.heroTitle}>
              American Tourister
            </ThemedText>
            <ThemedText style={styles.heroSubtitle}>
              Ready for your next adventure?
            </ThemedText>
          </View>
        </View>

        {/* Categories */}
        <CategoryTab
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Featured Section */}
        {featuredProducts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText type="subtitle">Featured</ThemedText>
              <TouchableOpacity>
                <ThemedText style={styles.seeAll}>See All</ThemedText>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredScroll}
            >
              {featuredProducts.map((product) => (
                <View key={product.id} style={styles.featuredItem}>
                  <ProductCard product={product} />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Product Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle">{selectedCategory} Products</ThemedText>
          </View>
          <View style={styles.grid}>
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroContainer: {
    height: 300,
    width: "100%",
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  logoContainer: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
  },
  heroTitle: {
    color: "#FFF",
    fontSize: 32,
    fontWeight: "bold",
  },
  logo: {
    width: 120,
    height: 40,
    marginBottom: 12,
  },
  heroSubtitle: {
    color: "#FFF",
    fontSize: 16,
    opacity: 0.9,
    marginTop: 4,
    marginBottom: 16,
  },
  heroButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  heroButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  seeAll: {
    color: "#007AFF",
    fontSize: 14,
  },
  featuredScroll: {
    gap: 16,
  },
  featuredItem: {
    width: width * 0.45,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});

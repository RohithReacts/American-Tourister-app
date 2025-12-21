import { CATEGORIES } from "@/constants/products";
import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

interface CategoryTabProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export function CategoryTab({
  selectedCategory,
  onSelectCategory,
}: CategoryTabProps) {
  return (
    <ThemedView style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.tab,
              selectedCategory === category && styles.selectedTab,
            ]}
            onPress={() => onSelectCategory(category)}
          >
            <ThemedText
              style={[
                styles.tabText,
                selectedCategory === category && styles.selectedTabText,
              ]}
            >
              {category}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  selectedTab: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    opacity: 0.7,
  },
  selectedTabText: {
    color: "#FFF",
    opacity: 1,
  },
});

import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import React from "react";
import { StyleSheet, View } from "react-native";

type OrderStatus =
  | "pending"
  | "preparing"
  | "ready"
  | "picked_up"
  | "confirmed"
  | "no_stock";

interface OrderStatusBadgeProps {
  status?: OrderStatus;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  if (!status || status === "pending") {
    return (
      <View style={styles.pendingBadge}>
        <IconSymbol
          name="clock.badge.exclamationmark"
          size={16}
          color="#007AFF"
        />
        <ThemedText style={styles.pendingText}>Pending</ThemedText>
      </View>
    );
  }

  if (status === "preparing") {
    return (
      <View style={styles.preparingBadge}>
        <IconSymbol name="clock.fill" size={16} color="#FF9F0A" />
        <ThemedText style={styles.preparingText}>Preparing</ThemedText>
      </View>
    );
  }

  if (status === "ready") {
    return (
      <View style={styles.readyBadge}>
        <IconSymbol name="checkmark.circle.fill" size={16} color="#34C759" />
        <ThemedText style={styles.readyText}>Ready for Pickup</ThemedText>
      </View>
    );
  }

  if (status === "picked_up") {
    return (
      <View style={styles.pickedUpBadge}>
        <IconSymbol name="bag.fill" size={18} color="#FFF" />
        <ThemedText style={styles.pickedUpText}>Picked Up</ThemedText>
      </View>
    );
  }

  if (status === "confirmed") {
    return (
      <View style={styles.confirmedBadge}>
        <IconSymbol name="checkmark.circle.fill" size={16} color="#34C759" />
        <ThemedText style={styles.confirmedText}>Confirmed</ThemedText>
      </View>
    );
  }

  if (status === "no_stock") {
    return (
      <View style={styles.noStockBadge}>
        <IconSymbol
          name="exclamationmark.triangle.fill"
          size={16}
          color="#FF9500"
        />
        <ThemedText style={styles.noStockText}>No Stock</ThemedText>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  pendingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 122, 255, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "rgba(0, 122, 255, 0.3)",
    gap: 6,
  },
  pendingText: {
    color: "#007AFF",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  preparingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 159, 10, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "rgba(255, 159, 10, 0.3)",
    gap: 6,
  },
  preparingText: {
    color: "#FF9F0A",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  readyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: "rgba(52, 199, 89, 0.15)",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "rgba(52, 199, 89, 0.3)",
  },
  readyText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#34C759",
    letterSpacing: 0.3,
  },
  pickedUpBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#34C759",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  pickedUpText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFF",
    letterSpacing: 0.5,
  },
  confirmedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(52, 199, 89, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "rgba(52, 199, 89, 0.3)",
    gap: 6,
  },
  confirmedText: {
    color: "#34C759",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  noStockBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 149, 0, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "rgba(255, 149, 0, 0.3)",
    gap: 6,
  },
  noStockText: {
    color: "#FF9500",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});

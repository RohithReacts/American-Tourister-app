import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useCart } from "@/context/CartContext";
import { generateInvoice } from "@/utils/invoiceGenerator";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

const STORE_INFO = {
  name: "Vaishnavi Sales",
  address: "6-7-66, Raganna Darwaza, Main Road, Hanamkonda, Telangana 506011",
  phone: "8374200125",
};

export default function CartScreen() {
  const { cartItems, removeFromCart, totalAmount, clearCart } = useCart();
  const router = useRouter();
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [lastOrderId, setLastOrderId] = useState("");

  const handleCheckout = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const orderId = Math.random().toString(36).substring(7).toUpperCase();
    setLastOrderId(orderId);
    setIsSuccessModalVisible(true);
  };

  const handleDownloadInvoice = async () => {
    try {
      await generateInvoice({
        orderId: lastOrderId,
        date: new Date().toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        items: cartItems.map((item) => ({
          name: item.name,
          size: item.selectedSize,
          price: item.price,
          quantity: item.quantity,
        })),
        totalAmount: totalAmount,
        storeInfo: STORE_INFO,
      });
    } catch (error) {
      Alert.alert("Error", "Failed to generate invoice");
    }
  };

  const handleCloseSuccess = () => {
    setIsSuccessModalVisible(false);
    clearCart();
    router.push("/");
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.cartItem}>
      <Image source={item.image} style={styles.itemImage} contentFit="cover" />
      <View style={styles.itemInfo}>
        <ThemedText type="defaultSemiBold" style={styles.itemName}>
          {item.name}
        </ThemedText>
        <ThemedText style={styles.itemSize}>
          Size: {item.selectedSize}
        </ThemedText>
        <View style={styles.itemFooter}>
          <ThemedText type="subtitle" style={styles.itemPrice}>
            ₹{item.price.toLocaleString("en-IN")}
          </ThemedText>
          <ThemedText style={styles.itemQuantity}>x{item.quantity}</ThemedText>
        </View>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          removeFromCart(item.id, item.selectedSize);
        }}
      >
        <IconSymbol name="trash" size={20} color="#FF3B30" />
      </TouchableOpacity>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">My Cart</ThemedText>
      </ThemedView>

      {cartItems.length > 0 ? (
        <FlatList
          data={cartItems}
          renderItem={renderItem}
          keyExtractor={(item) => `${item.id}-${item.selectedSize}`}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.emptyContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.emptyContainer}>
            <View style={styles.iconCircle}>
              <IconSymbol name="cart" size={64} color="rgba(255,255,255,0.2)" />
            </View>
            <ThemedText type="subtitle" style={styles.emptyTitle}>
              Your cart is empty
            </ThemedText>
            <ThemedText style={styles.emptySubtitle}>
              Looks like you haven't added any luggage to your cart yet.
            </ThemedText>

            <TouchableOpacity
              style={styles.shopButton}
              onPress={() => router.push("/")}
            >
              <ThemedText style={styles.shopButtonText}>
                Start Shopping
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <ThemedText style={styles.totalLabel}>Total</ThemedText>
          <ThemedText type="subtitle" style={styles.totalAmount}>
            ₹{totalAmount.toLocaleString("en-IN")}
          </ThemedText>
        </View>
        <TouchableOpacity
          style={[
            styles.checkoutButton,
            cartItems.length === 0 && { opacity: 0.5 },
          ]}
          disabled={cartItems.length === 0}
          onPress={handleCheckout}
        >
          <ThemedText style={styles.checkoutText}>Checkout</ThemedText>
        </TouchableOpacity>
      </View>

      <Modal
        visible={isSuccessModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCloseSuccess}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.successIconContainer}>
              <IconSymbol
                name="checkmark.circle.fill"
                size={80}
                color="#34C759"
              />
            </View>

            <ThemedText type="title" style={styles.successTitle}>
              Order Success!
            </ThemedText>
            <ThemedText style={styles.successSubtitle}>
              Your order #${lastOrderId} has been placed successfully.
            </ThemedText>

            <View style={styles.pickupCard}>
              <View style={styles.pickupHeader}>
                <IconSymbol name="suitcase.fill" size={20} color="#34C759" />
                <ThemedText style={styles.pickupLabel}>STORE PICKUP</ThemedText>
              </View>
              <ThemedText style={styles.storeName}>
                {STORE_INFO.name}
              </ThemedText>
              <ThemedText style={styles.storeAddress}>
                {STORE_INFO.address}
              </ThemedText>
              <ThemedText style={styles.storePhone}>
                📞 {STORE_INFO.phone}
              </ThemedText>
            </View>

            <TouchableOpacity
              style={styles.downloadButton}
              onPress={handleDownloadInvoice}
            >
              <IconSymbol name="paperplane.fill" size={20} color="#007AFF" />
              <ThemedText style={styles.downloadText}>
                Download Invoice
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleCloseSuccess}
            >
              <ThemedText style={styles.continueText}>
                Continue Shopping
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  listContent: {
    padding: 16,
  },
  cartItem: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    alignItems: "center",
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 16,
  },
  itemName: {
    fontSize: 16,
    marginBottom: 4,
  },
  itemSize: {
    fontSize: 14,
    opacity: 0.5,
    marginBottom: 8,
  },
  itemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007AFF",
  },
  itemQuantity: {
    fontSize: 14,
    opacity: 0.7,
  },
  removeButton: {
    padding: 8,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  emptyContainer: {
    alignItems: "center",
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.03)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    textAlign: "center",
    opacity: 0.5,
    marginBottom: 32,
    lineHeight: 22,
  },
  shopButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  shopButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
    backgroundColor: "rgba(255,255,255,0.02)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    opacity: 0.6,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: "bold",
  },
  checkoutButton: {
    backgroundColor: "#007AFF",
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  checkoutText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "#1A1A1A",
    borderRadius: 32,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  successIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(52, 199, 89, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  successSubtitle: {
    fontSize: 16,
    opacity: 0.6,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  pickupCard: {
    width: "100%",
    backgroundColor: "rgba(52, 199, 89, 0.05)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "rgba(52, 199, 89, 0.2)",
  },
  pickupHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  pickupLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#34C759",
    letterSpacing: 1,
  },
  storeName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  storeAddress: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
    marginBottom: 8,
  },
  storePhone: {
    fontSize: 14,
    fontWeight: "600",
    color: "#34C759",
  },
  downloadButton: {
    width: "100%",
    height: 56,
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(0, 122, 255, 0.2)",
  },
  downloadText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  continueButton: {
    width: "100%",
    height: 56,
    backgroundColor: "#007AFF",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  continueText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

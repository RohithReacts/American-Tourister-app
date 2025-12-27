import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
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
  const { user } = useAuth();
  const router = useRouter();
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [lastOrderId, setLastOrderId] = useState("");
  const [scheduledDate, setScheduledDate] = useState(new Date());
  const [scheduledTime, setScheduledTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setScheduledDate(selectedDate);
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setScheduledTime(selectedTime);
    }
  };

  const handleCheckout = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const orderId = Math.random().toString(36).substring(7).toUpperCase();
    setLastOrderId(orderId);

    // Save order to AsyncStorage for "My Orders"
    try {
      const dateStr = scheduledDate.toISOString().split("T")[0]; // YYYY-MM-DD
      const timeStr = scheduledTime.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      // Calculate total quantity
      const totalQuantity = cartItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      // Get first product for representative data (or could combine all products)
      const firstItem = cartItems[0];

      const totalMrp = cartItems.reduce(
        (sum, item) => sum + item.mrp * item.quantity,
        0
      );

      const newOrder = {
        id: orderId,
        userId: user?.id || "guest",
        productId: firstItem.id,
        productName:
          cartItems.length > 1 ? `${cartItems.length} items` : firstItem.name,
        productImage: firstItem.image,
        category: firstItem.category || "Luggage",
        count: totalQuantity,
        amount: totalAmount,
        mrp: totalMrp,
        size: cartItems.length > 1 ? "Multiple" : firstItem.selectedSize,
        date: dateStr,
        time: timeStr,
        status: "pending",
        pickupLocation: STORE_INFO.address,
        customerName: user?.name || "Guest",
      };

      // Load existing orders
      const ordersJson = await AsyncStorage.getItem("@orders_data");
      const existingOrders = ordersJson ? JSON.parse(ordersJson) : [];

      // Add new order to beginning of array
      const updatedOrders = [newOrder, ...existingOrders];

      // Save back to storage
      await AsyncStorage.setItem("@orders_data", JSON.stringify(updatedOrders));
    } catch (error) {
      console.error("Failed to save order:", error);
    }

    setIsSuccessModalVisible(true);
  };

  const handleGoToOrders = () => {
    setIsSuccessModalVisible(false);
    clearCart();
    router.push("/profile?tab=orders");
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
        <IconSymbol name="trash.fill" size={20} color="#FFF" />
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
              <IconSymbol
                name="cart.fill"
                size={64}
                color="rgba(255,255,255,0.2)"
              />
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

      {cartItems.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.schedulingSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Schedule Pickup
            </ThemedText>
            <View style={styles.dateRow}>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <IconSymbol name="calendar" size={20} color="#007AFF" />
                <ThemedText style={styles.pickerButtonText}>
                  {scheduledDate.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowTimePicker(true)}
              >
                <IconSymbol name="clock.fill" size={20} color="#007AFF" />
                <ThemedText style={styles.pickerButtonText}>
                  {scheduledTime.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </ThemedText>
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={scheduledDate}
                mode="date"
                display="spinner"
                onChange={onDateChange}
                minimumDate={new Date()}
              />
            )}

            {showTimePicker && (
              <DateTimePicker
                value={scheduledTime}
                mode="time"
                display="spinner"
                onChange={onTimeChange}
              />
            )}
          </View>

          <View style={styles.checkoutRow}>
            <View style={styles.totalColumn}>
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
              <IconSymbol name="checkmark.circle.fill" size={28} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      )}

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
              style={styles.ordersButton}
              onPress={handleGoToOrders}
            >
              <IconSymbol name="suitcase.fill" size={20} color="#007AFF" />
              <ThemedText style={styles.ordersButtonText}>
                Go to My Orders
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
    backgroundColor: "#FF3B30",
    borderRadius: 12,
    shadowColor: "#FF3B30",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
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
  checkoutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
  },
  totalColumn: {
    flex: 1,
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
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
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
  ordersButton: {
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
  ordersButtonText: {
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
  schedulingSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  pickerButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  pickerButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

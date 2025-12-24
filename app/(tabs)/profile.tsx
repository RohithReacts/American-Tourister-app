import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { PRODUCTS } from "@/constants/products";
import { useAuth } from "@/context/AuthContext";
import {
  downloadInvoice,
  getInvoiceHTMLForDisplay,
} from "@/utils/invoiceGenerator";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";

interface Order {
  id: string;
  productId: string;
  productName: string;
  productImage: any;
  category: string;
  count: number;
  amount: number;
  mrp: number;
  size: string;
  date: string;
  time: string;
  color: string;
  pickupLocation: string;
  status?: "pending" | "confirmed" | "no_stock";
}

const STORE_LOCATION =
  "Vaishnavi Sales, 6-7-66, Raganna Darwaza, Main Road, Hyderabad - Warangal Hwy, Brahmanawada, Hanamkonda, Telangana 506011";

const CATEGORY_DATA = [
  { name: "Hard Luggage", icon: "suitcase.fill", color: "#FF3B30" },
  { name: "Soft Luggage", icon: "bag.fill", color: "#007AFF" },
  { name: "Backpacks", icon: "backpack.fill", color: "#34C759" },
];

const ORDERS_STORAGE_KEY = "@orders_data";

const getCurrentDate = () => {
  const now = new Date();
  return now.toISOString().split("T")[0]; // YYYY-MM-DD
};

const getCurrentTime = () => {
  const now = new Date();
  return now.toTimeString().split(" ")[0].substring(0, 5); // HH:MM
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const formatTime = (timeStr: string) => {
  const [hours, minutes] = timeStr.split(":");
  const date = new Date();
  date.setHours(parseInt(hours), parseInt(minutes));
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export default function ProfileScreen() {
  const router = useRouter();
  const [showOrders, setShowOrders] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isOrderModalVisible, setIsOrderModalVisible] = useState(false);
  const [isClearOrdersModalVisible, setIsClearOrdersModalVisible] =
    useState(false);
  const [selectedOrderForBill, setSelectedOrderForBill] =
    useState<Order | null>(null);
  const [isInvoiceModalVisible, setIsInvoiceModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      const storedOrders = await AsyncStorage.getItem(ORDERS_STORAGE_KEY);
      if (storedOrders) setOrders(JSON.parse(storedOrders));
    } catch (error) {
      console.error("Failed to refresh orders", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const { user, isAdmin, toggleAdmin, logout } = useAuth();
  const { tab } = useLocalSearchParams();

  // Handle deep linking to orders
  useEffect(() => {
    if (tab === "orders") {
      setShowOrders(true);
    }
  }, [tab]);

  // New Order State
  const [selectedOrderProductId, setSelectedOrderProductId] = useState(
    PRODUCTS[0].id
  );
  const [selectedOrderSize, setSelectedOrderSize] = useState(
    PRODUCTS[0].sizes[0]
  );
  const [newOrderCount, setNewOrderCount] = useState("");
  const [newOrderDate, setNewOrderDate] = useState(getCurrentDate());
  const [newOrderTime, setNewOrderTime] = useState(getCurrentTime());
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);

  const menuItems = [
    {
      icon: "person.fill",
      label: "My Account",
      action: () => router.push("/account-details"),
    },
    {
      icon: "bag.fill",
      label: "My Orders",
      action: () => setShowOrders(true),
    },
    {
      icon: "heart.fill",
      label: "Wishlist",
      action: () => router.push("/wishlist"),
    },
    ...(user?.email === "admin@americantourister.com"
      ? [
          {
            icon: "lock.shield.fill",
            label: "Admin Mode",
            isToggle: true,
            value: isAdmin,
            action: toggleAdmin,
          },
        ]
      : []),
  ];

  // Load orders from AsyncStorage on mount
  useEffect(() => {
    const loadOrders = async () => {
      try {
        const storedOrders = await AsyncStorage.getItem(ORDERS_STORAGE_KEY);
        if (storedOrders) setOrders(JSON.parse(storedOrders));
      } catch (error) {
        console.error("Failed to load orders", error);
      }
    };
    loadOrders();
  }, []);

  const saveOrdersToStorage = async (updatedOrders: Order[]) => {
    try {
      await AsyncStorage.setItem(
        ORDERS_STORAGE_KEY,
        JSON.stringify(updatedOrders)
      );
    } catch (error) {
      console.error("Failed to save orders data", error);
    }
  };

  const handleAddToPendingOrder = () => {
    const count = parseInt(newOrderCount);
    if (isNaN(count) || count <= 0) {
      Alert.alert("Invalid Input", "Please enter a valid order count.");
      return;
    }
    const product = PRODUCTS.find((p) => p.id === selectedOrderProductId)!;
    const unitPrice = product.sizePrices?.[selectedOrderSize] || product.price;
    const totalAmount = unitPrice * count;
    const categoryInfo =
      CATEGORY_DATA.find((c) => c.name === product.category) ||
      CATEGORY_DATA[0];

    const newOrder: Order = {
      id: Date.now().toString(),
      productId: product.id,
      productName: product.name,
      productImage: product.image,
      category: product.category,
      count,
      amount: totalAmount,
      mrp: (product.sizeMrps?.[selectedOrderSize] || product.mrp) * count,
      size: selectedOrderSize,
      date: newOrderDate,
      time: newOrderTime,
      color: categoryInfo.color,
      pickupLocation: STORE_LOCATION,
    };

    setPendingOrders([...pendingOrders, newOrder]);
    setNewOrderCount(""); // Reset count for next item
  };

  const handleRemovePendingOrder = (id: string) => {
    setPendingOrders(pendingOrders.filter((o) => o.id !== id));
  };

  const handleSaveAllOrders = async () => {
    if (pendingOrders.length === 0) {
      Alert.alert("Empty List", "Please add at least one product to the list.");
      return;
    }
    const updatedOrders = [...pendingOrders, ...orders];
    setOrders(updatedOrders);
    await saveOrdersToStorage(updatedOrders);

    setIsOrderModalVisible(false);
    setPendingOrders([]);
    setNewOrderCount("");
    setSelectedOrderProductId(PRODUCTS[0].id);
    setSelectedOrderSize(PRODUCTS[0].sizes[0]);
    setNewOrderDate(getCurrentDate());
    setNewOrderTime(getCurrentTime());
  };

  const handleClearOrders = async () => {
    setOrders([]);
    await saveOrdersToStorage([]);
    setIsClearOrdersModalVisible(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleOrderClick = (order: Order) => {
    setSelectedOrderForBill(order);
    setIsInvoiceModalVisible(true);
  };

  const handleConfirmOrder = async (order: Order) => {
    try {
      // 1. Load existing sales
      const storedSales = await AsyncStorage.getItem("@sales_data");
      const sales = storedSales ? JSON.parse(storedSales) : [];

      // 2. Create new sale from order
      const newSale = {
        id: Date.now().toString(),
        productId: order.productId,
        productName: order.productName,
        productImage: order.productImage,
        category: order.category,
        amount: order.amount,
        size: order.size,
        date: new Date().toISOString().split("T")[0],
        time: new Date().toTimeString().split(" ")[0].substring(0, 5),
        color: order.color || "#007AFF",
      };

      // 3. Save to sales
      const updatedSales = [newSale, ...sales];
      await AsyncStorage.setItem("@sales_data", JSON.stringify(updatedSales));

      // 4. Update order status
      const updatedOrders = orders.map((o) =>
        o.id === order.id ? { ...o, status: "confirmed" as const } : o
      );
      setOrders(updatedOrders);
      await saveOrdersToStorage(updatedOrders);

      Alert.alert("Success", "Order confirmed and added to sales!");
    } catch (error) {
      console.error("Failed to confirm order:", error);
      Alert.alert("Error", "Failed to confirm order.");
    }
  };

  const handleNoStockOrder = async (order: Order) => {
    try {
      const updatedOrders = orders.map((o) =>
        o.id === order.id ? { ...o, status: "no_stock" as const } : o
      );
      setOrders(updatedOrders);
      await saveOrdersToStorage(updatedOrders);
      Alert.alert("Success", "Order marked as No Stock.");
    } catch (error) {
      console.error("Failed to update order status:", error);
      Alert.alert("Error", "Failed to update order status.");
    }
  };

  const handleDownloadOrderInvoice = async () => {
    if (!selectedOrderForBill) return;

    try {
      await downloadInvoice({
        orderId: selectedOrderForBill.id,
        date: new Date(selectedOrderForBill.date).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        items: [
          {
            name: selectedOrderForBill.productName,
            size: selectedOrderForBill.size,
            price: selectedOrderForBill.amount / selectedOrderForBill.count,
            mrp: (() => {
              if (selectedOrderForBill.mrp)
                return selectedOrderForBill.mrp / selectedOrderForBill.count;
              const product = PRODUCTS.find(
                (p) => p.id === selectedOrderForBill.productId
              );
              if (product) {
                return (
                  product.sizeMrps?.[selectedOrderForBill.size] || product.mrp
                );
              }
              return selectedOrderForBill.amount / selectedOrderForBill.count;
            })(),
            quantity: selectedOrderForBill.count,
          },
        ],
        totalAmount: selectedOrderForBill.amount,
        storeInfo: {
          name: "Vaishnavi Sales",
          address: selectedOrderForBill.pickupLocation,
          phone: "8374200125",
        },
      });
    } catch (error) {
      console.error("Failed to download invoice:", error);
    }
  };

  const selectedOrderProduct = PRODUCTS.find(
    (p) => p.id === selectedOrderProductId
  )!;

  if (showOrders) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.ordersHeader}>
          <TouchableOpacity
            onPress={() => setShowOrders(false)}
            style={styles.backButton}
          >
            <IconSymbol name="chevron.left" size={24} color="#007AFF" />
          </TouchableOpacity>
          <ThemedText type="subtitle" style={styles.ordersTitle}>
            My Orders
          </ThemedText>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#007AFF"
              colors={["#007AFF"]}
            />
          }
        >
          <View style={styles.ordersSection}>
            <View style={styles.sectionHeader}>
              <ThemedText type="subtitle">Orders</ThemedText>
              <View style={styles.headerActions}>
                <TouchableOpacity
                  onPress={() => setIsOrderModalVisible(true)}
                  style={styles.iconButton}
                >
                  <IconSymbol
                    name="plus.circle.fill"
                    size={20}
                    color="#34C759"
                  />
                </TouchableOpacity>
                {orders.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setIsClearOrdersModalVisible(true)}
                    style={[styles.iconButton, { marginLeft: 12 }]}
                  >
                    <IconSymbol name="trash.fill" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            {orders.length > 0 ? (
              <View style={styles.ordersListContainer}>
                {orders.map((order) => (
                  <TouchableOpacity
                    key={order.id}
                    style={styles.orderCard}
                    onPress={() => handleOrderClick(order)}
                  >
                    <View style={styles.orderTopRow}>
                      <View style={styles.orderImageContainer}>
                        <Image
                          source={order.productImage}
                          style={styles.orderProductImage}
                          contentFit="contain"
                        />
                      </View>
                      <View style={styles.orderInfo}>
                        <ThemedText style={styles.orderCategory}>
                          {order.productName} • {order.size}
                        </ThemedText>
                        <ThemedText style={styles.orderAmount}>
                          {order.count} Orders • {formatCurrency(order.amount)}
                        </ThemedText>
                        <ThemedText
                          style={styles.orderPickupLocation}
                          numberOfLines={1}
                        >
                          📍 Pickup: Vaishnavi Sales
                        </ThemedText>
                        <ThemedText style={styles.orderTimestamp}>
                          {formatDate(order.date)} • {formatTime(order.time)}
                        </ThemedText>
                      </View>
                      {order.status === "confirmed" && (
                        <View style={styles.confirmedBadge}>
                          <IconSymbol
                            name="checkmark.circle.fill"
                            size={14}
                            color="#34C759"
                          />
                          <ThemedText style={styles.confirmedText}>
                            Confirmed
                          </ThemedText>
                        </View>
                      )}
                      {order.status === "no_stock" && (
                        <View style={styles.noStockBadge}>
                          <IconSymbol
                            name="exclamationmark.triangle.fill"
                            size={14}
                            color="#FF9500"
                          />
                          <ThemedText style={styles.noStockBadgeText}>
                            No Stock
                          </ThemedText>
                        </View>
                      )}
                    </View>

                    {isAdmin &&
                      order.status !== "confirmed" &&
                      order.status !== "no_stock" && (
                        <View style={styles.orderActions}>
                          <TouchableOpacity
                            style={styles.confirmOrderButton}
                            onPress={() => handleConfirmOrder(order)}
                          >
                            <ThemedText style={styles.confirmOrderText}>
                              Confirm
                            </ThemedText>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.noStockButton}
                            onPress={() => handleNoStockOrder(order)}
                          >
                            <ThemedText style={styles.noStockText}>
                              No Stock
                            </ThemedText>
                          </TouchableOpacity>
                        </View>
                      )}
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.emptyOrders}>
                <ThemedText style={styles.emptyOrdersText}>
                  No orders recorded.
                </ThemedText>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Add Order Modal */}
        <Modal
          visible={isOrderModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setIsOrderModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { maxHeight: "90%" }]}>
              <ThemedText type="subtitle" style={styles.modalTitle}>
                Add New Orders
              </ThemedText>

              <ScrollView showsVerticalScrollIndicator={false}>
                <ThemedText style={styles.inputLabel}>
                  Select Product
                </ThemedText>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.productPickerScroll}
                  contentContainerStyle={styles.productPickerContent}
                >
                  {PRODUCTS.map((product) => (
                    <TouchableOpacity
                      key={product.id}
                      style={[
                        styles.productPickerItem,
                        selectedOrderProductId === product.id &&
                          styles.productPickerItemActive,
                      ]}
                      onPress={() => {
                        setSelectedOrderProductId(product.id);
                        setSelectedOrderSize(product.sizes[0]);
                      }}
                    >
                      <Image
                        source={product.image}
                        style={styles.productPickerImage}
                        contentFit="contain"
                      />
                      <ThemedText
                        style={[
                          styles.productPickerName,
                          selectedOrderProductId === product.id &&
                            styles.productPickerTextActive,
                        ]}
                        numberOfLines={1}
                      >
                        {product.name}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <ThemedText style={styles.inputLabel}>Select Size</ThemedText>
                <View style={styles.categoryPicker}>
                  {selectedOrderProduct.sizes.map((size) => (
                    <TouchableOpacity
                      key={size}
                      style={[
                        styles.pickerItem,
                        selectedOrderSize === size && styles.pickerItemActive,
                      ]}
                      onPress={() => setSelectedOrderSize(size)}
                    >
                      <ThemedText
                        style={[
                          styles.pickerText,
                          selectedOrderSize === size && styles.pickerTextActive,
                        ]}
                      >
                        {size}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.modalInputRow}>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={styles.inputLabel}>Quantity</ThemedText>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="Count"
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      keyboardType="numeric"
                      value={newOrderCount}
                      onChangeText={setNewOrderCount}
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <ThemedText style={styles.inputLabel}>Total</ThemedText>
                    <View style={styles.priceDisplay}>
                      <ThemedText
                        style={[styles.priceDisplayText, { fontSize: 16 }]}
                      >
                        {formatCurrency(
                          (selectedOrderProduct.sizePrices?.[
                            selectedOrderSize
                          ] || selectedOrderProduct.price) *
                            (parseInt(newOrderCount) || 0)
                        )}
                      </ThemedText>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.addToListButton,
                    { alignSelf: "center", width: "100%", marginBottom: 24 },
                  ]}
                  onPress={handleAddToPendingOrder}
                >
                  <IconSymbol name="plus" size={20} color="#FFF" />
                  <ThemedText style={styles.addToListText}>
                    Add to List
                  </ThemedText>
                </TouchableOpacity>

                {pendingOrders.length > 0 && (
                  <View style={styles.pendingSection}>
                    <ThemedText style={styles.inputLabel}>
                      Pending Items ({pendingOrders.length})
                    </ThemedText>
                    {pendingOrders.map((item) => (
                      <View key={item.id} style={styles.pendingItem}>
                        <View style={styles.pendingItemInfo}>
                          <ThemedText
                            style={styles.pendingItemName}
                            numberOfLines={1}
                          >
                            {item.productName} • {item.size}
                          </ThemedText>
                          <ThemedText style={styles.pendingItemPrice}>
                            {item.count} Units • {formatCurrency(item.amount)}
                          </ThemedText>
                        </View>
                        <TouchableOpacity
                          onPress={() => handleRemovePendingOrder(item.id)}
                        >
                          <IconSymbol
                            name="trash.fill"
                            size={18}
                            color="#FF3B30"
                          />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}

                <View style={styles.modalInputRow}>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={styles.inputLabel}>Date</ThemedText>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      value={newOrderDate}
                      onChangeText={setNewOrderDate}
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <ThemedText style={styles.inputLabel}>Time</ThemedText>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="HH:MM"
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      value={newOrderTime}
                      onChangeText={setNewOrderTime}
                    />
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setIsOrderModalVisible(false);
                    setPendingOrders([]);
                  }}
                >
                  <ThemedText style={styles.buttonText}>Cancel</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.addButton,
                    { backgroundColor: "#34C759" },
                  ]}
                  onPress={handleSaveAllOrders}
                >
                  <ThemedText style={styles.buttonText}>Save All</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Clear Orders Modal */}
        <Modal
          visible={isClearOrdersModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setIsClearOrdersModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, styles.clearModalContent]}>
              <View style={styles.warningIconContainer}>
                <IconSymbol
                  name="exclamationmark.triangle.fill"
                  size={40}
                  color="#FF3B30"
                />
              </View>

              <ThemedText type="subtitle" style={styles.modalTitle}>
                Clear All Orders?
              </ThemedText>

              <ThemedText style={styles.modalMessage}>
                This will permanently remove all orders recorded. This action
                cannot be undone.
              </ThemedText>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setIsClearOrdersModalVisible(false)}
                >
                  <ThemedText style={styles.buttonText}>Cancel</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={handleClearOrders}
                >
                  <ThemedText style={styles.buttonText}>Clear All</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Invoice View Modal */}
        <Modal
          visible={isInvoiceModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setIsInvoiceModalVisible(false)}
        >
          <View style={styles.invoiceModalOverlay}>
            <View style={styles.invoiceModalContent}>
              <View style={styles.invoiceModalHeader}>
                <ThemedText type="subtitle" style={styles.invoiceModalTitle}>
                  Invoice #{selectedOrderForBill?.id}
                </ThemedText>
                <TouchableOpacity
                  onPress={() => setIsInvoiceModalVisible(false)}
                  style={styles.closeButton}
                >
                  <IconSymbol name="xmark.circle.fill" size={28} color="#666" />
                </TouchableOpacity>
              </View>

              {selectedOrderForBill && (
                <>
                  <WebView
                    originWhitelist={["*"]}
                    source={{
                      html: getInvoiceHTMLForDisplay({
                        orderId: selectedOrderForBill.id,
                        date: new Date(
                          selectedOrderForBill.date
                        ).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }),
                        items: [
                          {
                            name: selectedOrderForBill.productName,
                            size: selectedOrderForBill.size,
                            price:
                              selectedOrderForBill.amount /
                              selectedOrderForBill.count,
                            mrp: (() => {
                              if (selectedOrderForBill.mrp)
                                return (
                                  selectedOrderForBill.mrp /
                                  selectedOrderForBill.count
                                );
                              const product = PRODUCTS.find(
                                (p) => p.id === selectedOrderForBill.productId
                              );
                              if (product) {
                                return (
                                  product.sizeMrps?.[
                                    selectedOrderForBill.size
                                  ] || product.mrp
                                );
                              }
                              return (
                                selectedOrderForBill.amount /
                                selectedOrderForBill.count
                              );
                            })(),
                            quantity: selectedOrderForBill.count,
                          },
                        ],
                        totalAmount: selectedOrderForBill.amount,
                        storeInfo: {
                          name: "Vaishnavi Sales",
                          address: selectedOrderForBill.pickupLocation,
                          phone: "8374200125",
                        },
                      }),
                    }}
                    style={styles.webView}
                  />

                  <TouchableOpacity
                    style={styles.downloadInvoiceButton}
                    onPress={handleDownloadOrderInvoice}
                  >
                    <IconSymbol
                      name="arrow.down.circle.fill"
                      size={20}
                      color="#FFF"
                    />
                    <ThemedText style={styles.downloadInvoiceText}>
                      Download PDF
                    </ThemedText>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </Modal>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#007AFF"
            colors={["#007AFF"]}
          />
        }
      >
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.action}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                  <IconSymbol
                    name={item.icon as any}
                    size={20}
                    color={item.isToggle && item.value ? "#34C759" : "#007AFF"}
                  />
                </View>
                <ThemedText style={styles.menuLabel}>{item.label}</ThemedText>
              </View>
              {item.isToggle ? (
                <Switch
                  value={item.value}
                  onValueChange={item.action}
                  trackColor={{ false: "#3e3e3e", true: "#34C759" }}
                  thumbColor={item.value ? "#FFF" : "#f4f3f4"}
                />
              ) : (
                <IconSymbol
                  name="chevron.right"
                  size={16}
                  color="rgba(255,255,255,0.3)"
                />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <ThemedText style={styles.logoutText}>Log Out</ThemedText>
        </TouchableOpacity>

        <ThemedText style={styles.versionText}>Version 1.0.0</ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 80,
    paddingBottom: 32,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  profileInfo: {
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#007AFF",
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#007AFF",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#000",
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    opacity: 0.5,
  },
  menuSection: {
    padding: 16,
    marginTop: 8,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  logoutButton: {
    margin: 16,
    marginTop: 32,
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(255, 59, 48, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  logoutText: {
    color: "#FF3B30",
    fontSize: 16,
    fontWeight: "bold",
  },
  versionText: {
    textAlign: "center",
    opacity: 0.3,
    fontSize: 12,
    marginBottom: 40,
  },
  // Orders Screen Styles
  ordersHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(0, 122, 255, 0.1)",
  },
  ordersTitle: {
    fontSize: 18,
  },
  ordersSection: {
    padding: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 8,
  },
  ordersListContainer: {
    gap: 12,
  },
  orderCard: {
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    marginBottom: 12,
  },
  orderTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  orderImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#FFF",
    padding: 4,
    marginRight: 12,
  },
  orderProductImage: {
    width: "100%",
    height: "100%",
  },
  orderInfo: {
    justifyContent: "center",
    flex: 1,
  },
  orderCategory: {
    fontSize: 12,
    fontWeight: "bold",
    opacity: 0.8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 4,
  },
  orderPickupLocation: {
    fontSize: 11,
    fontWeight: "600",
    opacity: 0.7,
    marginTop: 4,
    color: "#34C759",
  },
  orderTimestamp: {
    fontSize: 10,
    fontWeight: "600",
    opacity: 0.6,
    marginTop: 2,
  },
  orderActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  confirmOrderButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    flex: 1,
    alignItems: "center",
  },
  confirmOrderText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  noStockButton: {
    backgroundColor: "rgba(255, 149, 0, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 149, 0, 0.2)",
    flex: 1,
    alignItems: "center",
  },
  noStockText: {
    color: "#FF9500",
    fontSize: 14,
    fontWeight: "bold",
  },
  confirmedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(52, 199, 89, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  confirmedText: {
    color: "#34C759",
    fontSize: 10,
    fontWeight: "bold",
  },
  noStockBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 149, 0, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  noStockBadgeText: {
    color: "#FF9500",
    fontSize: 10,
    fontWeight: "bold",
  },
  emptyOrders: {
    padding: 40,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.02)",
    borderRadius: 16,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  emptyOrdersText: {
    opacity: 0.4,
    fontSize: 14,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "#1A1A1A",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  modalTitle: {
    marginBottom: 24,
    textAlign: "center",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
    opacity: 0.7,
  },
  productPickerScroll: {
    marginBottom: 24,
  },
  productPickerContent: {
    gap: 12,
  },
  productPickerItem: {
    width: 100,
    padding: 8,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
  },
  productPickerItemActive: {
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    borderColor: "#007AFF",
  },
  productPickerImage: {
    width: 60,
    height: 60,
    marginBottom: 8,
  },
  productPickerName: {
    fontSize: 10,
    textAlign: "center",
    opacity: 0.7,
  },
  productPickerTextActive: {
    fontWeight: "bold",
    opacity: 1,
    color: "#007AFF",
  },
  categoryPicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 24,
  },
  pickerItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  pickerItemActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  pickerText: {
    fontSize: 14,
  },
  pickerTextActive: {
    fontWeight: "bold",
    color: "#FFF",
  },
  modalInputRow: {
    flexDirection: "row",
    marginBottom: 24,
    alignItems: "flex-end",
  },
  modalInput: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 16,
    color: "#FFF",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  priceDisplay: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
  },
  priceDisplayText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#34C759",
  },
  addToListButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    borderRadius: 12,
    height: 56,
  },
  addToListText: {
    color: "#FFF",
    fontWeight: "bold",
    marginLeft: 8,
  },
  pendingSection: {
    marginBottom: 24,
    backgroundColor: "rgba(255,255,255,0.02)",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  pendingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  pendingItemInfo: {
    flex: 1,
  },
  pendingItemName: {
    fontSize: 14,
    fontWeight: "bold",
  },
  pendingItemPrice: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  modalButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  addButton: {
    backgroundColor: "#007AFF",
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  clearModalContent: {
    alignItems: "center",
    maxWidth: 340,
  },
  warningIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 59, 48, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  modalMessage: {
    textAlign: "center",
    opacity: 0.6,
    lineHeight: 20,
    marginBottom: 32,
  },
  confirmButton: {
    backgroundColor: "#FF3B30",
  },
  // Invoice Modal Styles
  invoiceModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  invoiceModalContent: {
    width: "95%",
    height: "90%",
    backgroundColor: "#1A1A1A",
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  invoiceModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  invoiceModalTitle: {
    fontSize: 18,
  },
  closeButton: {
    padding: 4,
  },
  webView: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  downloadInvoiceButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    margin: 20,
    marginTop: 12,
    height: 56,
    borderRadius: 16,
    gap: 12,
  },
  downloadInvoiceText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

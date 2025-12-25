import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { OrderProgressTracker } from "@/components/ui/OrderProgressTracker";
import { OrderStatusBadge } from "@/components/ui/OrderStatusBadge";
import { SuccessModal } from "@/components/ui/SuccessModal";
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
  userId: string;
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
  status?:
    | "pending"
    | "preparing"
    | "ready"
    | "picked_up"
    | "confirmed"
    | "no_stock";
}

const STORE_LOCATION =
  "Vaishnavi Sales, 6-7-66, Raganna Darwaza, Main Road, Hyderabad - Warangal Hwy, Brahmanawada, Hanamkonda, Telangana 506011";

const CATEGORY_DATA = [
  { name: "Hard Luggage", icon: "suitcase.fill", color: "#FF3B30" },
  { name: "Soft Luggage", icon: "bag.fill", color: "#007AFF" },
  { name: "Backpacks", icon: "backpack.fill", color: "#34C759" },
  { name: "Kids", icon: "figure.child", color: "#AF52DE" },
  { name: "Accessories", icon: "cube.box.fill", color: "#FF9F0A" },
  { name: "Office", icon: "briefcase.fill", color: "#5856D6" },
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
  const { user, isAdmin, toggleAdmin, logout, getAllUsers, deleteUser } =
    useAuth();
  const { tab } = useLocalSearchParams();

  const [showOrders, setShowOrders] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOrderModalVisible, setIsOrderModalVisible] = useState(false);
  const [isClearOrdersModalVisible, setIsClearOrdersModalVisible] =
    useState(false);
  const [selectedOrderForBill, setSelectedOrderForBill] =
    useState<Order | null>(null);
  const [isInvoiceModalVisible, setIsInvoiceModalVisible] = useState(false);
  const [isUserListVisible, setIsUserListVisible] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [deleteConfirmationVisible, setDeleteConfirmationVisible] =
    useState(false);
  const [userToDelete, setUserToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const filteredUsers = users.filter(
    (u) =>
      (u.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (u.email?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const loadUsers = async () => {
    const allUsers = await getAllUsers();
    setUsers(allUsers);
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      const storedOrders = await AsyncStorage.getItem(ORDERS_STORAGE_KEY);
      if (storedOrders) {
        const allOrders: Order[] = JSON.parse(storedOrders);
        // Admin sees all orders, Users see only their own
        const filteredOrders = isAdmin
          ? allOrders
          : allOrders.filter((o) => o.userId === user?.id);
        setOrders(filteredOrders);
      }
      if (isAdmin) {
        await loadUsers();
      }
    } catch (error) {
      console.error("Failed to refresh data", error);
    } finally {
      setRefreshing(false);
    }
  }, [isAdmin, user?.id]); // Added getAllUsers to deps for completeness, though it's stable from context

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  const handleDeleteUser = (userId: string, userName: string) => {
    setUserToDelete({ id: userId, name: userName });
    setDeleteConfirmationVisible(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    setDeleteConfirmationVisible(false);
    const result = await deleteUser(userToDelete.id);

    if (result.success) {
      loadUsers();
      setSuccessMessage(`User ${userToDelete.name} has been removed.`);
      setShowSuccessModal(true);
    } else {
      Alert.alert("Error", result.message || "Failed to delete user");
    }
    setUserToDelete(null);
  };

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
    ...(isAdmin
      ? [
          {
            icon: "person.2.circle.fill",
            label: `User Management (${users.length})`,
            action: () => {
              console.log("Opening User Management Modal");
              setIsUserListVisible(true);
            },
          },
        ]
      : []),
  ];

  // Load orders from AsyncStorage on mount
  useEffect(() => {
    const loadOrders = async () => {
      try {
        const storedOrders = await AsyncStorage.getItem(ORDERS_STORAGE_KEY);
        if (storedOrders) {
          const allOrders: Order[] = JSON.parse(storedOrders);
          // Filter orders: Admin sees all, User sees only theirs
          const filteredOrders = isAdmin
            ? allOrders
            : allOrders.filter((o) => o.userId === user?.id);
          setOrders(filteredOrders);
        }
      } catch (error) {
        console.error("Failed to load orders", error);
      }
    };
    loadOrders();
  }, [isAdmin, user]);

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
      userId: user?.id || "manual",
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

      setSuccessMessage("Order confirmed and added to sales!");
      setShowSuccessModal(true);
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
      setSuccessMessage("Order marked as No Stock.");
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Failed to update order status:", error);
      Alert.alert("Error", "Failed to update order status.");
    }
  };

  const handlePreparingOrder = async (order: Order) => {
    try {
      const updatedOrders = orders.map((o) =>
        o.id === order.id ? { ...o, status: "preparing" as const } : o
      );
      setOrders(updatedOrders);
      await saveOrdersToStorage(updatedOrders);
      setSuccessMessage("Order marked as Preparing.");
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Failed to update order status:", error);
      Alert.alert("Error", "Failed to update order status.");
    }
  };

  const handleReadyOrder = async (order: Order) => {
    try {
      const updatedOrders = orders.map((o) =>
        o.id === order.id ? { ...o, status: "ready" as const } : o
      );
      setOrders(updatedOrders);
      await saveOrdersToStorage(updatedOrders);
      setSuccessMessage("Order marked as Ready for Pickup.");
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Failed to update order status:", error);
      Alert.alert("Error", "Failed to update order status.");
    }
  };

  const handlePickedUpOrder = async (order: Order) => {
    try {
      const updatedOrders = orders.map((o) =>
        o.id === order.id ? { ...o, status: "picked_up" as const } : o
      );
      setOrders(updatedOrders);
      await saveOrdersToStorage(updatedOrders);
      setSuccessMessage("Order marked as Picked Up.");
      setShowSuccessModal(true);
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
                        <ThemedText style={styles.orderPickupLocation}>
                          📍 Pickup: Vaishnavi Sales
                        </ThemedText>
                        <ThemedText style={styles.orderTimestamp}>
                          {formatDate(order.date)} • {formatTime(order.time)}
                        </ThemedText>
                      </View>
                    </View>

                    {/* Order Progress Tracker */}
                    <OrderProgressTracker status={order.status} />

                    {isAdmin &&
                      order.status !== "confirmed" &&
                      order.status !== "no_stock" && (
                        <View style={styles.orderActions}>
                          {/* Show Preparing button only for pending orders */}
                          {order.status === "pending" && (
                            <TouchableOpacity
                              style={styles.preparingButton}
                              onPress={() => handlePreparingOrder(order)}
                            >
                              <IconSymbol
                                name="clock.fill"
                                size={16}
                                color="#FF9F0A"
                              />
                              <ThemedText style={styles.preparingText}>
                                Preparing
                              </ThemedText>
                            </TouchableOpacity>
                          )}

                          {/* Show Ready button only for preparing orders */}
                          {order.status === "preparing" && (
                            <TouchableOpacity
                              style={styles.readyButton}
                              onPress={() => handleReadyOrder(order)}
                            >
                              <IconSymbol
                                name="checkmark.circle.fill"
                                size={16}
                                color="#34C759"
                              />
                              <ThemedText style={styles.readyText}>
                                Ready
                              </ThemedText>
                            </TouchableOpacity>
                          )}

                          {/* Show Picked Up button only for ready orders */}
                          {order.status === "ready" && (
                            <TouchableOpacity
                              style={styles.pickedUpButton}
                              onPress={() => handlePickedUpOrder(order)}
                            >
                              <IconSymbol
                                name="bag.fill"
                                size={16}
                                color="#34C759"
                              />
                              <ThemedText style={styles.pickedUpText}>
                                Picked Up
                              </ThemedText>
                            </TouchableOpacity>
                          )}

                          {/* Show Confirm button only for picked_up orders */}
                          {order.status === "picked_up" && (
                            <TouchableOpacity
                              style={styles.confirmOrderButton}
                              onPress={() => handleConfirmOrder(order)}
                            >
                              <IconSymbol
                                name="checkmark.circle.fill"
                                size={16}
                                color="#FFF"
                              />
                              <ThemedText style={styles.confirmOrderText}>
                                Confirm
                              </ThemedText>
                            </TouchableOpacity>
                          )}

                          {/* No Stock button always available */}
                          <TouchableOpacity
                            style={styles.noStockButton}
                            onPress={() => handleNoStockOrder(order)}
                          >
                            <IconSymbol
                              name="exclamationmark.triangle.fill"
                              size={16}
                              color="#FF9500"
                            />
                            <ThemedText style={styles.noStockText}>
                              No Stock
                            </ThemedText>
                          </TouchableOpacity>
                        </View>
                      )}

                    {/* Status Badge - At Bottom */}
                    <View style={styles.orderStatusSection}>
                      <OrderStatusBadge status={order.status} />
                    </View>
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
        <View style={styles.header}>
          <View style={styles.profileInfo}>
            <TouchableOpacity
              style={styles.avatarContainer}
              onPress={() => router.push("/account-details")}
            >
              <Image
                source={
                  user?.avatar ||
                  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1000&auto=format&fit=crop"
                }
                style={styles.avatar}
              />
              <View style={styles.editBadge}>
                <IconSymbol name="pencil" size={14} color="#FFF" />
              </View>
            </TouchableOpacity>
            <ThemedText style={styles.userName}>{user?.name}</ThemedText>
            <ThemedText style={styles.userEmail}>{user?.email}</ThemedText>
            <ThemedText
              style={{
                fontSize: 12,
                opacity: 0.5,
                marginTop: 8,
                letterSpacing: 0.5,
              }}
            >
              Member Since{" "}
              {(() => {
                const date = new Date(user?.createdAt || Date.now());
                return `${date.getDate()} ${date.toLocaleString("default", {
                  month: "long",
                })} ${date.getFullYear()}`;
              })()}
            </ThemedText>
          </View>
        </View>

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

      {/* User Management Modal */}
      <Modal
        visible={isUserListVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsUserListVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: "80%" }]}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <ThemedText type="subtitle">User Management</ThemedText>
              <TouchableOpacity onPress={() => setIsUserListVisible(false)}>
                <IconSymbol name="xmark.circle.fill" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ThemedText style={{ opacity: 0.6, marginBottom: 16 }}>
              Total Registered Users: {users.length}
            </ThemedText>

            <View style={styles.searchContainer}>
              <IconSymbol
                name="magnifyingglass"
                size={18}
                color="rgba(255,255,255,0.4)"
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name or email..."
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery !== "" && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <IconSymbol
                    name="xmark.circle.fill"
                    size={18}
                    color="rgba(255,255,255,0.4)"
                  />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <View key={u.id} style={styles.userCard}>
                    <View style={styles.userAvatar}>
                      <ThemedText style={styles.userAvatarText}>
                        {u.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </ThemedText>
                    </View>
                    <View style={styles.userInfo}>
                      <ThemedText style={styles.userNameText}>
                        {u.name}
                      </ThemedText>
                      <ThemedText style={styles.userEmailText}>
                        {u.email}
                      </ThemedText>
                      <View style={styles.userDetailsRow}>
                        <IconSymbol
                          name="calendar"
                          size={12}
                          color="rgba(255,255,255,0.4)"
                          style={{ marginRight: 4 }}
                        />
                        <ThemedText style={styles.userJoinedText}>
                          Joined{" "}
                          {new Date(
                            u.createdAt || Date.now()
                          ).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </ThemedText>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteUser(u.id, u.name)}
                      style={styles.removeUserButton}
                    >
                      <IconSymbol name="trash.fill" size={18} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <View style={{ padding: 20, alignItems: "center" }}>
                  <IconSymbol
                    name="person.2.circle.fill"
                    size={48}
                    color="rgba(255,255,255,0.2)"
                    style={{ marginBottom: 12 }}
                  />
                  <ThemedText
                    style={{
                      textAlign: "center",
                      opacity: 0.8,
                      fontSize: 16,
                    }}
                  >
                    {searchQuery
                      ? "No users match your search."
                      : "No registered users found."}
                  </ThemedText>
                  {!searchQuery && (
                    <ThemedText
                      style={{
                        textAlign: "center",
                        opacity: 0.5,
                        marginTop: 8,
                        fontSize: 12,
                      }}
                    >
                      New users will appear here after they sign up.
                    </ThemedText>
                  )}
                </View>
              )}
            </ScrollView>

            <TouchableOpacity
              style={[
                styles.modalButton,
                styles.cancelButton,
                { marginTop: 20 },
              ]}
              onPress={() => setIsUserListVisible(false)}
            >
              <ThemedText style={styles.buttonText}>Close</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        message={successMessage}
        onClose={() => setShowSuccessModal(false)}
        buttonText="OK"
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        visible={deleteConfirmationVisible}
        title="Delete User"
        message={`Are you sure you want to delete ${userToDelete?.name}? This action cannot be undone.`}
        onConfirm={confirmDeleteUser}
        onCancel={() => {
          setDeleteConfirmationVisible(false);
          setUserToDelete(null);
        }}
        confirmText="Delete"
        isDestructive
      />
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
    padding: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  ordersListContainer: {
    gap: 12,
  },
  orderCard: {
    padding: 18,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.12)",
    marginBottom: 14,
  },
  orderStatusSection: {
    marginTop: 12,
    alignSelf: "center",
    width: "100%",
    alignItems: "center",
  },
  orderTopRow: {
    flexDirection: "column",
    alignItems: "center",
  },
  orderImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: "#FFF",
    padding: 6,
    marginBottom: 12,
  },
  orderProductImage: {
    width: "100%",
    height: "100%",
  },
  orderInfo: {
    justifyContent: "center",
    flex: 1,
    alignItems: "center",
    width: "100%",
  },
  orderCategory: {
    fontSize: 15,
    fontWeight: "700",
    opacity: 0.9,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 4,
    textAlign: "center",
  },
  orderPickupLocation: {
    fontSize: 11,
    fontWeight: "600",
    opacity: 0.7,
    marginTop: 4,
    color: "#34C759",
    textAlign: "center",
  },
  orderTimestamp: {
    fontSize: 10,
    fontWeight: "600",
    opacity: 0.6,
    marginTop: 2,
    textAlign: "center",
  },
  orderActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1.5,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  confirmOrderButton: {
    backgroundColor: "#34C759",
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 12,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  confirmOrderText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "bold",
  },
  preparingButton: {
    backgroundColor: "rgba(255, 159, 10, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 159, 10, 0.2)",
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  preparingText: {
    color: "#FF9F0A",
    fontSize: 13,
    fontWeight: "bold",
  },
  noStockButton: {
    backgroundColor: "rgba(255, 149, 0, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 149, 0, 0.2)",
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  noStockText: {
    color: "#FF9500",
    fontSize: 13,
    fontWeight: "bold",
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
  noStockBadgeText: {
    color: "#FF9500",
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
  preparingBadgeText: {
    color: "#FF9F0A",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
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
  pendingBadgeText: {
    color: "#007AFF",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
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
  userCard: {
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#252525",
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    position: "relative",
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  userAvatarText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  userNameText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#FFF",
    marginBottom: 2,
  },
  userEmailText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    marginBottom: 6,
  },
  userIdText: {
    fontSize: 10,
    opacity: 0.4,
    marginTop: 4,
  },
  deleteUserButton: {
    padding: 8,
    backgroundColor: "rgba(255, 59, 48, 0.1)",
    borderRadius: 8,
  },
  userInfo: {
    alignItems: "center",
    width: "100%",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  searchInput: {
    flex: 1,
    color: "#FFF",
    fontSize: 14,
    marginLeft: 8,
  },
  userDetailsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  userJoinedText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
  },
  removeUserButton: {
    position: "absolute",
    bottom: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 59, 48, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  removeText: {
    display: "none",
  },
  // Ready Badge and Button Styles
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
  readyBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#34C759",
    letterSpacing: 0.3,
  },
  readyButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "rgba(52, 199, 89, 0.15)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(52, 199, 89, 0.3)",
  },
  readyText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#34C759",
  },
  // Picked Up Badge and Button Styles - MOST PROMINENT
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
  pickedUpBadgeText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFF",
    letterSpacing: 0.5,
  },
  pickedUpButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "rgba(52, 199, 89, 0.15)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(52, 199, 89, 0.3)",
  },
  pickedUpText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#34C759",
  },
});

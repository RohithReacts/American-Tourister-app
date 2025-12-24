import { ProductCard } from "@/components/ProductCard";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { PRODUCTS } from "@/constants/products";
import { useAuth } from "@/context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Linking,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

interface Sale {
  id: string;
  productId: string;
  productName: string;
  productImage: any;
  category: string;
  amount: number;
  size: string;
  date: string;
  time: string;
  color: string;
}

const STORE_LOCATION =
  "Vaishnavi Sales, 6-7-66, Raganna Darwaza, Main Road, Hyderabad - Warangal Hwy, Brahmanawada, Hanamkonda, Telangana 506011";

const STORE_PHONE = "8374200125";

const CATEGORY_DATA = [
  { name: "Hard Luggage", icon: "suitcase.fill", color: "#FF3B30" },
  { name: "Soft Luggage", icon: "bag.fill", color: "#007AFF" },
  { name: "Backpacks", icon: "backpack.fill", color: "#34C759" },
  { name: "Kids", icon: "figure.child", color: "#AF52DE" },
  { name: "Accessories", icon: "cube.box.fill", color: "#FF9F0A" },
  { name: "Office", icon: "briefcase.fill", color: "#5856D6" },
];

const SALES_STORAGE_KEY = "@sales_data";

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

export default function HomeScreen() {
  const router = useRouter();
  const { isAdmin, user } = useAuth();
  const featuredProducts = PRODUCTS.filter((p) => p.isFeatured);

  // Sales State
  const [sales, setSales] = useState<Sale[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isClearModalVisible, setIsClearModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      const storedSales = await AsyncStorage.getItem(SALES_STORAGE_KEY);
      if (storedSales) setSales(JSON.parse(storedSales));
      await getCurrentLocation();
    } catch (error) {
      console.error("Failed to refresh data", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // New Sale State
  const [selectedProductId, setSelectedProductId] = useState(PRODUCTS[0].id);
  const [selectedSize, setSelectedSize] = useState(PRODUCTS[0].sizes[0]);
  const [newSaleDate, setNewSaleDate] = useState(getCurrentDate());
  const [newSaleTime, setNewSaleTime] = useState(getCurrentTime());
  const [pendingSales, setPendingSales] = useState<Sale[]>([]);

  // Location State
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [locationAddress, setLocationAddress] = useState<string>("");
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState<string>("");
  const [isAddressExpanded, setIsAddressExpanded] = useState(false);

  // Location Functions
  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationError("Location permission denied");
        setLocationLoading(false);
        return false;
      }
      return true;
    } catch (error) {
      setLocationError("Error requesting permission");
      setLocationLoading(false);
      return false;
    }
  };

  const getCurrentLocation = async () => {
    setLocationLoading(true);
    setLocationError("");

    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) return;

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation(currentLocation);

      // Reverse geocode to get address
      const [address] = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      if (address) {
        const formattedAddress = [address.city, address.region, address.country]
          .filter(Boolean)
          .join(", ");
        setLocationAddress(formattedAddress || "Location found");
      } else {
        setLocationAddress("Location found");
      }
      setLocationLoading(false);
    } catch (error) {
      console.error("Failed to get location", error);
      setLocationError("Unable to fetch location");
      setLocationLoading(false);
    }
  };

  // Store Contact Functions
  const handlePhoneCall = async () => {
    const phoneUrl = `tel:${STORE_PHONE}`;
    const canOpen = await Linking.canOpenURL(phoneUrl);
    if (canOpen) {
      await Linking.openURL(phoneUrl);
    } else {
      Alert.alert("Error", "Unable to make phone call");
    }
  };

  const toggleAddressExpansion = () => {
    setIsAddressExpanded(!isAddressExpanded);
  };

  // Load data from AsyncStorage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedSales = await AsyncStorage.getItem(SALES_STORAGE_KEY);
        if (storedSales) setSales(JSON.parse(storedSales));
      } catch (error) {
        console.error("Failed to load data", error);
      }
    };
    loadData();
  }, []);

  // Get location on mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Persistence Helpers
  const saveSalesToStorage = async (updatedSales: Sale[]) => {
    try {
      await AsyncStorage.setItem(
        SALES_STORAGE_KEY,
        JSON.stringify(updatedSales)
      );
    } catch (error) {
      console.error("Failed to save sales data", error);
    }
  };

  const handleCategoryPress = (category: string) => {
    router.push({
      pathname: "/explore",
      params: { category },
    });
  };

  // Sales Handlers
  const handleAddToPendingSale = () => {
    const product = PRODUCTS.find((p) => p.id === selectedProductId)!;
    const amount = product.sizePrices?.[selectedSize] || product.price;
    const categoryInfo =
      CATEGORY_DATA.find((c) => c.name === product.category) ||
      CATEGORY_DATA[0];

    const newSale: Sale = {
      id: Date.now().toString(),
      productId: product.id,
      productName: product.name,
      productImage: product.image,
      category: product.category,
      amount,
      size: selectedSize,
      date: newSaleDate,
      time: newSaleTime,
      color: categoryInfo.color,
    };

    setPendingSales([...pendingSales, newSale]);
  };

  const handleRemovePendingSale = (id: string) => {
    setPendingSales(pendingSales.filter((s) => s.id !== id));
  };

  const handleSaveAllSales = async () => {
    if (pendingSales.length === 0) {
      Alert.alert("Empty List", "Please add at least one product to the list.");
      return;
    }
    const updatedSales = [...pendingSales, ...sales];
    setSales(updatedSales);
    await saveSalesToStorage(updatedSales);

    setIsModalVisible(false);
    setPendingSales([]);
    setSelectedProductId(PRODUCTS[0].id);
    setSelectedSize(PRODUCTS[0].sizes[0]);
    setNewSaleDate(getCurrentDate());
    setNewSaleTime(getCurrentTime());
  };

  const handleClearSales = async () => {
    setSales([]);
    await saveSalesToStorage([]);
    setIsClearModalVisible(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const selectedProduct = PRODUCTS.find((p) => p.id === selectedProductId)!;

  return (
    <ThemedView style={styles.container}>
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
        {/* Dashboard Header */}
        <View style={styles.dashboardHeader}>
          <View style={styles.headerTop}>
            <View>
              <ThemedText type="title" style={styles.userName}>
                {user?.name?.split(" ")[0] || "Traveler"}
              </ThemedText>
            </View>
            <View style={styles.logoContainer}>
              <Image
                source={require("@/assets/American_Tourister_logo.svg")}
                style={styles.logo}
                contentFit="contain"
              />
            </View>
          </View>

          <View style={styles.searchContainer}>
            <IconSymbol name="location.fill" size={24} color="#007AFF" />
            <View style={styles.locationTextContainer}>
              {locationLoading ? (
                <View style={styles.locationLoadingRow}>
                  <ActivityIndicator
                    size="small"
                    color="rgba(255,255,255,0.7)"
                  />
                  <ThemedText style={styles.locationText}>
                    Getting location...
                  </ThemedText>
                </View>
              ) : locationError ? (
                <ThemedText style={[styles.locationText, styles.locationError]}>
                  {locationError}
                </ThemedText>
              ) : (
                <ThemedText style={styles.locationText} numberOfLines={1}>
                  {locationAddress || "Store Location"}
                </ThemedText>
              )}
            </View>
            <TouchableOpacity
              onPress={getCurrentLocation}
              style={styles.refreshButton}
            >
              <IconSymbol
                name="arrow.clockwise"
                size={18}
                color="rgba(255,255,255,0.7)"
              />
            </TouchableOpacity>
          </View>

          {/* Store Location */}
          {/* Store Location */}
          <View style={styles.storeLocationContainer}>
            <View style={styles.storeLocationHeader}>
              <View style={styles.storeIconContainer}>
                <IconSymbol name="mappin.and.ellipse" size={24} color="#FFF" />
              </View>
              <View style={{ flex: 1, justifyContent: "center" }}>
                <ThemedText style={styles.storeLocationLabel}>
                  PICKUP STORE
                </ThemedText>
                <ThemedText style={styles.storeNameText} numberOfLines={1}>
                  Vaishnavi Sales
                </ThemedText>
              </View>
            </View>

            <View style={styles.storeActionsRow}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handlePhoneCall}
              >
                <IconSymbol name="phone.fill" size={16} color="#FFF" />
                <ThemedText style={styles.actionButtonText}>Call</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.primaryActionButton]}
                onPress={() => {
                  const url = Platform.select({
                    ios: `maps:0,0?q=${encodeURIComponent(STORE_LOCATION)}`,
                    android: `geo:0,0?q=${encodeURIComponent(STORE_LOCATION)}`,
                  });
                  Linking.openURL(url || "");
                }}
              >
                <IconSymbol name="map.fill" size={16} color="#FFF" />
                <ThemedText style={styles.actionButtonText}>
                  Directions
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.quickActions}>
            {CATEGORY_DATA.map((category) => (
              <TouchableOpacity
                key={category.name}
                style={styles.actionCard}
                onPress={() => handleCategoryPress(category.name)}
              >
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: category.color },
                  ]}
                >
                  <IconSymbol
                    name={category.icon as any}
                    size={24}
                    color="#FFF"
                  />
                </View>
                <ThemedText style={styles.actionLabel}>
                  {category.name}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sales Section */}
        {isAdmin && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText type="subtitle">Sales</ThemedText>
              <View style={styles.headerActions}>
                <TouchableOpacity
                  onPress={() => setIsModalVisible(true)}
                  style={styles.iconButton}
                >
                  <IconSymbol
                    name="plus.circle.fill"
                    size={20}
                    color="#007AFF"
                  />
                </TouchableOpacity>
                {sales.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setIsClearModalVisible(true)}
                    style={[styles.iconButton, { marginLeft: 12 }]}
                  >
                    <IconSymbol name="trash.fill" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            {sales.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.salesScroll}
              >
                {sales.map((sale) => (
                  <View key={sale.id} style={styles.salesCard}>
                    <View style={styles.salesImageContainer}>
                      <Image
                        source={sale.productImage}
                        style={styles.salesProductImage}
                        contentFit="contain"
                      />
                    </View>
                    <View style={styles.salesInfo}>
                      <ThemedText style={styles.salesCategory}>
                        {sale.productName} • {sale.size}
                      </ThemedText>
                      <ThemedText style={styles.salesAmount}>
                        {formatCurrency(sale.amount)}
                      </ThemedText>
                      <ThemedText style={styles.salesTimestamp}>
                        {formatDate(sale.date)} • {formatTime(sale.time)}
                      </ThemedText>
                    </View>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptySales}>
                <ThemedText style={styles.emptySalesText}>
                  No sales recorded.
                </ThemedText>
              </View>
            )}
          </View>
        )}

        {/* Featured Section */}
        {featuredProducts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText type="subtitle">Featured</ThemedText>
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
      </ScrollView>

      {/* Add Sale Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: "90%" }]}>
            <ThemedText type="subtitle" style={styles.modalTitle}>
              Add New Sales
            </ThemedText>

            <ScrollView showsVerticalScrollIndicator={false}>
              <ThemedText style={styles.inputLabel}>Select Product</ThemedText>
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
                      selectedProductId === product.id &&
                        styles.productPickerItemActive,
                    ]}
                    onPress={() => {
                      setSelectedProductId(product.id);
                      setSelectedSize(product.sizes[0]);
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
                        selectedProductId === product.id &&
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
                {selectedProduct.sizes.map((size) => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.pickerItem,
                      selectedSize === size && styles.pickerItemActive,
                    ]}
                    onPress={() => setSelectedSize(size)}
                  >
                    <ThemedText
                      style={[
                        styles.pickerText,
                        selectedSize === size && styles.pickerTextActive,
                      ]}
                    >
                      {size}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalInputRow}>
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.inputLabel}>Price</ThemedText>
                  <View style={styles.priceDisplay}>
                    <ThemedText style={styles.priceDisplayText}>
                      {formatCurrency(
                        selectedProduct.sizePrices?.[selectedSize] ||
                          selectedProduct.price
                      )}
                    </ThemedText>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.addToListButton}
                  onPress={handleAddToPendingSale}
                >
                  <IconSymbol name="plus" size={20} color="#FFF" />
                  <ThemedText style={styles.addToListText}>
                    Add to List
                  </ThemedText>
                </TouchableOpacity>
              </View>

              {pendingSales.length > 0 && (
                <View style={styles.pendingSection}>
                  <ThemedText style={styles.inputLabel}>
                    Pending Items ({pendingSales.length})
                  </ThemedText>
                  {pendingSales.map((item) => (
                    <View key={item.id} style={styles.pendingItem}>
                      <View style={styles.pendingItemInfo}>
                        <ThemedText
                          style={styles.pendingItemName}
                          numberOfLines={1}
                        >
                          {item.productName} • {item.size}
                        </ThemedText>
                        <ThemedText style={styles.pendingItemPrice}>
                          {formatCurrency(item.amount)}
                        </ThemedText>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleRemovePendingSale(item.id)}
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
                    value={newSaleDate}
                    onChangeText={setNewSaleDate}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <ThemedText style={styles.inputLabel}>Time</ThemedText>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="HH:MM"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={newSaleTime}
                    onChangeText={setNewSaleTime}
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setIsModalVisible(false);
                  setPendingSales([]);
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
                onPress={handleSaveAllSales}
              >
                <ThemedText style={styles.buttonText}>Save All</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Custom Clear Confirmation Modal (Sales) */}
      <Modal
        visible={isClearModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsClearModalVisible(false)}
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
              Clear All Sales?
            </ThemedText>

            <ThemedText style={styles.modalMessage}>
              This will permanently remove all sales recorded. This action
              cannot be undone.
            </ThemedText>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsClearModalVisible(false)}
              >
                <ThemedText style={styles.buttonText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleClearSales}
              >
                <ThemedText style={styles.buttonText}>Clear All</ThemedText>
              </TouchableOpacity>
            </View>
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
  dashboardHeader: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: "#1A1A1A",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },

  userName: {
    fontSize: 28,
    fontWeight: "bold",
  },
  logo: {
    width: 100,
    height: 30,
  },
  logoContainer: {
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 6,
    borderRadius: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    color: "#FFF",
    fontSize: 16,
  },
  locationTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  locationLoadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  locationText: {
    color: "#FFF",
    fontSize: 14,
    opacity: 0.9,
  },
  locationError: {
    opacity: 0.6,
    fontStyle: "italic",
  },
  refreshButton: {
    padding: 8,
    marginLeft: 8,
  },

  orderPickupLocation: {
    fontSize: 11,
    fontWeight: "600",
    opacity: 0.7,
    marginTop: 4,
    color: "#34C759",
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    rowGap: 16,
  },
  actionCard: {
    alignItems: "center",
    width: (width - 80) / 3,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  section: {
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
  featuredScroll: {
    gap: 16,
  },
  featuredItem: {
    width: width * 0.45,
  },
  salesScroll: {
    gap: 12,
  },
  salesCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    minWidth: 240,
  },
  salesImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: "#FFF",
    padding: 4,
    marginRight: 12,
  },
  salesProductImage: {
    width: "100%",
    height: "100%",
  },
  salesIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  salesInfo: {
    justifyContent: "center",
    flex: 1,
  },
  salesCategory: {
    fontSize: 10,
    fontWeight: "bold",
    opacity: 0.8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  salesAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  salesTimestamp: {
    fontSize: 10,
    fontWeight: "600",
    opacity: 0.6,
    marginTop: 2,
  },
  emptySales: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.02)",
    borderRadius: 16,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  emptySalesText: {
    opacity: 0.4,
    fontSize: 14,
  },
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
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    borderRadius: 12,
    marginLeft: 12,
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
  storeLocationContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
    backgroundColor: "#1C1C1E",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  storeLocationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  storeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  storeLocationLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
    fontWeight: "600",
    letterSpacing: 1,
    marginBottom: 4,
  },
  storeNameText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
  },
  storeActionsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  primaryActionButton: {
    backgroundColor: "#007AFF",
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFF",
  },
});

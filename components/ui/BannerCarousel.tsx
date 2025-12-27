import { Image } from "expo-image";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const CAROUSEL_WIDTH = width - 32; // Padding on both sides

const BANNERS = [
  {
    id: "1",
    image: require("@/assets/images/banner_new_arrival.png"),
    title: "New Arrival",
  },
  {
    id: "2",
    image: require("@/assets/images/banner_special_offer.png"),
    title: "Special Offer",
  },
  {
    id: "3",
    image: require("@/assets/images/banner_travel_lifestyle.png"),
    title: "Travel in Style",
  },
  {
    id: "4",
    image: require("@/assets/images/banner_business_travel.png"),
    title: "Business Class",
  },
  {
    id: "5",
    image: require("@/assets/images/banner_adventure_travel.png"),
    title: "Adventure Awaits",
  },
  {
    id: "6",
    image: require("@/assets/images/banner_summer_collection.png"),
    title: "Summer Collection",
  },
  {
    id: "7",
    image: require("@/assets/images/banner_premium_collection.png"),
    title: "Premium Collection",
  },
];

export function BannerCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Auto-scroll effect
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % BANNERS.length;

        // Scroll to next banner
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });

        return nextIndex;
      });
    }, 3000); // Auto-scroll every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / CAROUSEL_WIDTH);
    setActiveIndex(index);
  };

  const renderItem = ({ item }: { item: (typeof BANNERS)[0] }) => (
    <View style={styles.bannerContainer}>
      <Image
        source={item.image}
        style={styles.bannerImage}
        contentFit="cover"
        transition={1000}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={BANNERS}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyExtractor={(item) => item.id}
        snapToInterval={CAROUSEL_WIDTH + 16} // Width + gap
        decelerationRate="fast"
        contentContainerStyle={styles.listContent}
      />
      <View style={styles.pagination}>
        {BANNERS.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              activeIndex === index ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  listContent: {
    paddingHorizontal: 16,
    gap: 16,
  },
  bannerContainer: {
    width: CAROUSEL_WIDTH,
    height: 180,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    gap: 8,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    width: 20,
    backgroundColor: "#007AFF",
  },
  inactiveDot: {
    width: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
});

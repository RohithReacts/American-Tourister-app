// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolViewProps, SymbolWeight } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<string, ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = SymbolViewProps["name"] | keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING: IconMapping = {
  "house.fill": "home",
  "paperplane.fill": "send",
  compass: "explore",
  "cart.fill": "shopping-cart",
  magnifyingglass: "search",
  "person.fill": "person",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
  "suitcase.fill": "business-center",
  "backpack.fill": "backpack",
  "bag.fill": "local-mall",
  "plus.circle.fill": "add-circle",
  "trash.fill": "delete",
  trash: "delete-outline",
  "exclamationmark.triangle.fill": "warning",
  "location.fill": "location-on",
  "arrow.clockwise": "refresh",
  plus: "add",
  "phone.fill": "phone",
  globe: "public",
  "seal.fill": "verified",
  "checkmark.shield.fill": "verified-user",
  "star.fill": "star",
  "truck.fill": "local-shipping",
  "arrow.counterclockwise": "settings-backup-restore",
  "shield.fill": "security",
  "chevron.left": "chevron-left",
  "envelope.fill": "email",
  "lock.fill": "lock",
  "camera.fill": "photo-camera",
  "person.text.rectangle.fill": "badge",
  "calendar.badge.clock": "event",
  number: "tag",
  calendar: "event",
  pencil: "edit",
  "lock.shield.fill": "admin-panel-settings",
  "heart.fill": "favorite",
  heart: "favorite-border",
  "mappin.and.ellipse": "location-on",
  "creditcard.fill": "credit-card",
  "bell.fill": "notifications",
  "gearshape.fill": "settings",
  "person.2.circle.fill": "group",
  "person.badge.minus.fill": "person-remove",
  "xmark.circle.fill": "cancel",
  "checkmark.circle.fill": "check-circle",
  "figure.wave.fill": "face",
  "face.smiling.fill": "face",
  "figure.child": "child-care",
  "shippingbox.fill": "category",
  "cube.box.fill": "category",
  "map.fill": "map",
  "briefcase.fill": "work",
  "clock.fill": "access-time",
  "arrow.down.circle.fill": "cloud-download",
};

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  const iconName = MAPPING[name] || name;
  return (
    <MaterialIcons color={color} size={size} name={iconName} style={style} />
  );
}

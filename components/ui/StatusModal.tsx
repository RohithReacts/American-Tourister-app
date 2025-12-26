import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import React from "react";
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";

interface StatusModalProps {
  visible: boolean;
  type: "success" | "error" | "info";
  title?: string;
  message: string;
  onClose: () => void;
  buttonText?: string;
}

export function StatusModal({
  visible,
  type,
  title,
  message,
  onClose,
  buttonText = "Continue",
}: StatusModalProps) {
  const getIcon = () => {
    switch (type) {
      case "success":
        return { name: "checkmark.circle.fill", color: "#34C759" };
      case "error":
        return { name: "exclamationmark.circle.fill", color: "#FF3B30" };
      case "info":
        return { name: "info.circle.fill", color: "#007AFF" };
      default:
        return { name: "info.circle.fill", color: "#007AFF" };
    }
  };

  const icon = getIcon();
  const defaultTitle = type.charAt(0).toUpperCase() + type.slice(1);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <IconSymbol name={icon.name as any} size={64} color={icon.color} />
          </View>
          <ThemedText type="subtitle" style={styles.title}>
            {title || defaultTitle}
          </ThemedText>
          <ThemedText style={styles.message}>{message}</ThemedText>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: icon.color }]}
            onPress={onClose}
          >
            <ThemedText style={styles.buttonText}>{buttonText}</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#1A1A1A",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    marginBottom: 20,
    transform: [{ scale: 1.1 }],
  },
  title: {
    fontSize: 24,
    marginBottom: 8,
    color: "#FFF",
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.7,
    marginBottom: 32,
    lineHeight: 22,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

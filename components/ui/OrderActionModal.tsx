import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import React from "react";
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";

interface OrderActionModalProps {
  visible: boolean;
  onClose: () => void;
  onViewBill: () => void;
  onDownloadPdf: () => void;
  orderId?: string;
}

export function OrderActionModal({
  visible,
  onClose,
  onViewBill,
  onDownloadPdf,
  orderId,
}: OrderActionModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View
              style={{
                backgroundColor: "rgba(0, 122, 255, 0.1)",
                width: 48,
                height: 48,
                borderRadius: 24,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <IconSymbol name="suitcase.fill" size={24} color="#007AFF" />
            </View>
            <ThemedText type="subtitle" style={styles.title}>
              Order Actions
            </ThemedText>
            {orderId && (
              <ThemedText style={styles.orderId}>#{orderId}</ThemedText>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={onViewBill}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: "rgba(0, 122, 255, 0.1)" },
                ]}
              >
                <IconSymbol
                  name="doc.text.magnifyingglass"
                  size={24}
                  color="#007AFF"
                />
              </View>
              <View style={styles.buttonTextContainer}>
                <ThemedText style={styles.buttonTitle}>View Bill</ThemedText>
                <ThemedText style={styles.buttonSubtitle}>
                  Preview invoice in app
                </ThemedText>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={onDownloadPdf}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: "rgba(52, 199, 89, 0.1)" },
                ]}
              >
                <IconSymbol
                  name="arrow.down.doc.fill"
                  size={24}
                  color="#34C759"
                />
              </View>
              <View style={styles.buttonTextContainer}>
                <ThemedText style={styles.buttonTitle}>Download PDF</ThemedText>
                <ThemedText style={styles.buttonSubtitle}>
                  Save invoice to device
                </ThemedText>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <IconSymbol name="xmark.circle.fill" size={18} color="#FF3B30" />
              <ThemedText style={styles.cancelText}>Cancel</ThemedText>
            </View>
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
    maxWidth: 340,
    backgroundColor: "#1A1A1A",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    color: "#FFF",
    marginBottom: 4,
  },
  orderId: {
    fontSize: 14,
    opacity: 0.5,
    fontFamily: "monospace",
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  buttonTextContainer: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
  },
  buttonSubtitle: {
    fontSize: 12,
    opacity: 0.5,
    marginTop: 2,
  },
  cancelButton: {
    width: "100%",
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelText: {
    color: "#FF3B30",
    fontSize: 16,
    fontWeight: "600",
  },
});

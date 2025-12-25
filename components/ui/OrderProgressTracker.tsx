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

interface OrderProgressTrackerProps {
  status?: OrderStatus;
}

interface Stage {
  icon: string;
  label: string;
  color: string;
}

export function OrderProgressTracker({
  status = "pending",
}: OrderProgressTrackerProps) {
  const stages: Stage[] = [
    { icon: "cart.fill", label: "Ordered", color: "#007AFF" },
    { icon: "clock.fill", label: "Preparing", color: "#FF9F0A" },
    { icon: "checkmark.circle.fill", label: "Ready", color: "#34C759" },
    { icon: "bag.fill", label: "Picked Up", color: "#34C759" },
  ];

  // Handle "no_stock" status differently
  if (status === "no_stock") {
    return (
      <View style={styles.container}>
        <View style={styles.noStockContainer}>
          <IconSymbol
            name="exclamationmark.triangle.fill"
            size={20}
            color="#FF9500"
          />
          <ThemedText style={styles.noStockText}>
            Item Currently Unavailable
          </ThemedText>
        </View>
      </View>
    );
  }

  // Determine current stage based on status
  const getCurrentStage = (): number => {
    switch (status) {
      case "pending":
        return 0;
      case "preparing":
        return 1;
      case "ready":
        return 2;
      case "picked_up":
      case "confirmed":
        return 3;
      default:
        return 0;
    }
  };

  const currentStage = getCurrentStage();

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        {stages.map((stage, index) => {
          const isActive = index === currentStage;
          const isCompleted = index < currentStage;
          const isFuture = index > currentStage;

          return (
            <React.Fragment key={index}>
              {/* Stage Circle */}
              <View style={styles.stageWrapper}>
                <View
                  style={[
                    styles.stageCircle,
                    isCompleted && styles.stageCircleCompleted,
                    isActive && [
                      styles.stageCircleActive,
                      { backgroundColor: stage.color },
                    ],
                    isFuture && styles.stageCircleFuture,
                  ]}
                >
                  <IconSymbol
                    name={stage.icon}
                    size={14}
                    color={
                      isCompleted || isActive ? "#FFF" : "rgba(255,255,255,0.3)"
                    }
                  />
                </View>
                <ThemedText
                  style={[
                    styles.stageLabel,
                    (isActive || isCompleted) && styles.stageLabelActive,
                  ]}
                >
                  {stage.label}
                </ThemedText>
              </View>

              {/* Connecting Line */}
              {index < stages.length - 1 && (
                <View
                  style={[
                    styles.connector,
                    index < currentStage && styles.connectorCompleted,
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stageWrapper: {
    alignItems: "center",
    flex: 1,
  },
  stageCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.15)",
  },
  stageCircleActive: {
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    transform: [{ scale: 1.1 }],
  },
  stageCircleCompleted: {
    backgroundColor: "#34C759",
    borderColor: "#34C759",
  },
  stageCircleFuture: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderColor: "rgba(255,255,255,0.08)",
  },
  stageLabel: {
    fontSize: 11,
    marginTop: 6,
    opacity: 0.4,
    textAlign: "center",
    fontWeight: "500",
  },
  stageLabelActive: {
    opacity: 0.9,
    fontWeight: "700",
    fontSize: 12,
  },
  connector: {
    height: 3,
    flex: 0.5,
    backgroundColor: "rgba(255,255,255,0.12)",
    marginHorizontal: -8,
    marginBottom: 20,
    borderRadius: 2,
  },
  connectorCompleted: {
    backgroundColor: "#34C759",
  },
  noStockContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    backgroundColor: "rgba(255, 149, 0, 0.12)",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "rgba(255, 149, 0, 0.25)",
    gap: 10,
  },
  noStockText: {
    fontSize: 13,
    color: "#FF9500",
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});

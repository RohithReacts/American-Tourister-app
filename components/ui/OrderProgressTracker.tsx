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
                    size={12}
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
    paddingVertical: 12,
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
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.1)",
  },
  stageCircleActive: {
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  stageCircleCompleted: {
    backgroundColor: "#34C759",
    borderColor: "#34C759",
  },
  stageCircleFuture: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.1)",
  },
  stageLabel: {
    fontSize: 10,
    marginTop: 4,
    opacity: 0.4,
    textAlign: "center",
  },
  stageLabelActive: {
    opacity: 0.8,
    fontWeight: "600",
  },
  connector: {
    height: 2,
    flex: 0.5,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginHorizontal: -8,
    marginBottom: 16,
  },
  connectorCompleted: {
    backgroundColor: "#34C759",
  },
  noStockContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    backgroundColor: "rgba(255, 149, 0, 0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 149, 0, 0.2)",
    gap: 8,
  },
  noStockText: {
    fontSize: 12,
    color: "#FF9500",
    fontWeight: "600",
  },
});

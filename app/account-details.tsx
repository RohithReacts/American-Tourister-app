import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAuth } from "@/context/AuthContext";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1000&auto=format&fit=crop";

export default function AccountDetailsScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [avatar, setAvatar] = useState(user?.avatar || DEFAULT_AVATAR);
  const [isSaving, setIsSaving] = useState(false);

  const handlePickImage = async () => {
    if (!isEditing) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name || !email) {
      Alert.alert("Error", "Name and Email cannot be empty");
      return;
    }

    setIsSaving(true);
    const result = await updateUser({ name, email, avatar });
    setIsSaving(false);

    if (result.success) {
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully");
    } else {
      Alert.alert("Error", result.message || "Failed to update profile");
    }
  };

  const accountInfo = [
    { label: "Full Name", value: name, icon: "person.fill", key: "name" },
    {
      label: "Email Address",
      value: email,
      icon: "envelope.fill",
      key: "email",
    },
    {
      label: "Account ID",
      value: user?.id || "N/A",
      icon: "number",
      readonly: true,
    },
    {
      label: "Member Since",
      value: new Date(
        parseInt(user?.id || Date.now().toString())
      ).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      icon: "calendar",
      readonly: true,
    },
  ];

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <IconSymbol name="chevron.left" size={24} color="#FFF" />
            </TouchableOpacity>
            <ThemedText type="title" style={styles.title}>
              Account Details
            </ThemedText>
            {isEditing && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setIsEditing(false);
                  setName(user?.name || "");
                  setEmail(user?.email || "");
                  setAvatar(user?.avatar || DEFAULT_AVATAR);
                }}
              >
                <ThemedText style={styles.cancelText}>Cancel</ThemedText>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.profileSection}>
            <TouchableOpacity
              activeOpacity={isEditing ? 0.7 : 1}
              onPress={handlePickImage}
              style={styles.avatarContainer}
            >
              <Image source={{ uri: avatar }} style={styles.avatar} />
              {isEditing && (
                <View style={styles.editBadge}>
                  <IconSymbol name="camera.fill" size={16} color="#FFF" />
                </View>
              )}
            </TouchableOpacity>
            {!isEditing && (
              <>
                <ThemedText type="subtitle" style={styles.userName}>
                  {user?.name}
                </ThemedText>
                <ThemedText style={styles.userEmail}>{user?.email}</ThemedText>
              </>
            )}
          </View>

          <View style={styles.infoSection}>
            {accountInfo.map((info, index) => (
              <View key={index} style={styles.infoCard}>
                <View style={styles.infoIconContainer}>
                  <IconSymbol
                    name={info.icon as any}
                    size={20}
                    color="#007AFF"
                  />
                </View>
                <View style={styles.infoTextContainer}>
                  <ThemedText style={styles.infoLabel}>{info.label}</ThemedText>
                  {isEditing && !info.readonly ? (
                    <TextInput
                      style={styles.input}
                      value={info.key === "name" ? name : email}
                      onChangeText={info.key === "name" ? setName : setEmail}
                      placeholder={`Enter ${info.label.toLowerCase()}`}
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      autoCapitalize={info.key === "email" ? "none" : "words"}
                      keyboardType={
                        info.key === "email" ? "email-address" : "default"
                      }
                    />
                  ) : (
                    <ThemedText style={styles.infoValue}>
                      {info.value}
                    </ThemedText>
                  )}
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.actionButton, isEditing && styles.saveButton]}
            onPress={isEditing ? handleSave : () => setIsEditing(true)}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <ThemedText style={styles.actionButtonText}>
                {isEditing ? "Save Changes" : "Edit Profile"}
              </ThemedText>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    flex: 1,
  },
  cancelButton: {
    padding: 8,
  },
  cancelText: {
    color: "#FF3B30",
    fontWeight: "600",
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  avatarContainer: {
    marginBottom: 16,
    position: "relative",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#007AFF",
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#007AFF",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#151718",
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    opacity: 0.6,
  },
  infoSection: {
    gap: 16,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  infoIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    opacity: 0.5,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  input: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    padding: 0,
  },
  actionButton: {
    backgroundColor: "rgba(255,255,255,0.1)",
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  saveButton: {
    backgroundColor: "#007AFF",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  actionButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});

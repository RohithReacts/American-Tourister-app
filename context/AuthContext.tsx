import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  createdAt?: number;
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message?: string }>;
  signup: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  toggleAdmin: () => void;
  forgotPassword: (
    email: string
  ) => Promise<{ success: boolean; message?: string }>;
  resetPassword: (
    email: string,
    newPassword: string
  ) => Promise<{ success: boolean; message?: string }>;
  updateUser: (
    updates: Partial<User>
  ) => Promise<{ success: boolean; message?: string }>;
  getAllUsers: () => Promise<User[]>;
  deleteUser: (
    userId: string
  ) => Promise<{ success: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_STORAGE_KEY = "@users_list";
const CURRENT_USER_KEY = "@current_user";
const ADMIN_STORAGE_KEY = "@is_admin";
const ADMIN_PROFILE_KEY = "@admin_profile";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const [storedUser, storedAdmin] = await Promise.all([
          AsyncStorage.getItem(CURRENT_USER_KEY),
          AsyncStorage.getItem(ADMIN_STORAGE_KEY),
        ]);

        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        if (storedAdmin) {
          setIsAdmin(JSON.parse(storedAdmin));
        }
      } catch (error) {
        console.error("Failed to load session", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Check for default admin
      if (
        email.toLowerCase() === "admin@americantourister.com" &&
        password === "admin123"
      ) {
        // Check if there's a stored admin profile
        const storedAdminProfile = await AsyncStorage.getItem(
          ADMIN_PROFILE_KEY
        );
        const adminUser: User = storedAdminProfile
          ? JSON.parse(storedAdminProfile)
          : {
              id: "admin",
              name: "Admin",
              email: "admin@americantourister.com",
              createdAt: 1734950400000, // Fixed date for admin: Dec 23, 2024
            };

        setUser(adminUser);
        setIsAdmin(true);
        await Promise.all([
          AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(adminUser)),
          AsyncStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(true)),
        ]);
        return { success: true };
      }

      const storedUsers = await AsyncStorage.getItem(USERS_STORAGE_KEY);
      const users: User[] = storedUsers ? JSON.parse(storedUsers) : [];

      const foundUser = users.find(
        (u) =>
          u.email.toLowerCase() === email.toLowerCase() &&
          u.password === password
      );

      if (foundUser) {
        const { password: _, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        await AsyncStorage.setItem(
          CURRENT_USER_KEY,
          JSON.stringify(userWithoutPassword)
        );
        return { success: true };
      }

      return { success: false, message: "Invalid email or password" };
    } catch (error) {
      return { success: false, message: "An error occurred during login" };
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      const storedUsers = await AsyncStorage.getItem(USERS_STORAGE_KEY);
      const users: User[] = storedUsers ? JSON.parse(storedUsers) : [];

      if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        return { success: false, message: "Email already exists" };
      }

      const newUser: User = {
        id: Date.now().toString(),
        name,
        email,
        password,
        createdAt: Date.now(),
      };
      const updatedUsers = [...users, newUser];

      await AsyncStorage.setItem(
        USERS_STORAGE_KEY,
        JSON.stringify(updatedUsers)
      );

      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      await AsyncStorage.setItem(
        CURRENT_USER_KEY,
        JSON.stringify(userWithoutPassword)
      );

      return { success: true };
    } catch (error) {
      return { success: false, message: "An error occurred during signup" };
    }
  };

  const logout = async () => {
    setUser(null);
    setIsAdmin(false);
    await Promise.all([
      AsyncStorage.removeItem(CURRENT_USER_KEY),
      AsyncStorage.removeItem(ADMIN_STORAGE_KEY),
    ]);
  };

  const toggleAdmin = async () => {
    if (user?.email !== "admin@americantourister.com") return;

    try {
      const newAdminStatus = !isAdmin;
      setIsAdmin(newAdminStatus);
      await AsyncStorage.setItem(
        ADMIN_STORAGE_KEY,
        JSON.stringify(newAdminStatus)
      );
    } catch (error) {
      console.error("Failed to save admin status", error);
    }
  };

  const forgotPassword = async (email: string) => {
    // Simulated forgot password logic
    const storedUsers = await AsyncStorage.getItem(USERS_STORAGE_KEY);
    const users: User[] = storedUsers ? JSON.parse(storedUsers) : [];

    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: true, message: "Reset link sent to your email" };
    }
    return { success: false, message: "Email not found" };
  };

  const resetPassword = async (email: string, newPassword: string) => {
    try {
      const storedUsers = await AsyncStorage.getItem(USERS_STORAGE_KEY);
      const users: User[] = storedUsers ? JSON.parse(storedUsers) : [];

      const userIndex = users.findIndex(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );
      if (userIndex !== -1) {
        users[userIndex].password = newPassword;
        await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        return { success: true };
      }
      return { success: false, message: "User not found" };
    } catch (error) {
      return { success: false, message: "An error occurred" };
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    try {
      if (!user) return { success: false, message: "No user logged in" };

      // Special handling for default admin
      if (user.id === "admin") {
        const updatedAdmin = { ...user, ...updates };
        setUser(updatedAdmin);
        await Promise.all([
          AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedAdmin)),
          AsyncStorage.setItem(ADMIN_PROFILE_KEY, JSON.stringify(updatedAdmin)),
        ]);
        return { success: true };
      }

      const storedUsers = await AsyncStorage.getItem(USERS_STORAGE_KEY);
      const users: User[] = storedUsers ? JSON.parse(storedUsers) : [];

      const userIndex = users.findIndex((u) => u.id === user.id);
      if (userIndex === -1)
        return { success: false, message: "User not found" };

      // Update in users list
      const updatedUser = { ...users[userIndex], ...updates };
      users[userIndex] = updatedUser;
      await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

      // Update current user session
      const { password: _, ...userWithoutPassword } = updatedUser;
      setUser(userWithoutPassword);
      await AsyncStorage.setItem(
        CURRENT_USER_KEY,
        JSON.stringify(userWithoutPassword)
      );

      return { success: true };
    } catch (error) {
      return { success: false, message: "Failed to update user" };
    }
  };

  const getAllUsers = async (): Promise<User[]> => {
    try {
      const storedUsers = await AsyncStorage.getItem(USERS_STORAGE_KEY);
      return storedUsers ? JSON.parse(storedUsers) : [];
    } catch (error) {
      console.error("Failed to fetch users", error);
      return [];
    }
  };

  const deleteUser = async (
    userId: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const storedUsers = await AsyncStorage.getItem(USERS_STORAGE_KEY);
      const users: User[] = storedUsers ? JSON.parse(storedUsers) : [];

      const updatedUsers = users.filter((u) => u.id !== userId);
      await AsyncStorage.setItem(
        USERS_STORAGE_KEY,
        JSON.stringify(updatedUsers)
      );

      return { success: true };
    } catch (error) {
      return { success: false, message: "Failed to delete user" };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isLoading,
        login,
        signup,
        logout,
        toggleAdmin,
        forgotPassword,
        resetPassword,
        updateUser,
        getAllUsers,
        deleteUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

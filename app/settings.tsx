import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { supabase } from "../lib/supabase";
import { theme } from "../lib/theme";
import { useTheme } from "../lib/ThemeContext";

export default function SettingsScreen() {
  const { colors, isDark, toggleDark } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingUsername, setSavingUsername] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setNewEmail(user?.email || "");
      const { data } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user?.id)
        .single();
      if (data) {
        setUsername(data.username);
        setNewUsername(data.username);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUser();
    }, []),
  );

  const saveUsername = async () => {
    if (!newUsername || newUsername.length < 3) {
      Alert.alert("Username must be at least 3 characters");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(newUsername)) {
      Alert.alert("Username can only contain letters, numbers and underscores");
      return;
    }
    if (newUsername === username) {
      Alert.alert("That is already your username");
      return;
    }
    setSavingUsername(true);
    try {
      const { data: existing } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", newUsername.toLowerCase())
        .single();
      if (existing) {
        Alert.alert("Username taken", "Please choose a different username");
        return;
      }
      const { error } = await supabase
        .from("profiles")
        .update({ username: newUsername.toLowerCase() })
        .eq("id", user.id);
      if (error) throw error;
      setUsername(newUsername.toLowerCase());
      Alert.alert("Success", "Username updated!");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setSavingUsername(false);
    }
  };

  const saveEmail = async () => {
    if (!newEmail || !newEmail.includes("@")) {
      Alert.alert("Please enter a valid email");
      return;
    }
    if (newEmail === user?.email) {
      Alert.alert("That is already your email");
      return;
    }
    setSavingEmail(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      await supabase
        .from("profiles")
        .update({ email: newEmail.toLowerCase() })
        .eq("id", user.id);
      Alert.alert("Success", "Check your new email for a confirmation link.");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setSavingEmail(false);
    }
  };

  const savePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      Alert.alert("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Passwords do not match");
      return;
    }
    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      Alert.alert("Success", "Password updated!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setSavingPassword(false);
    }
  };

  const deleteAccount = async () => {
    Alert.alert(
      "Delete account",
      "This will permanently delete your account and all your data. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete forever",
          style: "destructive",
          onPress: async () => {
            try {
              await supabase.from("user_books").delete().eq("user_id", user.id);
              await supabase.from("profiles").delete().eq("id", user.id);
              await supabase.auth.signOut();
            } catch (error: any) {
              Alert.alert("Error", error.message);
            }
          },
        },
      ],
    );
  };

  const handleSignOut = async () => {
    Alert.alert("Sign out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          await supabase.auth.signOut();
        },
      },
    ]);
  };

  if (loading)
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
        <Text
          style={{
            fontSize: 13,
            color: colors.textMuted,
            marginBottom: 8,
            fontFamily: theme.fonts.semibold,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          Appearance
        </Text>
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 14,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 15,
                color: colors.text,
                fontFamily: theme.fonts.semibold,
              }}
            >
              Dark mode
            </Text>
            <Switch
              value={isDark}
              onValueChange={toggleDark}
              trackColor={{ true: colors.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>
      </View>

      <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
        <Text
          style={{
            fontSize: 13,
            color: colors.textMuted,
            marginBottom: 8,
            fontFamily: theme.fonts.semibold,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          Change username
        </Text>
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 14,
            gap: 10,
          }}
        >
          <Text
            style={{
              fontSize: 13,
              color: colors.textMuted,
              fontFamily: theme.fonts.regular,
            }}
          >
            Current: @{username}
          </Text>
          <TextInput
            style={{
              backgroundColor: colors.input,
              borderRadius: 10,
              paddingHorizontal: 14,
              paddingVertical: 11,
              fontSize: 15,
              color: colors.text,
              fontFamily: theme.fonts.regular,
            }}
            value={newUsername}
            onChangeText={setNewUsername}
            autoCapitalize="none"
            placeholder="New username"
            placeholderTextColor={colors.textMuted}
          />
          <TouchableOpacity
            style={{
              backgroundColor: colors.primary,
              borderRadius: 10,
              paddingVertical: 12,
              alignItems: "center",
              opacity: savingUsername ? 0.6 : 1,
            }}
            onPress={saveUsername}
            disabled={savingUsername}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 14,
                fontFamily: theme.fonts.bold,
              }}
            >
              {savingUsername ? "Saving..." : "Save username"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
        <Text
          style={{
            fontSize: 13,
            color: colors.textMuted,
            marginBottom: 8,
            fontFamily: theme.fonts.semibold,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          Change email
        </Text>
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 14,
            gap: 10,
          }}
        >
          <Text
            style={{
              fontSize: 13,
              color: colors.textMuted,
              fontFamily: theme.fonts.regular,
            }}
          >
            Current: {user?.email}
          </Text>
          <TextInput
            style={{
              backgroundColor: colors.input,
              borderRadius: 10,
              paddingHorizontal: 14,
              paddingVertical: 11,
              fontSize: 15,
              color: colors.text,
              fontFamily: theme.fonts.regular,
            }}
            value={newEmail}
            onChangeText={setNewEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="New email"
            placeholderTextColor={colors.textMuted}
          />
          <TouchableOpacity
            style={{
              backgroundColor: colors.primary,
              borderRadius: 10,
              paddingVertical: 12,
              alignItems: "center",
              opacity: savingEmail ? 0.6 : 1,
            }}
            onPress={saveEmail}
            disabled={savingEmail}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 14,
                fontFamily: theme.fonts.bold,
              }}
            >
              {savingEmail ? "Saving..." : "Save email"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
        <Text
          style={{
            fontSize: 13,
            color: colors.textMuted,
            marginBottom: 8,
            fontFamily: theme.fonts.semibold,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          Change password
        </Text>
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 14,
            gap: 10,
          }}
        >
          <TextInput
            style={{
              backgroundColor: colors.input,
              borderRadius: 10,
              paddingHorizontal: 14,
              paddingVertical: 11,
              fontSize: 15,
              color: colors.text,
              fontFamily: theme.fonts.regular,
            }}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            placeholder="New password"
            placeholderTextColor={colors.textMuted}
          />
          <TextInput
            style={{
              backgroundColor: colors.input,
              borderRadius: 10,
              paddingHorizontal: 14,
              paddingVertical: 11,
              fontSize: 15,
              color: colors.text,
              fontFamily: theme.fonts.regular,
            }}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholder="Confirm new password"
            placeholderTextColor={colors.textMuted}
          />
          <TouchableOpacity
            style={{
              backgroundColor: colors.primary,
              borderRadius: 10,
              paddingVertical: 12,
              alignItems: "center",
              opacity: savingPassword ? 0.6 : 1,
            }}
            onPress={savePassword}
            disabled={savingPassword}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 14,
                fontFamily: theme.fonts.bold,
              }}
            >
              {savingPassword ? "Saving..." : "Save password"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ paddingHorizontal: 16, marginTop: 24, marginBottom: 40 }}>
        <Text
          style={{
            fontSize: 13,
            color: colors.textMuted,
            marginBottom: 8,
            fontFamily: theme.fonts.semibold,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          Account
        </Text>
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            overflow: "hidden",
          }}
        >
          <TouchableOpacity style={{ padding: 16 }} onPress={handleSignOut}>
            <Text
              style={{
                fontSize: 15,
                color: colors.danger,
                fontFamily: theme.fonts.semibold,
              }}
            >
              Sign out
            </Text>
          </TouchableOpacity>
          <View style={{ height: 1, backgroundColor: colors.border }} />
          <TouchableOpacity style={{ padding: 16 }} onPress={deleteAccount}>
            <Text
              style={{
                fontSize: 15,
                color: colors.danger,
                fontFamily: theme.fonts.semibold,
              }}
            >
              Delete account
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({});

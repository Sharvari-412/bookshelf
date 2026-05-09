import { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { supabase } from "../lib/supabase";
import { theme } from "../lib/theme";
import { useTheme } from "../lib/ThemeContext";

export default function Auth() {
  const { colors } = useTheme();

  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleAuth = async () => {
    if (isSignUp) {
      if (!email || !password || !username) {
        Alert.alert("Please fill in all fields");
        return;
      }

      if (username.length < 3) {
        Alert.alert("Username must be at least 3 characters");
        return;
      }

      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        Alert.alert(
          "Username can only contain letters, numbers and underscores",
        );
        return;
      }
    } else {
      if (!emailOrUsername || !password) {
        Alert.alert("Please fill in all fields");
        return;
      }
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { data: existingUsername } = await supabase
          .from("profiles")
          .select("username")
          .eq("username", username.toLowerCase())
          .single();

        if (existingUsername) {
          Alert.alert("Username taken", "Please choose a different username");
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          const { error: profileError } = await supabase
            .from("profiles")
            .insert({
              id: data.user.id,
              username: username.toLowerCase(),
              email: email.toLowerCase(),
            });

          if (profileError) throw profileError;
        }

        Alert.alert("Account created!", "You can now sign in.");
        setIsSignUp(false);
      } else {
        let loginEmail = emailOrUsername;

        if (!emailOrUsername.includes("@")) {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("email")
            .eq("username", emailOrUsername.toLowerCase())
            .single();

          if (profileError || !profile) {
            Alert.alert(
              "User not found",
              "No account found with that username",
            );

            setLoading(false);
            return;
          }

          loginEmail = profile.email;
        }

        const { error } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password,
        });

        if (error) throw error;
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.inner}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.logo, { color: colors.primary }]}>Bookshelf</Text>

        <Text style={[styles.tagline, { color: colors.textMuted }]}>
          Your personal reading tracker
        </Text>

        <View style={styles.form}>
          {isSignUp && (
            <>
              <Text style={[styles.label, { color: colors.text }]}>
                Username
              </Text>

              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.input,
                    color: colors.text,
                  },
                ]}
                placeholder="e.g. booklover42"
                placeholderTextColor="#aaa"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />

              <Text style={[styles.label, { color: colors.text }]}>Email</Text>

              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.input,
                    color: colors.text,
                  },
                ]}
                placeholder="you@example.com"
                placeholderTextColor="#aaa"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </>
          )}

          {!isSignUp && (
            <>
              <Text style={[styles.label, { color: colors.text }]}>
                Email or Username
              </Text>

              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.input,
                    color: colors.text,
                  },
                ]}
                placeholder="Email or username"
                placeholderTextColor="#aaa"
                value={emailOrUsername}
                onChangeText={setEmailOrUsername}
                autoCapitalize="none"
              />
            </>
          )}

          <Text style={[styles.label, { color: colors.text }]}>Password</Text>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.input,
                color: colors.text,
              },
            ]}
            placeholder="••••••••"
            placeholderTextColor="#aaa"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.rememberRow}
            onPress={() => setRememberMe(!rememberMe)}
          >
            <View
              style={[
                styles.checkbox,
                { borderColor: colors.primary },
                rememberMe && {
                  backgroundColor: colors.primary,
                },
              ]}
            >
              {rememberMe && <Text style={styles.checkmark}>✓</Text>}
            </View>

            <Text style={[styles.rememberText, { color: colors.text }]}>
              Remember me
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: colors.primary },
              loading && styles.buttonDisabled,
            ]}
            onPress={handleAuth}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading
                ? "Please wait..."
                : isSignUp
                  ? "Create account"
                  : "Sign in"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
            <Text style={[styles.switchText, { color: colors.primary }]}>
              {isSignUp
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  inner: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingVertical: 40,
  },

  logo: {
    fontSize: 36,
    textAlign: "center",
    marginBottom: 8,
    fontFamily: theme.fonts.bold,
  },

  tagline: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 48,
    fontFamily: theme.fonts.regular,
  },

  form: {
    gap: 4,
  },

  label: {
    fontSize: 14,
    marginBottom: 4,
    fontFamily: theme.fonts.semibold,
  },

  input: {
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 12,
    fontFamily: theme.fonts.regular,
  },

  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },

  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },

  checkmark: {
    color: "#fff",
    fontSize: 13,
    fontFamily: theme.fonts.bold,
  },

  rememberText: {
    fontSize: 14,
    fontFamily: theme.fonts.regular,
  },

  button: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: theme.fonts.bold,
  },

  switchText: {
    textAlign: "center",
    fontSize: 14,
    marginTop: 16,
    fontFamily: theme.fonts.semibold,
  },
});

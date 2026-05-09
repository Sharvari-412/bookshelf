import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
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

export default function BookDetailScreen() {
  const params = useLocalSearchParams();
  const id = params.id as string;
  const router = useRouter();
  const { colors } = useTheme();
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (id) fetchBook();
  }, [id]);

  const fetchBook = async () => {
    try {
      const { data, error } = await supabase
        .from("user_books")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      setBook(data);
      setRating(data.rating || 0);
      setReview(data.review || "");
      setStatus(data.status || "");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const saveChanges = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("user_books")
        .update({ rating, review, status })
        .eq("id", id);
      if (error) throw error;
      Alert.alert("Saved!", "Your changes have been saved.");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteBook = async () => {
    Alert.alert("Remove book", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            const { error } = await supabase
              .from("user_books")
              .delete()
              .eq("id", id);
            if (error) throw error;
            router.back();
          } catch (error: any) {
            Alert.alert("Error", error.message);
          }
        },
      },
    ]);
  };

  const STATUS_OPTIONS = [
    { label: "Reading", value: "reading", color: colors.warning },
    { label: "Want to Read", value: "want_to_read", color: colors.primary },
    { label: "Finished", value: "read", color: colors.success },
    { label: "DNF", value: "dnf", color: colors.danger },
  ];

  if (loading || !book)
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
      <View
        style={{
          backgroundColor: colors.card,
          padding: 20,
          flexDirection: "row",
          gap: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        {book.cover_url ? (
          <Image
            source={{ uri: book.cover_url }}
            style={{ width: 80, height: 120, borderRadius: 8 }}
          />
        ) : (
          <View
            style={{
              width: 80,
              height: 120,
              borderRadius: 8,
              backgroundColor: colors.input,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 32 }}>📖</Text>
          </View>
        )}
        <View style={{ flex: 1, justifyContent: "center", gap: 6 }}>
          <Text
            style={{
              fontSize: 18,
              color: colors.text,
              fontFamily: theme.fonts.bold,
            }}
          >
            {book.title}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: colors.textSecondary,
              fontFamily: theme.fonts.regular,
            }}
          >
            {book.author}
          </Text>
          {book.year ? (
            <Text
              style={{
                fontSize: 13,
                color: colors.textMuted,
                fontFamily: theme.fonts.regular,
              }}
            >
              {book.year}
            </Text>
          ) : null}
        </View>
      </View>

      <View
        style={{
          backgroundColor: colors.card,
          padding: 16,
          marginTop: 12,
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            color: colors.text,
            marginBottom: 12,
            fontFamily: theme.fonts.bold,
          }}
        >
          Status
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {STATUS_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: status === opt.value ? opt.color : colors.border,
                backgroundColor:
                  status === opt.value ? opt.color : colors.background,
              }}
              onPress={() => setStatus(opt.value)}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: theme.fonts.semibold,
                  color: status === opt.value ? "#fff" : colors.textSecondary,
                }}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View
        style={{
          backgroundColor: colors.card,
          padding: 16,
          marginTop: 12,
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            color: colors.text,
            marginBottom: 12,
            fontFamily: theme.fonts.bold,
          }}
        >
          Your rating
        </Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setRating(star)}>
              <Ionicons
                name={star <= rating ? "star" : "star-outline"}
                size={36}
                color={star <= rating ? colors.warning : colors.border}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View
        style={{
          backgroundColor: colors.card,
          padding: 16,
          marginTop: 12,
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            color: colors.text,
            marginBottom: 12,
            fontFamily: theme.fonts.bold,
          }}
        >
          Your review
        </Text>
        <TextInput
          style={{
            backgroundColor: colors.input,
            borderRadius: 10,
            padding: 14,
            fontSize: 15,
            color: colors.text,
            minHeight: 120,
            fontFamily: theme.fonts.regular,
          }}
          placeholder="Write your thoughts..."
          placeholderTextColor={colors.textMuted}
          value={review}
          onChangeText={setReview}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />
      </View>

      <View style={{ padding: 16, gap: 10, marginBottom: 32 }}>
        <TouchableOpacity
          style={{
            backgroundColor: colors.primary,
            borderRadius: 10,
            paddingVertical: 14,
            alignItems: "center",
            opacity: saving ? 0.6 : 1,
          }}
          onPress={saveChanges}
          disabled={saving}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 16,
              fontFamily: theme.fonts.bold,
            }}
          >
            {saving ? "Saving..." : "Save changes"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            backgroundColor: colors.card,
            borderRadius: 10,
            paddingVertical: 14,
            alignItems: "center",
            borderWidth: 1,
            borderColor: colors.danger,
          }}
          onPress={deleteBook}
        >
          <Text
            style={{
              color: colors.danger,
              fontSize: 16,
              fontFamily: theme.fonts.semibold,
            }}
          >
            Remove from library
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({});

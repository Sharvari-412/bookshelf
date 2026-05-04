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

export default function BookDetailScreen() {
  const params = useLocalSearchParams();
  const id = params.id as string;
  const router = useRouter();
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
    Alert.alert("Remove book", "Are you sure you want to remove this book?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          await supabase.from("user_books").delete().eq("id", id);
          router.back();
        },
      },
    ]);
  };

  const STATUS_OPTIONS = [
    { label: "Reading", value: "reading", color: "#F59E0B" },
    { label: "Want to Read", value: "want_to_read", color: "#6B4EFF" },
    { label: "Finished", value: "read", color: "#10B981" },
    { label: "DNF", value: "dnf", color: "#EF4444" },
  ];

  if (loading || !book) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6B4EFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        {book.cover_url ? (
          <Image source={{ uri: book.cover_url }} style={styles.cover} />
        ) : (
          <View style={styles.noCover}>
            <Text style={styles.noCoverText}>📖</Text>
          </View>
        )}
        <View style={styles.headerInfo}>
          <Text style={styles.title}>{book.title}</Text>
          <Text style={styles.author}>{book.author}</Text>
          {book.year ? <Text style={styles.year}>{book.year}</Text> : null}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status</Text>
        <View style={styles.statusOptions}>
          {STATUS_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.statusBtn,
                status === opt.value && { backgroundColor: opt.color },
              ]}
              onPress={() => setStatus(opt.value)}
            >
              <Text
                style={[
                  styles.statusBtnText,
                  status === opt.value && { color: "#fff" },
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your rating</Text>
        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setRating(star)}>
              <Ionicons
                name={star <= rating ? "star" : "star-outline"}
                size={36}
                color={star <= rating ? "#F59E0B" : "#ddd"}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your review</Text>
        <TextInput
          style={styles.reviewInput}
          placeholder="Write your thoughts about this book..."
          placeholderTextColor="#aaa"
          value={review}
          onChangeText={setReview}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.6 }]}
          onPress={saveChanges}
          disabled={saving}
        >
          <Text style={styles.saveBtnText}>
            {saving ? "Saving..." : "Save changes"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteBtn} onPress={deleteBook}>
          <Text style={styles.deleteBtnText}>Remove from library</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f8f8" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    backgroundColor: "#fff",
    padding: 20,
    flexDirection: "row",
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  cover: { width: 80, height: 120, borderRadius: 8 },
  noCover: {
    width: 80,
    height: 120,
    borderRadius: 8,
    backgroundColor: "#f3f3f3",
    alignItems: "center",
    justifyContent: "center",
  },
  noCoverText: { fontSize: 32 },
  headerInfo: { flex: 1, justifyContent: "center", gap: 6 },
  title: { fontSize: 18, fontWeight: "bold", color: "#1a1a1a" },
  author: { fontSize: 14, color: "#555" },
  year: { fontSize: 13, color: "#aaa" },
  section: {
    backgroundColor: "#fff",
    padding: 16,
    marginTop: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  statusOptions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  statusBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#f8f8f8",
  },
  statusBtnText: { fontSize: 13, fontWeight: "500", color: "#555" },
  stars: { flexDirection: "row", gap: 8 },
  reviewInput: {
    backgroundColor: "#f3f3f3",
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: "#1a1a1a",
    minHeight: 120,
  },
  actions: { padding: 16, gap: 10, marginBottom: 32 },
  saveBtn: {
    backgroundColor: "#6B4EFF",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  deleteBtn: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  deleteBtnText: { color: "#EF4444", fontSize: 16, fontWeight: "600" },
});

import { View, Text, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { supabase } from "../lib/supabase";

const LINK_TYPES = ["YouTube", "Tab / Chords", "Other"];

function extractYoutubeId(url) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export default function AddLink() {
  const { songId } = useLocalSearchParams();
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");
  const [type, setType] = useState("YouTube");
  const [error, setError] = useState("");

  const handleAdd = async () => {
    if (!url.trim() || !label.trim()) {
      setError("Please fill in both fields.");
      return;
    }
    if (type === "YouTube" && !extractYoutubeId(url)) {
      setError("That doesn't look like a valid YouTube URL.");
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    const { error: dbError } = await supabase.from("links").insert({
      song_id: songId,
      user_id: user.id,
      label,
      url,
      type,
    });
    if (dbError) {
      setError("Failed to save link.");
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Add a Link</Text>

      <Text style={styles.label}>Type</Text>
      <View style={styles.typeRow}>
        {LINK_TYPES.map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.typeButton, type === t && styles.typeButtonActive]}
            onPress={() => setType(t)}
          >
            <Text style={[styles.typeButtonText, type === t && styles.typeButtonTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Label</Text>
      <TextInput
        style={styles.input}
        placeholder='e.g. "Fingerstyle Tutorial"'
        placeholderTextColor="#4a4035"
        value={label}
        onChangeText={setLabel}
      />

      <Text style={styles.label}>URL</Text>
      <TextInput
        style={styles.input}
        placeholder="Paste link here..."
        placeholderTextColor="#4a4035"
        value={url}
        onChangeText={setUrl}
        autoCapitalize="none"
        keyboardType="url"
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleAdd}>
        <Text style={styles.buttonText}>Save Link</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0e0c", padding: 24 },
  back: { marginTop: 52, marginBottom: 24 },
  backText: { color: "#6a6055", fontSize: 14 },
  title: { fontFamily: "serif", fontSize: 32, color: "#f0ebe3", marginBottom: 28 },
  label: { fontSize: 11, color: "#5a5045", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 },
  typeRow: { flexDirection: "row", gap: 8, marginBottom: 24 },
  typeButton: { flex: 1, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: "#2a2520", alignItems: "center" },
  typeButtonActive: { backgroundColor: "#c4873a", borderColor: "#c4873a" },
  typeButtonText: { color: "#5a5045", fontSize: 13 },
  typeButtonTextActive: { color: "#fff" },
  input: {
    backgroundColor: "#1a1814", borderRadius: 12, padding: 14,
    color: "#f0ebe3", fontSize: 15, marginBottom: 20,
    borderWidth: 1, borderColor: "#2a2520",
  },
  button: { backgroundColor: "#c4873a", borderRadius: 12, padding: 16, alignItems: "center", marginTop: 8 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "500" },
  error: { color: "#e05a4e", fontSize: 13, marginBottom: 12 },
});
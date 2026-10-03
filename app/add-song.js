import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Image, ActivityIndicator
} from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function AddSong() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    const { data, error } = await supabase.functions.invoke("spotify-search", {
      body: { query },
    });
    if (error) {
      setError("Search failed. Try again.");
      setLoading(false);
      return;
    }
    setResults(data);
    setLoading(false);
  };

  const addSong = async (track, status = "learning") => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("songs").insert({
      user_id: user.id,
      title: track.title,
      artist: track.artist,
      spotify_track_id: track.spotify_track_id,
      album_cover_url: track.album_cover_url,
      duration_ms: track.duration_ms,
      status,
    });
    if (!error) router.replace("/dashboard");
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Add a Song</Text>
      <Text style={styles.subtitle}>Search Spotify to add a song to your SongBook</Text>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder="Song title or artist..."
          placeholderTextColor="#4a4035"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={search}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={search}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {loading ? (
        <ActivityIndicator color="#c4873a" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView style={styles.results} contentContainerStyle={{ paddingBottom: 40 }}>
          {results.length > 0 && (
            <Text style={styles.resultsLabel}>{results.length} results</Text>
          )}
          {results.map((track) => (
            <View key={track.spotify_track_id} style={styles.card}>
              <View style={styles.cardInner}>
                {track.album_cover_url ? (
                  <Image source={{ uri: track.album_cover_url }} style={styles.cover} />
                ) : (
                  <View style={styles.coverPlaceholder}>
                    <Text style={styles.coverPlaceholderText}>♪</Text>
                  </View>
                )}
                <View style={styles.trackInfo}>
                  <Text style={styles.trackTitle} numberOfLines={1}>{track.title}</Text>
                  <Text style={styles.trackArtist} numberOfLines={1}>{track.artist}</Text>
                  <Text style={styles.duration}>
                    {Math.floor(track.duration_ms / 60000)}:{String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, "0")}
                  </Text>
                </View>
              </View>

              {/* Add buttons row */}
              <View style={styles.addRow}>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => addSong(track, "learning")}
                >
                  <Text style={styles.addButtonText}>+ Learning</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.addButton, styles.addButtonKnow]}
                  onPress={() => addSong(track, "learned")}
                >
                  <Text style={[styles.addButtonText, styles.addButtonKnowText]}>+ Know it</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.addButton, styles.addButtonWishlist]}
                  onPress={() => addSong(track, "wishlist")}
                >
                  <Text style={[styles.addButtonText, styles.addButtonWishlistText]}>♡ Wishlist</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0e0c",
    padding: 24,
  },
  back: {
    marginTop: 60,
    marginBottom: 24,
  },
  backText: {
    fontFamily: "DMSans_400Regular",
    color: "#6a6055",
    fontSize: 14,
  },
  title: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 32,
    color: "#f0ebe3",
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: "#6a6055",
    marginBottom: 24,
  },
  searchRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: "#1a1814",
    borderRadius: 12,
    padding: 14,
    fontFamily: "DMSans_400Regular",
    color: "#f0ebe3",
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#2a2520",
  },
  searchButton: {
    backgroundColor: "#c4873a",
    borderRadius: 12,
    paddingHorizontal: 18,
    justifyContent: "center",
  },
  searchButtonText: {
    fontFamily: "DMSans_500Medium",
    color: "#fff",
    fontSize: 14,
  },
  error: {
    fontFamily: "DMSans_400Regular",
    color: "#e05a4e",
    fontSize: 13,
    marginBottom: 12,
  },
  results: { flex: 1 },
  resultsLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: "#4a4035",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#1a1814",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#2a2520",
  },
  cardInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  cover: {
    width: 54,
    height: 54,
    borderRadius: 8,
  },
  coverPlaceholder: {
    width: 54,
    height: 54,
    borderRadius: 8,
    backgroundColor: "#2a2520",
    alignItems: "center",
    justifyContent: "center",
  },
  coverPlaceholderText: {
    fontSize: 20,
    color: "#3a3530",
  },
  trackInfo: { flex: 1 },
  trackTitle: {
    fontFamily: "PlayfairDisplay_400Regular",
    fontSize: 15,
    color: "#f0ebe3",
    marginBottom: 3,
  },
  trackArtist: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: "#6a6055",
    marginBottom: 3,
  },
  duration: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: "#4a4035",
  },
  addRow: {
    flexDirection: "row",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "#2a2520",
    paddingTop: 12,
  },
  addButton: {
    flex: 1,
    backgroundColor: "#c4873a",
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
  },
  addButtonText: {
    fontFamily: "DMSans_500Medium",
    color: "#fff",
    fontSize: 12,
  },
  addButtonKnow: {
    backgroundColor: "#1a2e28",
    borderWidth: 1,
    borderColor: "#4a7c6f",
  },
  addButtonKnowText: {
    color: "#4a7c6f",
  },
  addButtonWishlist: {
    backgroundColor: "#1e1a2e",
    borderWidth: 1,
    borderColor: "#7a6a9a",
  },
  addButtonWishlistText: {
    color: "#7a6a9a",
  },
});

import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const getStreak = (sessions) => {
  if (!sessions || sessions.length === 0) return 0;
  
  const validSessions = sessions.filter(s => s.duration_seconds >= 60);
  if (validSessions.length === 0) return 0;

  const practiceDays = new Set(
    validSessions.map(s => new Date(s.created_at).toLocaleDateString("en-CA"))
  );

  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toLocaleDateString("en-CA");
    if (practiceDays.has(dateStr)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
};

export default function Dashboard() {
  const router = useRouter();
  const [songs, setSongs] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    const [songsRes, sessionsRes] = await Promise.all([
      supabase.from("songs").select("*").order("created_at", { ascending: false }),
      supabase.from("sessions").select("*").order("created_at", { ascending: false }),
    ]);
    if (!songsRes.error) setSongs(songsRes.data);
    if (!sessionsRes.error) setSessions(sessionsRes.data);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  const learning = songs.filter((s) => s.status === "learning");
  const learned = songs.filter((s) => s.status === "learned");
  const wishlist = songs.filter((s) => s.status === "wishlist");
  const streak = getStreak(sessions);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appName}>SongBook</Text>
          {streak > 0 && (
            <Text style={styles.streak}>
              {streak === 1 ? "🔥 1 day streak" : `🔥 ${streak} day streak`}
            </Text>
          )}
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => router.push("/stats")} style={styles.statsLink}>
            <Text style={styles.statsLinkText}>Stats</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logout}>Log out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <Text style={styles.empty}>Loading your songs...</Text>
      ) : songs.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Your SongBook is empty</Text>
          <Text style={styles.emptySubtitle}>Search for a song to get started</Text>
        </View>
      ) : (
        <>
          {learning.length > 0 && (
            <SongSection
              label="Currently Learning"
              songs={learning}
              router={router}
            />
          )}
          {learned.length > 0 && (
            <SongSection
              label="Already Know"
              songs={learned}
              router={router}
              dim
            />
          )}
          {wishlist.length > 0 && (
            <SongSection
              label="Want to Learn"
              songs={wishlist}
              router={router}
              wishlist
            />
          )}
        </>
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("/add-song")}
      >
        <Text style={styles.addButtonText}>+ Add a song</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function SongSection({ label, songs, router, dim, wishlist }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionLabelRow}>
        <View style={[styles.sectionDot, wishlist && styles.sectionDotWishlist, dim && styles.sectionDotDim]} />
        <Text style={styles.sectionLabel}>{label}</Text>
        <Text style={styles.sectionCount}>{songs.length}</Text>
      </View>
      {songs.map((song) => (
        <SongCard
          key={song.id}
          song={song}
          router={router}
          dim={dim}
          wishlist={wishlist}
        />
      ))}
    </View>
  );
}

function SongCard({ song, router, dim, wishlist }) {
  return (
    <TouchableOpacity
      style={[styles.card, wishlist && styles.cardWishlist]}
      onPress={() => router.push({ pathname: "/song-detail", params: { id: song.id } })}
      activeOpacity={0.75}
    >
      <View style={styles.cardInner}>
        {song.album_cover_url ? (
          <Image source={{ uri: song.album_cover_url }} style={styles.albumCover} />
        ) : (
          <View style={styles.albumPlaceholder}>
            <Text style={styles.albumPlaceholderText}>♪</Text>
          </View>
        )}
        <View style={styles.cardText}>
          <Text style={styles.songTitle} numberOfLines={1}>{song.title}</Text>
          <Text style={styles.artist} numberOfLines={1}>{song.artist}</Text>
        </View>
        {dim && (
          <View style={styles.learnedBadge}>
            <Text style={styles.learnedBadgeText}>✓</Text>
          </View>
        )}
        {wishlist && (
          <View style={styles.wishlistBadge}>
            <Text style={styles.wishlistBadgeText}>♡</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0e0c",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 60,
    marginBottom: 36,
    paddingHorizontal: 24,
  },
  appName: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 34,
    color: "#f0ebe3",
    letterSpacing: 0.5,
  },
  streak: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: "#c4873a",
    marginTop: 4,
  },
  headerRight: {
    alignItems: "flex-end",
    gap: 8,
  },
  statsLink: {
    backgroundColor: "#1a1814",
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#2a2520",
  },
  statsLinkText: {
    fontFamily: "DMSans_400Regular",
    color: "#c4873a",
    fontSize: 12,
  },
  logout: {
    fontFamily: "DMSans_400Regular",
    color: "#4a4035",
    fontSize: 13,
  },
  section: {
    marginBottom: 8,
    paddingHorizontal: 24,
  },
  sectionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
    marginTop: 16,
  },
  sectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#c4873a",
  },
  sectionDotDim: {
    backgroundColor: "#4a7c6f",
  },
  sectionDotWishlist: {
    backgroundColor: "#7a6a9a",
  },
  sectionLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "#5a5045",
    flex: 1,
  },
  sectionCount: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: "#3a3530",
  },
  card: {
    backgroundColor: "#1a1814",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#2a2520",
  },
  cardWishlist: {
    borderStyle: "dashed",
    borderColor: "#2a2520",
  },
  cardInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  albumCover: {
    width: 56,
    height: 56,
    borderRadius: 10,
  },
  albumPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: "#2a2520",
    alignItems: "center",
    justifyContent: "center",
  },
  albumPlaceholderText: {
    fontSize: 20,
    color: "#3a3530",
  },
  cardText: {
    flex: 1,
    gap: 4,
  },
  songTitle: {
    fontFamily: "PlayfairDisplay_400Regular",
    fontSize: 17,
    color: "#f0ebe3",
  },
  artist: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: "#6a6055",
  },
  learnedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#1a2e28",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#4a7c6f",
  },
  learnedBadgeText: {
    color: "#4a7c6f",
    fontSize: 11,
  },
  wishlistBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#1e1a2e",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#7a6a9a",
  },
  wishlistBadgeText: {
    color: "#7a6a9a",
    fontSize: 11,
  },
  addButton: {
    marginTop: 16,
    marginHorizontal: 24,
    borderWidth: 1,
    borderColor: "#2a2520",
    borderStyle: "dashed",
    borderRadius: 14,
    padding: 18,
    alignItems: "center",
  },
  addButtonText: {
    fontFamily: "DMSans_400Regular",
    color: "#4a4035",
    fontSize: 14,
  },
  empty: {
    fontFamily: "DMSans_400Regular",
    color: "#4a4035",
    fontSize: 14,
    textAlign: "center",
    marginTop: 40,
  },
  emptyState: {
    alignItems: "center",
    marginTop: 100,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 24,
    color: "#f0ebe3",
    marginBottom: 10,
    textAlign: "center",
  },
  emptySubtitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: "#4a4035",
    textAlign: "center",
    lineHeight: 22,
  },
});
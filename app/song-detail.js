import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Image, Alert, Dimensions
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../lib/supabase";
import { useTimerStore } from "../lib/timerStore";
import { formatSessionDuration, formatTotalSecondsAsHrsMins } from "../lib/timeFormat";
import YoutubePlayer from "react-native-youtube-iframe";
import * as WebBrowser from "expo-web-browser";

const { width } = Dimensions.get("window");
const HERO_HEIGHT = 280;

function extractYoutubeId(url) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export default function SongDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { startTimer, stopTimer, isRunning, songId } = useTimerStore();

  const [song, setSong] = useState(null);
  const [notes, setNotes] = useState("");
  const [links, setLinks] = useState([]);
  const [goals, setGoals] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesInput, setNotesInput] = useState("");
  const [newGoal, setNewGoal] = useState("");
  const [addingGoal, setAddingGoal] = useState(false);

  useEffect(() => { fetchAll(); }, [id]);

  const fetchAll = async () => {
    const [songRes, notesRes, linksRes, goalsRes, sessionsRes] = await Promise.all([
      supabase.from("songs").select("*").eq("id", id).single(),
      supabase.from("notes").select("*").eq("song_id", id).single(),
      supabase.from("links").select("*").eq("song_id", id).order("created_at"),
      supabase.from("goals").select("*").eq("song_id", id).order("created_at"),
      supabase.from("sessions").select("*").eq("song_id", id).order("created_at", { ascending: false }),
    ]);
    if (songRes.data) setSong(songRes.data);
    if (notesRes.data) { setNotes(notesRes.data.content); setNotesInput(notesRes.data.content); }
    if (linksRes.data) setLinks(linksRes.data);
    if (goalsRes.data) setGoals(goalsRes.data);
    if (sessionsRes.data) setSessions(sessionsRes.data);
    setLoading(false);
  };

  const saveNotes = async () => {
    const { data } = await supabase.from("notes").select("*").eq("song_id", id).single();
    if (data) {
      await supabase.from("notes").update({ content: notesInput, updated_at: new Date() }).eq("song_id", id);
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("notes").insert({ song_id: id, user_id: user.id, content: notesInput });
    }
    setNotes(notesInput);
    setEditingNotes(false);
  };

  const toggleGoal = async (goal) => {
    await supabase.from("goals").update({ done: !goal.done }).eq("id", goal.id);
    setGoals((prev) => prev.map((g) => g.id === goal.id ? { ...g, done: !g.done } : g));
  };

  const deleteGoal = async (goalId) => {
    Alert.alert("Delete Goal", "Remove this goal?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive", onPress: async () => {
          await supabase.from("goals").delete().eq("id", goalId);
          setGoals((prev) => prev.filter((g) => g.id !== goalId));
        }
      },
    ]);
  };

  const addGoal = async () => {
    if (!newGoal.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase.from("goals").insert({
      song_id: id, user_id: user.id, text: newGoal, done: false,
    }).select().single();
    if (data) setGoals((prev) => [...prev, data]);
    setNewGoal("");
    setAddingGoal(false);
  };

  const deleteLink = async (linkId) => {
    Alert.alert("Delete Link", "Remove this link?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive", onPress: async () => {
          await supabase.from("links").delete().eq("id", linkId);
          setLinks((prev) => prev.filter((l) => l.id !== linkId));
        }
      },
    ]);
  };

  const deleteSong = async () => {
    Alert.alert("Delete Song", "Remove this song from your SongBook?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive", onPress: async () => {
          await supabase.from("songs").delete().eq("id", id);
          router.replace("/dashboard");
        }
      },
    ]);
  };

  const toggleStatus = async () => {
    const cycle = { learning: "learned", learned: "wishlist", wishlist: "learning" };
    const newStatus = cycle[song.status] || "learning";
    await supabase.from("songs").update({ status: newStatus }).eq("id", id);
    setSong((prev) => ({ ...prev, status: newStatus }));
  };

  const totalSeconds = sessions.reduce((acc, s) => acc + s.duration_seconds, 0);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const lastSession = sessions[0];

  const statusLabel = () => {
    if (song.status === "learning") return "Learning → tap to mark known";
    if (song.status === "learned") return "Know it → tap for wishlist";
    if (song.status === "wishlist") return "Wishlist → tap to mark learning";
    return song.status;
  };

  const statusColor = () => {
    if (song.status === "learning") return "#c4873a";
    if (song.status === "learned") return "#4a7c6f";
    if (song.status === "wishlist") return "#7a6a9a";
    return "#5a5045";
  };

  if (loading) return (
    <View style={styles.container}>
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );

  if (!song) return (
    <View style={styles.container}>
      <Text style={styles.loadingText}>Song not found</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>

      {/* Hero */}
      <View style={styles.hero}>
        {song.album_cover_url ? (
          <Image
            source={{ uri: song.album_cover_url }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.heroPlaceholder}>
            <Text style={styles.heroPlaceholderText}>♪</Text>
          </View>
        )}
        <LinearGradient
          colors={["transparent", "#0f0e0c"]}
          style={styles.heroGradient}
        />

        {/* Back + Delete overlaid on hero */}
        <View style={styles.heroNav}>
          <TouchableOpacity onPress={() => router.back()} style={styles.heroNavButton}>
            <Text style={styles.heroNavText}>← Back</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={deleteSong} style={styles.heroNavButton}>
            <Text style={styles.heroNavTextMuted}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Title block */}
      <View style={styles.titleBlock}>
        <Text style={styles.artist}>{song.artist}</Text>
        <Text style={styles.title}>{song.title}</Text>

        <TouchableOpacity onPress={toggleStatus} style={styles.statusBadge}>
          <View style={[styles.statusDot, { backgroundColor: statusColor() }]} />
          <Text style={[styles.statusText, { color: statusColor() }]}>{statusLabel()}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>

        {/* Stats — only show if sessions exist */}
        {sessions.length > 0 && (
          <View style={styles.statsRow}>
            {[
              ["Sessions", sessions.length],
              ["Total Time", formatTotalSecondsAsHrsMins(totalSeconds)],
              ["Last Played", lastSession ? new Date(lastSession.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"],
            ].map(([label, value]) => (
              <View key={label} style={styles.statBox}>
                <Text style={styles.statValue}>{value}</Text>
                <Text style={styles.statLabel}>{label}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Session button */}
        {isRunning && songId === song.id ? (
          <TouchableOpacity
            style={styles.sessionButtonEnd}
            onPress={async () => {
              const elapsed = stopTimer();
              const { data: { user } } = await supabase.auth.getUser();
              await supabase.from("sessions").insert({
                song_id: id, user_id: user.id, duration_seconds: elapsed
              });
              fetchAll();
            }}
          >
            <Text style={styles.sessionButtonText}>◼  End Session</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.sessionButtonStart}
            onPress={() => startTimer({ id: song.id, title: song.title, artist: song.artist })}
          >
            <Text style={styles.sessionButtonText}>▶  Start Practice Session</Text>
          </TouchableOpacity>
        )}

        {/* Notes */}
        <SectionHeader label="Notes" />
        <View style={styles.card}>
          {editingNotes ? (
            <>
              <TextInput
                style={styles.notesInput}
                value={notesInput}
                onChangeText={setNotesInput}
                multiline
                autoFocus
                placeholderTextColor="#4a4035"
                placeholder="Write your notes here..."
              />
              <TouchableOpacity onPress={saveNotes} style={styles.saveButton}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity onPress={() => setEditingNotes(true)}>
              <Text style={styles.notesText}>
                {notes || "Tap to add notes..."}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Links */}
        <SectionHeader
          label="Links"
          action="+ Add"
          onAction={() => router.push({ pathname: "/add-link", params: { songId: id } })}
        />
        {links.length === 0 && (
          <Text style={styles.emptyText}>No links added yet</Text>
        )}
        {links.map((link) => {
          const youtubeId = link.type === "YouTube" ? extractYoutubeId(link.url) : null;
          return (
            <View key={link.id} style={styles.card}>
              <View style={styles.linkHeader}>
                <Text style={styles.linkLabel}>
                  {link.type === "YouTube" ? "▶  " : "⟶  "}{link.label}
                </Text>
                <TouchableOpacity onPress={() => deleteLink(link.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={styles.deleteText}>✕</Text>
                </TouchableOpacity>
              </View>
              {youtubeId ? (
                <View style={{ marginTop: 12 }}>
                  <YoutubePlayer height={200} videoId={youtubeId} />
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => WebBrowser.openBrowserAsync(link.url)}
                  style={styles.openButton}
                >
                  <Text style={styles.openButtonText}>Open link →</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}

        {/* Goals */}
        <SectionHeader
          label="Goals"
          action="+ Add"
          onAction={() => setAddingGoal(true)}
        />
        {addingGoal && (
          <View style={styles.card}>
            <TextInput
              style={styles.notesInput}
              placeholder="e.g. Nail the intro riff"
              placeholderTextColor="#4a4035"
              value={newGoal}
              onChangeText={setNewGoal}
              autoFocus
            />
            <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
              <TouchableOpacity style={[styles.saveButton, { flex: 1 }]} onPress={addGoal}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, { flex: 1, backgroundColor: "#2a2520" }]}
                onPress={() => { setAddingGoal(false); setNewGoal(""); }}
              >
                <Text style={styles.saveButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        {goals.length === 0 && !addingGoal && (
          <Text style={styles.emptyText}>No goals added yet</Text>
        )}
        {goals.map((goal) => (
          <TouchableOpacity
            key={goal.id}
            style={styles.card}
            onPress={() => toggleGoal(goal)}
            onLongPress={() => deleteGoal(goal.id)}
            activeOpacity={0.75}
          >
            <View style={styles.goalRow}>
              <View style={[
                styles.goalDot,
                { backgroundColor: goal.done ? "#4a7c6f" : "transparent", borderColor: goal.done ? "#4a7c6f" : "#3a3530" }
              ]}>
                {goal.done && <Text style={styles.goalCheck}>✓</Text>}
              </View>
              <Text style={[styles.goalText, goal.done && styles.goalDone]} numberOfLines={2}>
                {goal.text}
              </Text>
            </View>
            <Text style={styles.goalHint}>hold to delete</Text>
          </TouchableOpacity>
        ))}

        {/* Session History */}
        {sessions.length > 0 && (
          <>
            <SectionHeader label="Practice History" />
            <View style={styles.card}>
              {sessions.slice(0, 10).map((session, index) => {
                const duration = formatSessionDuration(session.duration_seconds);
                const date = new Date(session.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
                return (
                  <View
                    key={session.id}
                    style={[
                      styles.sessionRow,
                      index < sessions.slice(0, 10).length - 1 && styles.sessionRowBorder
                    ]}
                  >
                    <Text style={styles.sessionDate}>{date}</Text>
                    <View style={styles.sessionDurationBar}>
                      <View style={[
                        styles.sessionBar,
                        { width: `${Math.min((session.duration_seconds / 3600) * 100, 100)}%` }
                      ]} />
                    </View>
                    <Text style={styles.sessionDuration}>{duration}</Text>
                  </View>
                );
              })}
              {sessions.length > 10 && (
                <Text style={styles.sessionMore}>
                  + {sessions.length - 10} more sessions
                </Text>
              )}
            </View>
          </>
        )}

      </View>
    </ScrollView>
  );
}

function SectionHeader({ label, action, onAction }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionLabel}>{label}</Text>
      {action && (
        <TouchableOpacity onPress={onAction}>
          <Text style={styles.sectionAction}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0e0c",
  },
  loadingText: {
    fontFamily: "DMSans_400Regular",
    color: "#f0ebe3",
    marginTop: 100,
    textAlign: "center",
  },

  // Hero
  hero: {
    width: width,
    height: HERO_HEIGHT,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#1a1814",
    alignItems: "center",
    justifyContent: "center",
  },
  heroPlaceholderText: {
    fontSize: 64,
    color: "#2a2520",
  },
  heroGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 160,
  },
  heroNav: {
    position: "absolute",
    top: 56,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
  },
  heroNavButton: {
    backgroundColor: "rgba(15,14,12,0.5)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  heroNavText: {
    fontFamily: "DMSans_400Regular",
    color: "#f0ebe3",
    fontSize: 14,
  },
  heroNavTextMuted: {
    fontFamily: "DMSans_400Regular",
    color: "#6a6055",
    fontSize: 14,
  },

  // Title block
  titleBlock: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  artist: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: "#6a6055",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  title: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 30,
    color: "#f0ebe3",
    lineHeight: 38,
    marginBottom: 14,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#1a1814",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 7,
    borderWidth: 1,
    borderColor: "#2a2520",
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
  },

  // Content
  content: {
    paddingHorizontal: 24,
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#1a1814",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2a2520",
  },
  statValue: {
    fontFamily: "PlayfairDisplay_400Regular",
    fontSize: 18,
    color: "#f0ebe3",
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 10,
    color: "#5a5045",
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  // Session buttons
  sessionButtonStart: {
    backgroundColor: "#c4873a",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 32,
  },
  sessionButtonEnd: {
    backgroundColor: "#1a1410",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "#c4873a",
  },
  sessionButtonText: {
    fontFamily: "DMSans_500Medium",
    color: "#f0ebe3",
    fontSize: 15,
  },

  // Section headers
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 28,
  },
  sectionLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: "#5a5045",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  sectionAction: {
    fontFamily: "DMSans_400Regular",
    color: "#c4873a",
    fontSize: 13,
  },

  // Cards
  card: {
    backgroundColor: "#1a1814",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#2a2520",
  },
  notesText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: "#a09888",
    lineHeight: 24,
  },
  notesInput: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: "#f0ebe3",
    lineHeight: 24,
    minHeight: 80,
  },
  saveButton: {
    alignSelf: "flex-end",
    backgroundColor: "#c4873a",
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  saveButtonText: {
    fontFamily: "DMSans_500Medium",
    color: "#fff",
    fontSize: 13,
  },

  // Links
  linkHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  linkLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: "#c4873a",
    flex: 1,
  },
  deleteText: {
    fontFamily: "DMSans_400Regular",
    color: "#3a3530",
    fontSize: 14,
    paddingLeft: 12,
  },
  openButton: {
    marginTop: 10,
    alignSelf: "flex-start",
  },
  openButtonText: {
    fontFamily: "DMSans_400Regular",
    color: "#6a6055",
    fontSize: 13,
  },

  // Goals
  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  goalDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  goalCheck: {
    color: "#fff",
    fontSize: 10,
  },
  goalText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: "#a09888",
    flex: 1,
    lineHeight: 22,
  },
  goalDone: {
    textDecorationLine: "line-through",
    color: "#4a5045",
  },
  goalHint: {
    fontFamily: "DMSans_400Regular",
    fontSize: 10,
    color: "#2a2520",
    marginTop: 6,
    marginLeft: 32,
  },

  // Sessions
  sessionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
  },
  sessionRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#2a2520",
  },
  sessionDate: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: "#6a6055",
    width: 52,
  },
  sessionDurationBar: {
    flex: 1,
    height: 3,
    backgroundColor: "#2a2520",
    borderRadius: 2,
    overflow: "hidden",
  },
  sessionBar: {
    height: "100%",
    backgroundColor: "#c4873a",
    borderRadius: 2,
    minWidth: 4,
  },
  sessionDuration: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: "#a09888",
    width: 44,
    textAlign: "right",
  },
  sessionMore: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: "#4a4035",
    textAlign: "center",
    paddingTop: 10,
  },

  // Empty
  emptyText: {
    fontFamily: "DMSans_400Regular",
    color: "#3a3530",
    fontSize: 13,
    marginBottom: 12,
    paddingLeft: 2,
  },
});
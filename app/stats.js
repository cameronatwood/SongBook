import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { formatMinutesAsHrsMins } from "../lib/timeFormat";

const { width } = Dimensions.get("window");

// Hardcoded demo data — replace with real Supabase query later
const DEMO_WEEKLY = [
  { day: "Mon", minutes: 12 },
  { day: "Tue", minutes: 0 },
  { day: "Wed", minutes: 34 },
  { day: "Thu", minutes: 18 },
  { day: "Fri", minutes: 45 },
  { day: "Sat", minutes: 22 },
  { day: "Sun", minutes: 8 },
];

const DEMO_SONGS = [
  { title: "Who Knows", artist: "Daniel Caesar", minutes: 47 },
  { title: "Porch Light", artist: "Noah Kahan", minutes: 34 },
  { title: "Rattlesnake", artist: "Zach Bryan", minutes: 22 },
  { title: "House Fire", artist: "Tyler Childers", minutes: 18 },
  { title: "Aria Math", artist: "C418", minutes: 12 },
];

const DEMO_STATS = {
  totalMinutes: 139,
  totalSessions: 24,
  streak: 3,
  mostActiveDay: "Friday",
};

function BarChart({ data }) {
  const maxMinutes = Math.max(...data.map(d => d.minutes), 1);
  const chartHeight = 160;

  return (
    <View style={chart.container}>
      {/* Y axis labels */}
      <View style={chart.yAxis}>
        {[maxMinutes, Math.floor(maxMinutes / 2), 0].map((val, i) => (
          <Text key={i} style={chart.yLabel}>{val}m</Text>
        ))}
      </View>

      {/* Bars */}
      <View style={chart.barsContainer}>
        {/* Grid lines */}
        <View style={[chart.gridLine, { bottom: chartHeight * 0.5 }]} />
        <View style={[chart.gridLine, { bottom: chartHeight }]} />

        <View style={chart.bars}>
          {data.map((item, index) => {
            const barHeight = item.minutes === 0
              ? 3
              : Math.max((item.minutes / maxMinutes) * chartHeight, 8);
            const isToday = index === new Date().getDay() - 1;

            return (
              <View key={item.day} style={chart.barWrapper}>
                {item.minutes > 0 && (
                  <Text style={chart.barValue}>{item.minutes}m</Text>
                )}
                <View style={[
                  chart.bar,
                  { height: barHeight },
                  item.minutes === 0 && chart.barEmpty,
                  isToday && chart.barToday,
                ]} />
                <Text style={[chart.dayLabel, isToday && chart.dayLabelToday]}>
                  {item.day}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

function StatCard({ value, label, accent }) {
  return (
    <View style={[styles.statCard, accent && styles.statCardAccent]}>
      <Text style={[styles.statCardValue, accent && styles.statCardValueAccent]}>
        {value}
      </Text>
      <Text style={styles.statCardLabel}>{label}</Text>
    </View>
  );
}

function SongBar({ song, maxMinutes, index }) {
  const fillPercent = Math.max((song.minutes / maxMinutes) * 100, 2);
  return (
    <View style={styles.songBarRow}>
      <View style={styles.songBarMeta}>
        <Text style={styles.songBarRank}>{index + 1}</Text>
        <View style={styles.songBarInfo}>
          <Text style={styles.songBarTitle} numberOfLines={1}>{song.title}</Text>
          <Text style={styles.songBarArtist} numberOfLines={1}>{song.artist}</Text>
        </View>
        <Text style={styles.songBarMinutes}>{song.minutes}m</Text>
      </View>
      <View style={styles.songBarTrack}>
        <View style={[styles.songBarFill, { width: `${fillPercent}%` }]} />
      </View>
    </View>
  );
}

export default function Stats() {
  const router = useRouter();
  const maxSongMinutes = Math.max(...DEMO_SONGS.map(s => s.minutes));

  const totalTimeLabel = formatMinutesAsHrsMins(DEMO_STATS.totalMinutes);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.pageTitle}>Practice Stats</Text>
      <Text style={styles.pageSubtitle}>Your last 7 days</Text>

      {/* Summary cards */}
      <View style={styles.statGrid}>
        <StatCard value={totalTimeLabel} label="Total time" accent />
        <StatCard value={DEMO_STATS.totalSessions} label="Sessions" />
        <StatCard value={`${DEMO_STATS.streak} days`} label="Streak" />
        <StatCard value={DEMO_STATS.mostActiveDay} label="Best day" />
      </View>

      {/* Weekly chart */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Minutes per day</Text>
        <View style={styles.card}>
          <BarChart data={DEMO_WEEKLY} />
        </View>
      </View>

      {/* Top songs */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Most practiced songs</Text>
        <View style={styles.card}>
          {DEMO_SONGS.map((song, index) => (
            <View key={song.title}>
              <SongBar song={song} maxMinutes={maxSongMinutes} index={index} />
              {index < DEMO_SONGS.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>
      </View>

    </ScrollView>
  );
}

const chart = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: 200,
    paddingTop: 20,
  },
  yAxis: {
    width: 32,
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingRight: 6,
    paddingBottom: 24,
  },
  yLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 10,
    color: "#4a4035",
  },
  barsContainer: {
    flex: 1,
    position: "relative",
  },
  gridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#2a2520",
  },
  bars: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    paddingBottom: 24,
    gap: 6,
  },
  barWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  barValue: {
    fontFamily: "DMSans_400Regular",
    fontSize: 9,
    color: "#c4873a",
    marginBottom: 3,
  },
  bar: {
    width: "100%",
    backgroundColor: "#c4873a",
    borderRadius: 4,
    opacity: 0.85,
  },
  barEmpty: {
    backgroundColor: "#2a2520",
    opacity: 1,
  },
  barToday: {
    opacity: 1,
    backgroundColor: "#e09848",
  },
  dayLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 10,
    color: "#5a5045",
    marginTop: 6,
  },
  dayLabelToday: {
    color: "#c4873a",
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0e0c",
  },
  header: {
    marginTop: 60,
    marginBottom: 8,
    paddingHorizontal: 24,
  },
  backText: {
    fontFamily: "DMSans_400Regular",
    color: "#6a6055",
    fontSize: 14,
  },
  pageTitle: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 32,
    color: "#f0ebe3",
    paddingHorizontal: 24,
    marginBottom: 6,
  },
  pageSubtitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: "#6a6055",
    paddingHorizontal: 24,
    marginBottom: 28,
  },
  statGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  statCard: {
    width: (width - 58) / 2,
    backgroundColor: "#1a1814",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#2a2520",
  },
  statCardAccent: {
    borderColor: "#c4873a",
    backgroundColor: "#1e1710",
  },
  statCardValue: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 26,
    color: "#f0ebe3",
    marginBottom: 4,
  },
  statCardValueAccent: {
    color: "#c4873a",
  },
  statCardLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: "#5a5045",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 28,
  },
  sectionLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: "#5a5045",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#1a1814",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#2a2520",
  },
  songBarRow: {
    paddingVertical: 10,
  },
  songBarMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  songBarRank: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: "#3a3530",
    width: 16,
    textAlign: "center",
  },
  songBarInfo: {
    flex: 1,
  },
  songBarTitle: {
    fontFamily: "PlayfairDisplay_400Regular",
    fontSize: 14,
    color: "#f0ebe3",
    marginBottom: 2,
  },
  songBarArtist: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: "#6a6055",
  },
  songBarMinutes: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: "#c4873a",
  },
  songBarTrack: {
    height: 3,
    backgroundColor: "#2a2520",
    borderRadius: 2,
    overflow: "hidden",
  },
  songBarFill: {
    height: "100%",
    backgroundColor: "#c4873a",
    borderRadius: 2,
    opacity: 0.7,
  },
  divider: {
    height: 1,
    backgroundColor: "#2a2520",
  },
});
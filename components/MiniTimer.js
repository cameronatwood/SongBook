import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTimerStore } from "../lib/timerStore";

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function MiniTimer() {
  const { isRunning, songTitle, songArtist, elapsed, stopTimer } = useTimerStore();

  if (!isRunning) return null;

  return (
    <View style={styles.container}>
      <View style={styles.dot} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{songTitle}</Text>
        <Text style={styles.artist} numberOfLines={1}>{songArtist}</Text>
      </View>
      <Text style={styles.timer}>{formatTime(elapsed)}</Text>
      <TouchableOpacity style={styles.endButton} onPress={stopTimer}>
        <Text style={styles.endText}>End</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    backgroundColor: "#1a1814",
    borderTopWidth: 1,
    borderTopColor: "#2a2520",
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    paddingHorizontal: 16,
    gap: 10,
    zIndex: 999,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#c4873a",
  },
  info: { flex: 1 },
  title: {
    fontFamily: "DMSans_500Medium",
    fontSize: 13,
    color: "#f0ebe3",
  },
  artist: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: "#6a6055",
    marginTop: 1,
  },
  timer: {
    fontFamily: "PlayfairDisplay_400Regular",
    fontSize: 18,
    color: "#f0ebe3",
    marginRight: 4,
  },
  endButton: {
    borderWidth: 1,
    borderColor: "#c4873a",
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  endText: {
    fontFamily: "DMSans_400Regular",
    color: "#c4873a",
    fontSize: 12,
  },
});
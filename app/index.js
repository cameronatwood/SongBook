import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/dashboard");
    });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SongBook</Text>
      <Text style={styles.subtitle}>your personal practice log</Text>
      <TouchableOpacity style={styles.button} onPress={() => router.push("/login")}>
        <Text style={styles.buttonText}>Log In</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push("/signup")}>
        <Text style={styles.switchText}>Don't have an account? Sign up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0e0c", alignItems: "center", justifyContent: "center", padding: 24 },
  title: { fontFamily: "serif", fontSize: 42, color: "#f0ebe3", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#6a6055", marginBottom: 48, letterSpacing: 1 },
  button: { backgroundColor: "#c4873a", borderRadius: 12, padding: 16, width: "100%", alignItems: "center", marginBottom: 16 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "500" },
  switchText: { color: "#6a6055", fontSize: 14 },
});
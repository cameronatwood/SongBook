import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "expo-router";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      router.replace("/dashboard");
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>Log in to SongBook</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#4a4035"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#4a4035"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Logging in..." : "Log In"}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/signup")}>
        <Text style={styles.switchText}>Don't have an account? Sign up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0e0c", padding: 24, justifyContent: "center" },
  title: { fontFamily: "serif", fontSize: 36, color: "#f0ebe3", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#6a6055", marginBottom: 40, letterSpacing: 1 },
  input: {
    backgroundColor: "#1a1814", borderRadius: 12, padding: 16,
    color: "#f0ebe3", fontSize: 15, marginBottom: 12,
    borderWidth: 1, borderColor: "#2a2520",
  },
  button: {
    backgroundColor: "#c4873a", borderRadius: 12,
    padding: 16, alignItems: "center", marginTop: 8, marginBottom: 20,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "500" },
  switchText: { color: "#6a6055", fontSize: 14, textAlign: "center" },
  error: { color: "#e05a4e", fontSize: 13, marginBottom: 12 },
});
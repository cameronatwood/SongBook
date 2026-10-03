import { Stack } from "expo-router";
import { View, StyleSheet } from "react-native";
import MiniTimer from "../components/MiniTimer";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { useFonts, PlayfairDisplay_700Bold, PlayfairDisplay_400Regular } from "@expo-google-fonts/playfair-display";
import { DMSans_400Regular, DMSans_500Medium } from "@expo-google-fonts/dm-sans";

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    PlayfairDisplay_400Regular,
    DMSans_400Regular,
    DMSans_500Medium,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#0f0e0c" },
        }}
      />
      <MiniTimer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
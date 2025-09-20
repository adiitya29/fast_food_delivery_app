import useAuthStore from "@/store/auth.store";
import * as Sentry from '@sentry/react-native';
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import "./globals.css";

Sentry.init({
  dsn: 'https://598023dffdd5bcca9f1543314f0514ac@o4510045247307776.ingest.de.sentry.io/4510045325492304',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

export default Sentry.wrap(function RootLayout() {
  //this way giving error
  // const [fontsLoaded, error] = useFonts( map: {

  const{isLoading, fetchAuthenticatedUser} = useAuthStore();

  const [fontsLoaded, error] = useFonts({
  "Quicksand-Bold": require("../assets/fonts/Quicksand-Bold.ttf"),
  "Quicksand-Medium": require("../assets/fonts/Quicksand-Medium.ttf"),
  "Quicksand-Regular": require("../assets/fonts/Quicksand-Regular.ttf"),
  "Quicksand-SemiBold": require("../assets/fonts/Quicksand-SemiBold.ttf"),
   "QuickSand-Light": require('../assets/fonts/Quicksand-Light.ttf'),
});

 useEffect(() => {
    if (error) {
      console.error("Font loading error:", error);
    }

    if (fontsLoaded || error) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]); 

   useEffect(() => {
    fetchAuthenticatedUser()
  }, []);

  if (!fontsLoaded || isLoading) {
    return null;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
});

// Sentry.showFeedbackWidget();
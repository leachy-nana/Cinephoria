import { StyleSheet, Text, View } from 'react-native'
import { SplashScreen, Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { useFonts } from 'expo-font';

SplashScreen.preventAutoHideAsync();

const RootLayout = () => {

  // Loading custom fonts using the useFonts hook from expo-font
    const [fontsLoaded, error] = useFonts({
        "Arvo": require("../assets/fonts/Arvo-Regular.ttf"),
        "Arvo-Bold": require("../assets/fonts/Arvo-Bold.ttf"),
        "Arvo-BoldItalic": require("../assets/fonts/Arvo-BoldItalic.ttf"),
        "Arvo-Italic": require("../assets/fonts/Arvo-Italic.ttf"),
      });
    
       // useEffect hook to hide the splash screen once fonts are loaded or if there's an error
      useEffect(() => {
        if(error) throw error;
        if(fontsLoaded) SplashScreen.hideAsync();
      }, [fontsLoaded, error])

        if(!fontsLoaded && !error) return null;

    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown:false }}/>
            <Stack.Screen name="(auth)" options={{
              headerShown: false
            }}/>
            <Stack.Screen name="(tabs)" options={{
              headerShown: false
            }}/>
        </Stack>
    )
}

export default RootLayout
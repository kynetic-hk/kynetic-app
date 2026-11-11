import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { I18nProvider } from '../src/i18n';
import { ProfileProvider } from '../src/store/profile';
import { WorkoutProvider } from '../src/store/workout';
import { colors } from '../src/theme';

const theme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: colors.bg, card: colors.bg, primary: colors.orange, text: colors.text, border: colors.border },
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider value={theme}>
        <I18nProvider>
        <ProfileProvider>
          <WorkoutProvider>
            <StatusBar style="light" />
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg }, animation: 'fade' }}>
              <Stack.Screen name="workout/review" options={{ animation: 'slide_from_bottom', gestureEnabled: false }} />
              <Stack.Screen name="workout/live" options={{ gestureEnabled: false }} />
            </Stack>
          </WorkoutProvider>
        </ProfileProvider>
        </I18nProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

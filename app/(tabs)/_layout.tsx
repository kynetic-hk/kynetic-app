import { Redirect, Tabs } from 'expo-router';
import { BookIcon, ChartIcon, HomeIcon, UserIcon } from '../../src/components/icons';
import { useI18n } from '../../src/i18n';
import { useProfile } from '../../src/store/profile';
import { colors } from '../../src/theme';

export default function TabsLayout() {
  const { profile, loading } = useProfile();
  const { t } = useI18n();
  if (!loading && !profile) return <Redirect href="/onboarding" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.orange,
        tabBarInactiveTintColor: colors.textMute,
        tabBarStyle: { backgroundColor: 'rgba(24,24,24,0.92)', position: 'absolute', borderTopColor: colors.border, height: 64, paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="home" options={{ title: t('tab.home'), tabBarIcon: ({ color }) => <HomeIcon color={color} /> }} />
      <Tabs.Screen name="progress" options={{ title: t('tab.progress'), tabBarIcon: ({ color }) => <ChartIcon color={color} /> }} />
      <Tabs.Screen name="library" options={{ title: t('tab.library'), tabBarIcon: ({ color }) => <BookIcon color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: t('tab.profile'), tabBarIcon: ({ color }) => <UserIcon color={color} /> }} />
    </Tabs>
  );
}

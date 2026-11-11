import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useProfile } from '../src/store/profile';
import { colors } from '../src/theme';

/** Entry gate: first launch goes to onboarding, otherwise straight Home. */
export default function Index() {
  const { profile, loading } = useProfile();
  if (loading)
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.orange} />
      </View>
    );
  return <Redirect href={profile ? '/home' : '/onboarding'} />;
}

import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, space, type } from '../theme';

export function ComingSoon({ title, note }: { title: string; note: string }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <View style={{ padding: space.xl }}>
        <Text style={type.h1}>{title}</Text>
        <View style={{ marginTop: space.xxl, padding: space.xl, borderRadius: 20, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border }}>
          <Text style={[type.label, { color: colors.orange }]}>Coming next</Text>
          <Text style={[type.body, { color: colors.textDim, marginTop: space.sm }]}>{note}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

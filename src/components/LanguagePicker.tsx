import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LANGS, useI18n } from '../i18n';
import { colors, radius, space } from '../theme';

/** Compact EN / 普 / 粵 segmented switch. `full` shows the full names. */
export function LanguagePicker({ full = false }: { full?: boolean }) {
  const { lang, setLang } = useI18n();
  return (
    <View style={[st.wrap, full && { alignSelf: 'stretch' }]}>
      {LANGS.map((l) => {
        const on = l.id === lang;
        return (
          <Pressable
            key={l.id}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            accessibilityLabel={l.label}
            onPress={() => setLang(l.id)}
            style={[st.seg, full && { flex: 1 }, on && st.on]}
          >
            <Text style={[st.text, on && { color: '#202020' }]}>{full ? l.label : l.short}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const st = StyleSheet.create({
  wrap: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.pill, padding: 3, borderWidth: 1, borderColor: colors.border },
  seg: { paddingHorizontal: space.md, paddingVertical: 7, borderRadius: radius.pill, alignItems: 'center' },
  on: { backgroundColor: colors.orange },
  text: { color: colors.text, fontWeight: '800', fontSize: 13 },
});

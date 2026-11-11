import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useI18n } from '../i18n';
import { colors, radius, space, type } from '../theme';
import { Avatar, AvatarLook, HAIR_COLORS, HAIR_STYLES, SHIRTS, SKIN, useLoop } from './Avatar';

/** Live avatar preview with skin / hair / hair colour / shirt pickers. */
export function AvatarBuilder({ look, onChange }: { look: AvatarLook; onChange: (l: AvatarLook) => void }) {
  const { t } = useI18n();
  const k = useLoop(2200);
  const set = (patch: Partial<AvatarLook>) => onChange({ ...look, ...patch });

  return (
    <View>
      <View style={st.preview}>
        <Avatar look={look} pose="bicep_curl" k={k} size={120} />
      </View>

      <Text style={st.label}>{t('onb.avatar.skin')}</Text>
      <View style={st.row}>
        {SKIN.map((c, i) => (
          <Swatch key={c} color={c} on={look.skin === i} onPress={() => set({ skin: i })} />
        ))}
      </View>

      <Text style={st.label}>{t('onb.avatar.hair')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm }}>
        {HAIR_STYLES.map((h, i) => (
          <Pressable
            key={h}
            accessibilityRole="button"
            accessibilityState={{ selected: look.hair === i }}
            accessibilityLabel={h}
            onPress={() => set({ hair: i })}
            style={[st.hairOpt, look.hair === i && st.on]}
          >
            <Avatar look={{ ...look, hair: i }} headOnly size={48} />
          </Pressable>
        ))}
      </ScrollView>

      <Text style={st.label}>{t('onb.avatar.hairColor')}</Text>
      <View style={st.row}>
        {HAIR_COLORS.map((c, i) => (
          <Swatch key={c} color={c} on={look.hairColor === i} onPress={() => set({ hairColor: i })} />
        ))}
      </View>

      <Text style={st.label}>{t('onb.avatar.shirt')}</Text>
      <View style={st.row}>
        {SHIRTS.map((c, i) => (
          <Swatch key={c} color={c} on={look.shirt === i} onPress={() => set({ shirt: i })} />
        ))}
      </View>
    </View>
  );
}

function Swatch({ color, on, onPress }: { color: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected: on }} onPress={onPress} style={[st.swatchRing, on && { borderColor: colors.orange }]}>
      <View style={[st.swatch, { backgroundColor: color }]} />
    </Pressable>
  );
}

const st = StyleSheet.create({
  preview: { alignItems: 'center', paddingVertical: space.md, borderRadius: radius.lg, backgroundColor: colors.surface, marginBottom: space.sm },
  label: { ...type.label, marginTop: space.lg, marginBottom: space.sm },
  row: { flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' },
  swatchRing: { padding: 3, borderRadius: 22, borderWidth: 2, borderColor: 'transparent' },
  swatch: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: 'rgba(255,251,245,0.15)' },
  hairOpt: { padding: 4, borderRadius: radius.md, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.surface },
  on: { borderColor: colors.orange, backgroundColor: colors.orangeDim },
});

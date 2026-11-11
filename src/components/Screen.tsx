import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme';
import { MotionBackground } from './MotionBackground';

/**
 * Every screen sits in one of these: opaque charcoal base, the animated glow
 * background, then safe-area content. Keeping the background per screen means
 * screens never show through each other during navigation.
 */
export function Screen({
  children,
  edges = ['top'],
  style,
  intensity = 1,
}: {
  children: React.ReactNode;
  edges?: Edge[];
  style?: StyleProp<ViewStyle>;
  intensity?: number;
}) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <MotionBackground intensity={intensity} />
      <SafeAreaView style={[{ flex: 1 }, style]} edges={edges}>
        {children}
      </SafeAreaView>
    </View>
  );
}

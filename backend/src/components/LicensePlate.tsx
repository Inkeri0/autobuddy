import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface LicensePlateProps {
  plate: string;
  size?: 'sm' | 'md' | 'lg';
}

const SIZES = {
  sm: { height: undefined, borderWidth: 1, borderRadius: 4, blueWidth: undefined, bluePaddingH: 6, yellowPaddingH: 10, fontSize: 11, nlFontSize: 8, letterSpacing: 1 },
  md: { height: 32, borderWidth: 2, borderRadius: 4, blueWidth: 20, bluePaddingH: undefined, yellowPaddingH: 10, fontSize: 14, nlFontSize: 7, letterSpacing: 1.5 },
  lg: { height: 36, borderWidth: 2, borderRadius: 5, blueWidth: 22, bluePaddingH: undefined, yellowPaddingH: 12, fontSize: 17, nlFontSize: 8, letterSpacing: 1.5 },
};

export default function LicensePlate({ plate, size = 'md' }: LicensePlateProps) {
  const s = SIZES[size];

  return (
    <View style={[styles.container, { height: s.height, borderWidth: s.borderWidth, borderRadius: s.borderRadius }]}>
      <View style={[styles.blueStrip, { width: s.blueWidth, paddingHorizontal: s.bluePaddingH }]}>
        <Text style={[styles.nlText, { fontSize: s.nlFontSize }]}>NL</Text>
      </View>
      <View style={[styles.yellowBg, { paddingHorizontal: s.yellowPaddingH }]}>
        <Text style={[styles.plateText, { fontSize: s.fontSize, letterSpacing: s.letterSpacing }]}>{plate}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    borderColor: '#1a1a2e',
    overflow: 'hidden',
  },
  blueStrip: {
    backgroundColor: '#003DA5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nlText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  yellowBg: {
    backgroundColor: '#FFCC00',
    justifyContent: 'center',
  },
  plateText: {
    fontWeight: '900',
    color: '#1a1a2e',
  },
});
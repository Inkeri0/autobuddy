import React from 'react';
import { View, Text } from 'react-native';

interface StarDisplayProps {
  rating: number;
  size?: number;
}

function getStarType(position: number, rating: number): 'full' | 'half' | 'empty' {
  const diff = rating - (position - 1);
  if (diff >= 0.75) return 'full';
  if (diff >= 0.25) return 'half';
  return 'empty';
}

export default function StarDisplay({ rating, size = 16 }: StarDisplayProps) {
  const GOLD = '#F59E0B';
  const GRAY = '#D1D5DB';

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((pos) => {
        const type = getStarType(pos, rating);

        if (type === 'full') {
          return <Text key={pos} style={{ fontSize: size, color: GOLD }}>★</Text>;
        }

        if (type === 'half') {
          return (
            <View key={pos}>
              <Text style={{ fontSize: size, color: GRAY }}>★</Text>
              <View style={{ position: 'absolute', top: 0, left: 0, overflow: 'hidden', width: size * 0.55 }}>
                <Text style={{ fontSize: size, color: GOLD }}>★</Text>
              </View>
            </View>
          );
        }

        return <Text key={pos} style={{ fontSize: size, color: GRAY }}>☆</Text>;
      })}
    </View>
  );
}

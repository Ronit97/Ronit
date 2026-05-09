import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors, FontSize, FontWeight } from '../constants/theme';
import { getScoreColor, getScoreLabel } from '../services/healthScore';

interface Props {
  score: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  showScore?: boolean;
}

export default function HealthScoreRing({
  score,
  size = 140,
  strokeWidth = 12,
  showLabel = true,
  showScore = true,
}: Props) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const displayScore = useRef(new Animated.Value(0)).current;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const color = getScoreColor(score);
  const label = getScoreLabel(score);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: score / 100,
      duration: 1200,
      useNativeDriver: false,
    }).start();
    Animated.timing(displayScore, {
      toValue: score,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, [score]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        {/* Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={Colors.bgElevated}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress — use a static circle for now since AnimatedSvg needs extra setup */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - score / 100)}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.center}>
        {showScore && (
          <Text style={[styles.score, { color }]}>{Math.round(score)}</Text>
        )}
        {showLabel && (
          <Text style={styles.label} numberOfLines={1}>
            {label}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  score: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.extrabold,
    lineHeight: 30,
  },
  label: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
    marginTop: 2,
  },
});

import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

function squigglePath(phase: number, amplitude: number, frequency: number) {
  const width = 120;
  const mid = 20;
  const step = 4;
  let d = '';
  for (let x = 4; x <= 116; x += step) {
    const envelope = Math.sin((x / width) * Math.PI);
    const y = mid + Math.sin(phase + (x / width) * frequency * Math.PI * 2) * amplitude * envelope;
    d += d ? ` L ${x.toFixed(1)},${y.toFixed(1)}` : `M ${x.toFixed(1)},${y.toFixed(1)}`;
  }
  return d;
}

export default function FuturisticVoiceWave({
  isRecording,
  gradientId = 'waveGradient',
}: {
  isRecording: boolean;
  gradientId?: string;
}) {
  const [phase, setPhase] = useState(0);
  const breath = useRef(new Animated.Value(1)).current;
  const drift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let frame = 0;
    let raf = 0;
    const tick = () => {
      frame += isRecording ? 0.22 : 0.04;
      setPhase(frame);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isRecording]);

  useEffect(() => {
    const breathe = Animated.loop(
      Animated.sequence([
        Animated.timing(breath, {
          toValue: 1.08,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(breath, {
          toValue: 1,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    const slide = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, {
          toValue: 6,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(drift, {
          toValue: -6,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    if (isRecording) {
      breath.setValue(1);
      drift.setValue(0);
      return undefined;
    }
    breathe.start();
    slide.start();
    return () => {
      breathe.stop();
      slide.stop();
    };
  }, [isRecording, breath, drift]);

  const lines = isRecording
    ? [
        { amp: 16, freq: 2.1, opacity: 0.95, width: 2.6 },
        { amp: 11, freq: 3.4, opacity: 0.55, width: 1.8 },
        { amp: 7, freq: 4.6, opacity: 0.35, width: 1.4 },
        { amp: 4.5, freq: 1.5, opacity: 0.25, width: 1.2 },
      ]
    : [
        { amp: 7, freq: 1.35, opacity: 1, width: 2.5 },
        { amp: 9, freq: 1.35, opacity: 0.28, width: 4 },
      ];

  return (
    <Animated.View
      style={[
        styles.waveStage,
        {
          transform: isRecording
            ? [{ scale: 1 }]
            : [{ translateX: drift }, { scaleY: breath }, { scaleX: 1 }],
        },
      ]}
    >
      <View style={[styles.waveGlow, isRecording && styles.waveGlowHot]} />
      <Svg viewBox="0 0 120 40" width="192" height="64" style={styles.waveSvg}>
        <Defs>
          <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
            <Stop offset="50%" stopColor="#fbbf24" stopOpacity="1" />
            <Stop offset="100%" stopColor="#fde68a" stopOpacity="0.4" />
          </LinearGradient>
        </Defs>
        {lines.map((line, index) => (
          <Path
            key={`${isRecording ? 'live' : 'idle'}-${index}`}
            d={squigglePath(phase + index * 0.7, line.amp, line.freq)}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={line.width}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={line.opacity}
          />
        ))}
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  waveStage: {
    alignItems: 'center',
    height: 96,
    justifyContent: 'center',
    width: 192,
  },
  waveGlow: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderRadius: 96,
    height: 72,
    position: 'absolute',
    width: 168,
  },
  waveGlowHot: {
    backgroundColor: 'rgba(245, 158, 11, 0.22)',
    height: 88,
    width: 200,
  },
  waveSvg: {
    overflow: 'visible',
  },
});

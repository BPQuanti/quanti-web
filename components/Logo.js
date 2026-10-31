import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import QuantiLogo from '../src/components/QuantiLogo';
import { logoFullXml } from './logoXml';
import { colors, glow } from '../constants/theme';

const FULL_RATIO = 265 / 780;

export function LogoFull({ width = 168 }) {
  const height = Math.round(width * FULL_RATIO);
  return (
    <SvgXml
      xml={logoFullXml}
      width={width}
      height={height}
      accessibilityLabel="Quanti"
    />
  );
}

export function LogoMark({ width = 88, glowing = false }) {
  const mark = <QuantiLogo size={width} color="#FFFFFF" />;
  if (!glowing) {
    return mark;
  }
  return <View style={markGlow}>{mark}</View>;
}

const markGlow = {
  ...glow,
  backgroundColor: colors.bg,
  shadowOpacity: 0.45,
  shadowRadius: 28,
};

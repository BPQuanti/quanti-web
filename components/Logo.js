import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { logoFullXml, logoMarkXml } from './logoXml';
import { glow } from '../constants/theme';

const FULL_RATIO = 265 / 780;
const MARK_RATIO = 320 / 350;

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
  const height = Math.round(width * MARK_RATIO);
  const mark = (
    <SvgXml xml={logoMarkXml} width={width} height={height} accessibilityLabel="Quanti" />
  );
  if (!glowing) {
    return mark;
  }
  return <View style={markGlow}>{mark}</View>;
}

const markGlow = {
  ...glow,
  shadowOpacity: 0.45,
  shadowRadius: 28,
};

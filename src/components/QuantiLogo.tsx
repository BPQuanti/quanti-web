import Svg, { Circle, Path, type SvgProps } from 'react-native-svg';

type Props = SvgProps & {
  size?: number;
  color?: string;
};

/**
 * Classic Vector Q: ring + asymmetric compass needle through the SE perimeter,
 * pointing down-right at 45°. viewBox padding keeps the tail unclipped at 24px.
 */
export default function QuantiLogo({
  size = 24,
  color = '#FFFFFF',
  width,
  height,
  accessibilityLabel = 'Quanti',
  ...svgProps
}: Props) {
  const dim = width ?? height ?? size;

  return (
    <Svg
      width={dim}
      height={dim}
      viewBox="0 0 48 48"
      fill="none"
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      {...svgProps}
    >
      <Circle cx={21} cy={20} r={13} fill="none" stroke={color} strokeWidth={5} />
      <Path fill={color} d="M28.78 27.78 L28.64 33.58 L37.62 36.62 L33.3 28.91 Z" />
    </Svg>
  );
}

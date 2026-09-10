import { styles } from '.';

export default function Slider({
  value,
  max,
  onChange,
  style,
}: {
  value: number | undefined,
  max: number | undefined,
  onChange?: React.ChangeEventHandler<HTMLInputElement>,
  style?: React.CSSProperties,
}): React.ReactElement {
  return (
    <input
      type="range"
      value={value}
      max={max}
      onChange={onChange}
      style={{
        accentColor: styles.color.primary,
        ...style
      }}
    />
  );
};

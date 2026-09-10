import { styles } from '.';

export default function Grid({
  minWidth,
  style,
  children,
}: {
  minWidth: string,
  style?: React.CSSProperties,
  children: React.ReactElement[],
}): React.ReactElement {
  return (
    <div
      style={{
        display: 'grid',
        gap: styles.gap.sm,
        gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}, 1fr))`,
        ...style,
      }}
    >
      {children.map((c, i) => (
        <div key={i}>{c}</div>
      ))}
    </div>
  );
};

import { styles } from '.';

export default function Surface({
  style,
  children,
}: {
  style?: React.CSSProperties,
  children: React.ReactNode,
}): React.ReactElement {
  return (
    <div
      style={{
        backgroundColor: styles.color.grey[1],
        borderRadius: styles.gap.sm,
        boxShadow: `0px ${styles.gap.sm} ${styles.gap.sm} ${styles.color.shadow}`,
        padding: styles.gap.md,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

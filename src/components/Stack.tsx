import { styles } from '.';

export function Stack({
  style,
  orientation = 'column',
  children,
}: {
  style?: React.CSSProperties,
  orientation?: 'column' | 'row',
  children: React.ReactNode,
}): React.ReactElement {
  return (
    <div
      style={{
        alignItems: 'center',
        display: 'flex',
        flexDirection: orientation,
        gap: styles.gap.sm,
        width: '100%',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export function StackGap(): React.ReactElement {
  return (
    <div
      style={{ flex: 1 }}
    />
  );
};

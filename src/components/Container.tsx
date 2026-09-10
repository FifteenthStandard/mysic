export default function Container({
  style,
  children,
}: {
  style?: React.CSSProperties,
  children: React.ReactNode,
}): React.ReactElement {
  return (
    <div
      style={{
        marginInline: 'auto',
        position: 'relative',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

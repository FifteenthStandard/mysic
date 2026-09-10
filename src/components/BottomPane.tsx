import { styles, Surface } from '.';

export default function BottomPane({
  children,
}: {
  children: React.ReactNode,
}): React.ReactElement {

  return (
    <div
      style={{
        bottom: 0,
        left: 0,
        marginInline: 'inherit',
        maxWidth: 'inherit',
        position: 'fixed',
        right: 0,
      }}
    >
      <Surface
        style={{
          borderBottomLeftRadius: '0px',
          borderBottomRightRadius: '0px',
          borderStyle: 'solid',
          borderColor: styles.color.grey[1],
          borderWidth: '1px 1px 0px 1px',
          paddingBottom: '0px',
        }}
      >
        {children}
      </Surface>
    </div>
  );
};

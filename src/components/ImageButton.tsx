export default function ImageButton({
  onClick,
  src,
  style,
}: {
  onClick?: React.MouseEventHandler<HTMLButtonElement>,
  src: string,
  style?: React.CSSProperties,
}): React.ReactElement {

  return (
    <button
      onClick={onClick}
      style={{
        border: 'none',
        cursor: 'pointer',
        padding: 0,
      }}
    >
      <img
        src={src}
        style={{
          display: 'block',
          ...style,
        }}
      />
    </button>
  );
};

import { useEffect, useState } from 'react';
import { styles } from '.';

export default function IconButton({
  onClick,
  style,
  children,
}: {
  onClick?: React.MouseEventHandler<HTMLButtonElement>,
  style?: React.CSSProperties,
  children: React.ReactElement | string,
}): React.ReactElement {
  const [ active, setActive ] = useState(false);
  const [ focus, setFocus ] = useState(false);
  const [ hover, setHover ] = useState(false);

  useEffect(() => {
    function handle() {
      setActive(false);
      setFocus(false);
      setHover(false);
    };
    window.addEventListener('mouseup', handle);
    return () => window.removeEventListener('mouseup', handle);
  }, []);

  function handleClick(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    setActive(true);
    setTimeout(() => {
      setActive(false);
      setFocus(false);
      setHover(false);
    }, 200);
    onClick?.(event);
  };

  return (
    <button
      onClick={handleClick}
      onBlur={() => setFocus(false)}
      onFocus={() => setFocus(true)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onMouseDown={() => setActive(true)}
      style={{
        backgroundColor: active ? styles.color.grey[2] : (hover || focus) ? styles.color.grey[1] : 'inherit',
        border: 'none',
        borderRadius: '50%',
        cursor: 'pointer',
        fontSize: styles.fontsize.md,
        height: `calc(${styles.fontsize.md} * 2)`,
        padding: '0px',
        textAlign: 'center',
        width: `calc(${styles.fontsize.md} * 2)`,
        ...style,
      }}
    >
      {children}
    </button>
  );
};

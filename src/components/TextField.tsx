import { useState } from 'react';
import { styles } from '.';

export default function TextField({
  value,
  onChange,
  placeholder,
  type = "text",
  endButton,
  style,
}: {
  value?: string,
  onChange?: React.ChangeEventHandler<HTMLInputElement, HTMLInputElement>,
  placeholder?: string,
  type?: React.HTMLInputTypeAttribute,
  endButton?: React.ReactElement,
  style?: React.CSSProperties,
}): React.ReactElement {
  const [ focus, setFocus ] = useState(false);

  return (
    <div
      style={{ position: 'relative' }}
    >
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        type={type}
        onBlur={() => setFocus(false)}
        onFocus={() => setFocus(true)}
        style={{
          borderStyle: 'solid',
          borderColor: styles.color.grey[1],
          borderRadius: styles.gap.sm,
          borderWidth: '1px 1px 0px 1px',
          boxSizing: 'border-box',
          outlineColor: styles.color.primary,
          outlineOffset: '-2px',
          outlineStyle: focus ? 'solid' : 'none',
          outlineWidth: '2px',
          padding: styles.gap.md,
          width: '100%',
          ...style,
        }}
      />
      <div
        style={{
          color: styles.color.text.secondary,
          position: 'absolute',
          right: styles.gap.sm,
          top: styles.gap.sm,
        }}
      >
        {endButton}
      </div>
    </div>
  );
};

import { styles } from '.';

export default function CssBaseline(): React.ReactElement {
  const __html = `
    body {
      background-color: ${styles.color.grey[2]};
      color: ${styles.color.text.primary};
      font-family: 'Helvetica', sans-serif;
      font-size: ${styles.fontsize.md};
      margin: 0px;
      scrollbar-gutter: stable;

      button {
        background-color: inherit;
        color: inherit;
      }

      input {
        background-color: inherit;
        color: inherit;
        font-size: inherit;

        &::placeholder {
          color: ${styles.color.text.secondary};
        }
      }

      svg {
        color: inherit;
      }

      table {
        td, th {
          padding: ${styles.gap.sm};
        }
      }
    }
  `;
  return (
    <style dangerouslySetInnerHTML={{ __html }} />
  );
};

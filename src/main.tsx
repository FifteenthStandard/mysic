import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

window.addEventListener('error', function (event: ErrorEvent): void {
  alert(event.error);
});

window.addEventListener('unhandledrejection', function (event: PromiseRejectionEvent): void {
  alert(event.reason);
});

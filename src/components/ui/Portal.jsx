import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Portal component para renderizar children fuera de la jerarquía DOM actual
 * Útil para modals, tooltips, etc que necesitan escapar contenedores con overflow
 */
export default function Portal({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return createPortal(children, document.body);
}

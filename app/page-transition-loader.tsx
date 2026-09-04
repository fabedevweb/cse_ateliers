'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const MINIMUM_DISPLAY_MS = 280;

export default function PageTransitionLoader() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const shownAt = useRef(0);

  const show = () => {
    shownAt.current = Date.now();
    setVisible(true);
  };

  useEffect(() => {
    const remaining = Math.max(0, MINIMUM_DISPLAY_MS - (Date.now() - shownAt.current));
    const timeout = window.setTimeout(() => setVisible(false), remaining);
    return () => window.clearTimeout(timeout);
  }, [pathname]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target;
      const anchor = target instanceof Element ? target.closest('a') : null;
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return;

      const destination = new URL(anchor.href, window.location.href);
      const current = new URL(window.location.href);
      const changesPage = destination.origin === current.origin && (destination.pathname !== current.pathname || destination.search !== current.search);
      if (changesPage) show();
    };

    const handleBeforeUnload = () => show();
    const handlePageShow = () => setVisible(false);
    document.addEventListener('click', handleClick, true);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pageshow', handlePageShow);
    return () => {
      document.removeEventListener('click', handleClick, true);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, []);

  return (
    <div className={`page-loader${visible ? ' visible' : ''}`} aria-hidden={!visible}>
      <div className="page-loader-spinner" aria-hidden="true" />
      <p role="status" aria-live="polite">Chargement de l’atelier…</p>
    </div>
  );
}

'use client';

import { useEffect } from 'react';

export function LoginTracker() {
  useEffect(() => {
    if (sessionStorage.getItem('ds_visit_tracked')) return;
    sessionStorage.setItem('ds_visit_tracked', '1');
    fetch('/api/track-login', { method: 'POST' }).catch(() => {});
  }, []);

  return null;
}

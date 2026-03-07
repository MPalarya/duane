'use client';

import { useEffect } from 'react';
import Clarity from '@microsoft/clarity';

const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;

export function ClarityInit() {
  useEffect(() => {
    if (clarityId) {
      Clarity.init(clarityId);
    }
  }, []);

  return null;
}

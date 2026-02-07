import '@testing-library/jest-dom/vitest';
import axe from 'axe-core';

axe.configure({
  checks: [
    {
      // Disable color contrast checking, as it doesn't work in jsdom
      id: 'color-contrast',
      enabled: false,
    },
  ],
});

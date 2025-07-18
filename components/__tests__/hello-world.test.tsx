.eslintrc.json
{
  "extends": "next/core-web-vitals",
  "settings": {
    "react": {
      "version": "detect"
    }
  },
  "env": {
    "browser": true,
    "node": true
  },
  "rules": {
    "no-undef": "off"
  }
}

components/__tests__/hello-world.test.tsx
import React from 'react';
import { render } from '@testing-library/react';
import YourComponent from '../YourComponent'; // Replace with actual component paths

test('renders YourComponent without crashing', () => {
  render(<YourComponent />);
});
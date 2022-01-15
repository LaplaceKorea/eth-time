import { createStitches } from "@stitches/react";

export const { getCssText, globalCss, styled, theme } = createStitches({
  theme: {
    fonts: {
      sans: "IBM Plex Mono, -apple-system, system-ui, sans-serif",
    },
    colors: {
        foreground: '#333',
        blue: '#5568F3'
    }
  },
});

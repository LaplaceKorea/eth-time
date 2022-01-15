import { createStitches } from "@stitches/react";

export const { getCssText, globalCss, keyframes, styled, theme } =
  createStitches({
    theme: {
      fonts: {
        sans: "IBM Plex Mono, -apple-system, system-ui, sans-serif",
      },
      colors: {
        foreground: "#333",
        darkBlue: "hsla(229, 44%, 22%, 1)",
        blue: "hsla(233, 87%, 64%, 1)",
        yellow: "hsla(41, 99%, 65%, 1)",
        orange: "hsla(36, 87%, 64%, 1)",
        green: "hsla(103, 87%, 64%, 1)",
        red: "hsla(360, 87%, 64%, 1)",
      },
      media: {
        sm: "(min-width: 640px)",
        md: "(min-width: 768px)",
        lg: "(min-width: 1024px)",
      },
    },
  });

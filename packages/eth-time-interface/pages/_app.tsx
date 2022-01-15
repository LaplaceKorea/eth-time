import { AppProps } from "next/app";
import React from "react";
import { DAppProvider, Config, ChainId } from "@usedapp/core";
import { globalCss } from "../stitches.config";

const INFURA_API_KEY = process.env.NEXT_PUBLIC_INFURA_API_KEY ?? ''

const globalStyles = globalCss({
  "*": {
    boxSizing: "border-box",
    fontFamily: "$sans",
    "&::before": {
      boxSizing: "border-box",
    },
    "&::after": {
      boxSizing: "border-box",
    },
  },
  body: {
    fontFamily: "$sans",
    margin: 0,
    lineHeight: 1,
    color: "$foreground",
  },
  svg: {
    display: "block",
    verticalAlign: "middle",
  },
  a: {
    all: "unset",
  },
});

function GlobalStyles() {
  globalStyles();
  return null;
}

const web3Config: Config = {
  readOnlyChainId: ChainId.Rinkeby,
  readOnlyUrls: {
    [ChainId.Rinkeby]: `https://rinkeby.infura.io/v3/${INFURA_API_KEY}`,
  },
};

export default function App({ Component, pageProps }: AppProps) {
  return (
    <DAppProvider config={web3Config}>
      <GlobalStyles />
      <Component {...pageProps} />
    </DAppProvider>
  );
}

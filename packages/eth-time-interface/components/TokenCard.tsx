import { BigNumber } from "ethers";
import React from "react";
import { useMetadata } from "../lib/hooks";
import { styled } from "../stitches.config";

const TokenCardRoot = styled("div", {
  backgroundColor: "pink",
});

interface TokenCardProps {
  id: BigNumber;
}

export function TokenCard({ id }: TokenCardProps) {
  const meta = useMetadata(id);

  if (!meta) {
    return null;
  }
  return (
    <TokenCardRoot>
      <img src={meta.image} />
    </TokenCardRoot>
  );
}

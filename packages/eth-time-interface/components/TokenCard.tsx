import { BigNumber } from "ethers";
import React from "react";
import { useMetadata } from "../lib/hooks";
import { styled } from "../stitches.config";

const TokenCardRoot = styled("div", {
  cursor: "pointer",
});

interface TokenCardProps {
  id: BigNumber;
  onClick: () => void;
}

export function TokenCard({ id, onClick }: TokenCardProps) {
  const meta = useMetadata(id);

  if (!meta) {
    return null;
  }
  return (
    <TokenCardRoot onClick={onClick}>
      <img src={meta.image} />
    </TokenCardRoot>
  );
}

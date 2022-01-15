import { ChainId, TransactionStatus, useEthers, getStoredTransactionState } from "@usedapp/core";
import React, { useCallback } from "react";

import { styled, theme } from "../stitches.config";

const ButtonRoot = styled("button", {
  padding: "1rem 3rem",
  fontSize: "48px",
  fontWeight: "bold",
  color: "$blue",
  borderRadius: 10,
  backgroundColor: "white",
  border: "1px solid $blue",
  boxShadow: `15px 15px 0px ${theme.colors.yellow}`,
  cursor: "pointer",
  transition: "125ms",
  transform: "translateY(0)",
  "&:hover": {
    boxShadow: `10px 10px 0px ${theme.colors.yellow}`,
    transform: "translateY(5px)",
  },
  "&:active": {
    boxShadow: "0px 0px 0px #FEC750",
    transform: "translateY(15px)",
  },
});

interface TheButtonProps {
  transactionStatus: TransactionStatus;
  onClick: (account: string) => void;
}

export function TheButton({ onClick, transactionStatus }: TheButtonProps) {
  const { account, activateBrowserWallet, chainId, library } = useEthers();

  const requestNetworkChange = useCallback(async () => {
    if (account && library) {
      const params = {
        chainId: "0x4",
      };
      await library.send("wallet_switchEthereumChain", [params]);
    }
  }, [account, library]);

  const correctNetwork = chainId === ChainId.Rinkeby;

  if (transactionStatus.status == 'PendingSignature') {
      return <ButtonRoot disabled={true}>Mint Now</ButtonRoot>;
  }

  if (account) {
    if (correctNetwork) {
      return <ButtonRoot onClick={() => onClick(account)}>Mint Now</ButtonRoot>;
    }
    return (
      <ButtonRoot onClick={requestNetworkChange}>Switch to Rinkeby</ButtonRoot>
    );
  }

  return (
    <ButtonRoot onClick={() => activateBrowserWallet()}>
      Connect Wallet
    </ButtonRoot>
  );
}

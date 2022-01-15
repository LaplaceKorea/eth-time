import { BigNumber } from "ethers";
import * as Dialog from "@radix-ui/react-dialog";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { styled, keyframes, theme } from "../stitches.config";
import { useMetadata, useOwnerOf, useTransfer } from "../lib/hooks";
import { ContentPreview } from "./ContentPreview";
import { useEthers } from "@usedapp/core";
import { useEnsName, useMainnetProvider, useResolveAddress } from "../lib/web3";
import Davatar from "@davatar/react";

const overlayShow = keyframes({
  "0%": { opacity: 0 },
  "100%": { opacity: 1 },
});

const contentShow = keyframes({
  "0%": { opacity: 0, transform: "translate(-50%, -48%) scale(.96)" },
  "100%": { opacity: 1, transform: "translate(-50%, -50%) scale(1)" },
});

const Overlay = styled(Dialog.Overlay, {
  background: "hsla(0, 100%, 100%, 0.7)",
  position: "fixed",
  inset: 0,
  backdropFilter: "blur(5px)",
  "@media (prefers-reduced-motion: no-preference)": {
    animation: `${overlayShow} 150ms cubic-bezier(0.16, 1, 0.3, 1)`,
  },
});

const Content = styled(Dialog.Content, {
  backgroundColor: "white",
  outline: "none",
  position: "fixed",
  borderRadius: "10px",
  border: `1px solid ${theme.colors.darkBlue}`,
  boxShadow: `15px 15px 0px ${theme.colors.blue}`,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90vw",
  maxWidth: "100rem",
  height: "85vh",
  maxHeight: "80rem",
  padding: "2rem",
  "@media (prefers-reduced-motion: no-preference)": {
    animation: `${contentShow} 150ms cubic-bezier(0.16, 1, 0.3, 1)`,
  },
  "&:focus": { outline: "none" },
  "@md": {
    padding: "4rem",
  },
});

const InformationModalRoot = styled("div", {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  height: "100%",
  flexDirection: "column",
  width: "100%",
  "@md": {
    flexDirection: "row",
  },
});

const PreviewRoot = styled("div", {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: "100%",
  height: "100%",
  position: "relative",
  "@md": {
    width: "50%",
  },
});

const DataRoot = styled("div", {
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  alignItems: "flex-start",
  paddingTop: "2rem",
  paddingLeft: "0",
  "@md": {
    width: "50%",
    paddingTop: "0",
    paddingLeft: "2rem",
  },
});

const Title = styled("h3", {
  color: theme.colors.darkBlue,
  fontSize: 38,
  margin: 0,
  overflow: "hidden",
  lineHeight: 1,
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  "@md": {
    fontSize: 64,
  },
});

const InfoRow = styled("div", {
  display: "flex",
  flexDirection: "column",
  width: "100%",
});

const OwnerRoot = styled("div", {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "flex-start",
  height: "3rem"
});

const AvatarRoot = styled("div", {
  flexGrow: 0,
  flexShrink: 0,
  marginRight: "1rem",
})

const InfoPar = styled("p", {
  color: theme.colors.darkBlue,
  fontSize: 18,
  overflow: "hidden",
  lineHeight: 1,
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  "@md": {
    fontSize: 24,
  },
});

const TransferRow = styled("div", {
  display: "flex",
  flexDirection: "column",
  gap: "2rem",
  width: "100%",
  justifyContent: "space-between",
  "@lg": {
    flexDirection: "row",
  },
});

const TransferInput = styled("input", {
  padding: "1rem 0.5rem",
  fontSize: 24,
  borderRadius: "10px",
  color: theme.colors.blue,
  flexGrow: 1,
  border: `1px solid ${theme.colors.foreground}`,
  boxShadow: `5px 5px 0px ${theme.colors.yellow}`,
  "&:focus": {
    border: `1px solid ${theme.colors.blue}`,
    outline: "none",
  },
});

const TransferButton = styled("button", {
  fontSize: 24,
  background: "white",
  padding: "1rem 0.5rem",
  borderRadius: "10px",
  border: `1px solid ${theme.colors.blue}`,
  color: theme.colors.blue,
  "&:enabled": {
    cursor: "pointer",
  },
  boxShadow: `5px 5px 0px ${theme.colors.yellow}`,
  transform: "translateY(0)",
  "&:hover": {
    boxShadow: `3px 3px 0px ${theme.colors.yellow}`,
    transform: "translateY(2px)",
  },
  "&:focus": {
    outline: "none",
  },
  "&:active": {
    boxShadow: `0px 0px 0px ${theme.colors.yellow}`,
    transform: "translateY(5px)",
  },
});

interface InformationModalProps {
  id: BigNumber;
}

export function InformationModal({ id }: InformationModalProps) {
  const { account } = useEthers();

  const meta = useMetadata(id);
  const owner = useOwnerOf(id);
  const mainnetProvider = useMainnetProvider();

  const ownerName = useEnsName(owner);

  const [destination, setDestination] = useState("");
  const destinationAddress = useResolveAddress(destination);

  const { state, resetState, send } = useTransfer();

  const transfer = useCallback(() => {
    if (account && destinationAddress) {
      send(account, destinationAddress, id);
    }
  }, [account, destination, destinationAddress, id]);

  const avatar = useMemo(() => {
    if (owner) {
      return <Davatar size={32} address={owner} provider={mainnetProvider} />;
    }
    return null;
  }, [owner, mainnetProvider]);

  useEffect(() => {
    if (state.status === "Success") {
      setDestination("");
      resetState();
    }
  }, [state, setDestination, resetState]);

  return (
    <InformationModalRoot>
      <PreviewRoot>
        <ContentPreview data={meta?.image} />
      </PreviewRoot>
      <DataRoot>
        <InfoRow>
          <Title>{meta?.name}</Title>
          <OwnerRoot>
            <AvatarRoot>
            {avatar}
            </AvatarRoot>
            <InfoPar>{ownerName}</InfoPar>
          </OwnerRoot>
        </InfoRow>
        <TransferRow>
          <TransferInput
            placeholder="Transfer to"
            onChange={(evt) => setDestination(evt.target.value)}
            value={destination}
          />
          <TransferButton
            disabled={!account || !destinationAddress}
            onClick={transfer}
          >
            Transfer
          </TransferButton>
        </TransferRow>
      </DataRoot>
    </InformationModalRoot>
  );
}

InformationModal.Root = Dialog.Root;
InformationModal.Portal = Dialog.Portal;
InformationModal.Overlay = Overlay;
InformationModal.Content = Content;

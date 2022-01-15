import { BigNumber } from "ethers";
import * as Dialog from "@radix-ui/react-dialog";
import React, { useCallback, useState } from "react";
import { styled, keyframes, theme } from "../stitches.config";
import { useMetadata, useOwnerOf, useTransfer } from "../lib/hooks";
import { ContentPreview } from "./ContentPreview";
import { useEthers } from "@usedapp/core";

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
  padding: "4rem",
  "@media (prefers-reduced-motion: no-preference)": {
    animation: `${contentShow} 150ms cubic-bezier(0.16, 1, 0.3, 1)`,
  },
  "&:focus": { outline: "none" },
});

const InformationModalRoot = styled("div", {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  height: "100%",
  width: "100%",
});

const PreviewRoot = styled("div", {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: "50%",
  height: "100%",
  position: "relative",
});

const DataRoot = styled("div", {
  width: "50%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  alignItems: "flex-start",
});

const Title = styled("h3", {
  color: theme.colors.darkBlue,
  fontSize: 64,
  margin: 0,
  overflow: "hidden",
  lineHeight: 1,
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

const InfoRow = styled("div", {
  display: "flex",
  flexDirection: "column",
  width: "100%",
});

const InfoPar = styled("p", {
  color: theme.colors.darkBlue,
  fontSize: 24,
  overflow: "hidden",
  lineHeight: 1,
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

const TransferRow = styled("div", {
  display: "flex",
  flexDirection: "row",
  gap: "2rem",
  width: "100%",
  justifyContent: "space-between",
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

  const [destination, setDestination] = useState("");

  const { state, resetState, send } = useTransfer();

  const transfer = useCallback(() => {
    if (account && destination) {
      send(account, destination, id);
    }
  }, [account, destination, id]);

  return (
    <InformationModalRoot>
      <PreviewRoot>
        <ContentPreview data={meta?.image} />
      </PreviewRoot>
      <DataRoot>
        <InfoRow>
          <Title>{meta?.name}</Title>
          <InfoPar>Owner: {owner}</InfoPar>
        </InfoRow>
        <TransferRow>
          <TransferInput
            placeholder="Transfer to"
            onChange={(evt) => setDestination(evt.target.value)}
            value={destination}
          />
          <TransferButton disabled={!account} onClick={transfer}>
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

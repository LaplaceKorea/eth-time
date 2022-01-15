import { useEthers } from "@usedapp/core";
import { BigNumber } from "ethers";
import React, { useCallback, useEffect } from "react";
import { Notifications } from "../components/Notifications";
import { TheButton } from "../components/TheButton";
import { TokenCard } from "../components/TokenCard";
import {
  useAccountCollection,
  useAvailableId,
  useEthTimeBalance,
  useEthTimeImagePreview,
  useMint,
} from "../lib/hooks";
import { styled } from "../stitches.config";

const PageRoot = styled("div", {});

const HeroRoot = styled("div", {
  display: "grid",
  gridTemplateRows: "auto 600px auto",
  height: "95vh",
});

const CenteredRow = styled("div", {
  display: "flex",
  justifyContent: "center",
});

const Title = styled("h1", {
  fontSize: 72,
  textShadow: "6px -6px 0px #FEC750",
});

const CollectionRoot = styled('div', {
  maxWidth: '100rem',
  margin: '4rem auto',
  display: 'grid',
  justifyContent: 'center',
  gridTemplateColumns: 'repeat(auto-fill, 20rem)',
  gap: '4rem',
})

const NotificationsRoot = styled("div", {
  position: "absolute",
  top: 0,
  right: 0,
});

interface ImagePreviewProps {
  account?: string;
  id?: BigNumber;
}

function ImagePreview({ account, id }: ImagePreviewProps) {
  const imagePreview = useEthTimeImagePreview(account, id);
  if (imagePreview) {
    return <img src={imagePreview} />;
  }
  return <div>gm</div>;
}

export default function IndexPage() {
  const { account } = useEthers();

  const userCollection = useAccountCollection(account);

  const { state, resetState, send } = useMint();
  const id = useAvailableId();

  const mint = useCallback(
    (account: string) => {
      send(account, id);
    },
    [send, id]
  );

  useEffect(() => {
    // let user mint a new eth time nft
    if (
      state.status === "Exception" ||
      state.status === "Fail" ||
      state.status === "Success"
    ) {
      resetState();
    }
  }, [state.status, resetState]);

  return (
    <PageRoot>
      <NotificationsRoot>
        <Notifications />
      </NotificationsRoot>
      <HeroRoot>
        <CenteredRow>
          <Title>Ξ Time</Title>
        </CenteredRow>
        <CenteredRow>
          <ImagePreview account={account} id={id} />
        </CenteredRow>
        <CenteredRow>
          <TheButton onClick={mint} transactionStatus={state} />
        </CenteredRow>
      </HeroRoot>
      <CollectionRoot>
      {userCollection.map((id) => (
        <TokenCard key={id.toHexString()} id={id} />
      ))}
      </CollectionRoot>
    </PageRoot>
  );
}

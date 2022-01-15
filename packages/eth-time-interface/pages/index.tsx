import { useEthers } from "@usedapp/core";
import { BigNumber, ethers } from "ethers";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ContentPreview } from "../components/ContentPreview";
import { InformationModal } from "../components/InformationModal";
import { Notifications } from "../components/Notifications";
import { TheButton } from "../components/TheButton";
import { TokenCard } from "../components/TokenCard";
import {
  useAccountCollection,
  useAvailableId,
  useEthTimeImagePreview,
  useMint,
} from "../lib/hooks";
import { styled, theme } from "../stitches.config";

const PageRoot = styled("div", {
  backgroundImage: "url('/images/pattern.png')"
});

const HeroRoot = styled("div", {
  display: "flex",
  flexDirection: "column",
  height: "90vh",
});

const CenteredRow = styled("div", {
  display: "flex",
  justifyContent: "center",
  padding: "2rem 0",
});

const TitleRoot = styled(CenteredRow, {
  alignItems: "center",
  flexDirection: "column",
  background: "white"
});

const ImagePreviewRoot = styled(CenteredRow, {
  flexGrow: 1,
  overflow: "hidden",
});

const Title = styled("h1", {
  fontSize: 72,
  textShadow: "6px -6px 0px #FEC750",
  margin: 0,
});

const MyCollectionTitle = styled("h2", {
  fontSize: 48,
  color: theme.colors.blue,
  textShadow: `20px 20px 0px ${theme.colors.yellow}`,
  margin: "0 auto",
  width: "100%",
  maxWidth: "100rem"
});

const SectionDivider = styled("div", {
  width: "100%",
  height: "4rem",
  marginTop: "3rem",
  background: 'url("/images/eth-time-1.png")',
  backgroundRepeat: "repeat-x",
  variants: {
    pattern: {
      0: {
        backgroundImage: 'url("/images/eth-time-0.png")',
      },
      1: {
        backgroundImage: 'url("/images/eth-time-1.png")',
      },
    },
  },
});

const Spacer = styled("div", {
  width: "100%",
  height: "8rem",
})

const CollectionRoot = styled("div", {
  maxWidth: "100rem",
  margin: "4rem auto",
  display: "grid",
  justifyContent: "center",
  gridTemplateColumns: "repeat(auto-fill, 20rem)",
  gap: "4rem",
});

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
  const nonnulAccount = ethers.constants.AddressZero;
  const imagePreview = useEthTimeImagePreview(nonnulAccount, id);
  return <ContentPreview data={imagePreview} />;
}

export default function IndexPage() {
  const { account } = useEthers();

  const userCollection = useAccountCollection(account);

  const [currentId, setCurrentId] = useState<BigNumber | undefined>(undefined);

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

  const collectionContent = useMemo(() => {
    if (userCollection.length == 0) {
      return <Spacer />;
    }

    return (
      <React.Fragment>
        <CenteredRow>
          <MyCollectionTitle>My Collection</MyCollectionTitle>
        </CenteredRow>
        <CollectionRoot>
          {userCollection.map((id) => (
            <TokenCard
              key={id.toHexString()}
              id={id}
              onClick={() => setCurrentId(id)}
            />
          ))}
        </CollectionRoot>
        <InformationModal.Root
          open={!!currentId}
          onOpenChange={() => setCurrentId(undefined)}
        >
          <InformationModal.Portal>
            <InformationModal.Overlay />
            <InformationModal.Content>
              {currentId && <InformationModal id={currentId} />}
            </InformationModal.Content>
          </InformationModal.Portal>
        </InformationModal.Root>
      </React.Fragment>
    );
  }, [currentId, setCurrentId, userCollection]);

  return (
    <PageRoot>
      <NotificationsRoot>
        <Notifications />
      </NotificationsRoot>
      <HeroRoot>
        <TitleRoot>
          <Title>Ξ Time</Title>
          <SectionDivider pattern={0} />
        </TitleRoot>
        <ImagePreviewRoot>
          <ImagePreview account={account} id={id} />
        </ImagePreviewRoot>
        <CenteredRow>
          <TheButton onClick={mint} transactionStatus={state} />
        </CenteredRow>
      </HeroRoot>
      <SectionDivider pattern={1} />
      {collectionContent}
    </PageRoot>
  );
}

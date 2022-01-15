import { useContractCall, useContractFunction, useEthers } from "@usedapp/core";
import { BigNumber, Contract, ethers, Event } from "ethers";
import { Interface } from "ethers/lib/utils";
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import ETH_TIME_ABI from "../abis/EthTime.json";

const ETH_TIME_ADDRESS = "0x5ef5c7bc55265a400d7bba8dfaedc6146d778919";

const EthTimeInterface = new Interface(ETH_TIME_ABI.abi);

export function useOwnerOf(id: BigNumber | undefined): string | undefined {
  const [owner] =
    useContractCall(
      id && {
        abi: EthTimeInterface,
        address: ETH_TIME_ADDRESS,
        method: "ownerOf",
        args: [id],
      }
    ) ?? [];
  return owner;
}

export function useEthTimeBalance(
  user: string | undefined | null
): number | undefined {
  const [balance, setBalance] = useState(undefined);

  const [rawBalance] =
    useContractCall(
      user && {
        abi: EthTimeInterface,
        address: ETH_TIME_ADDRESS,
        method: "balanceOf",
        args: [user],
      }
    ) ?? [];

  useEffect(() => {
    if (rawBalance && BigNumber.isBigNumber(rawBalance)) {
      setBalance(rawBalance.toNumber());
    }
  }, [rawBalance, setBalance]);

  return balance;
}

export function useMint() {
  const contract = new Contract(ETH_TIME_ADDRESS, EthTimeInterface);
  return useContractFunction(contract, "mint", { transactionName: "Mint" });
}

export function useTransfer() {
  const contract = new Contract(ETH_TIME_ADDRESS, EthTimeInterface);
  return useContractFunction(
    contract,
    "safeTransferFrom(address,address,uint256)",
    { transactionName: "Transfer" }
  );
}

interface Metadata {
  name: string;
  description: string;
  image: string;
}

export function useMetadata(id: BigNumber | undefined): Metadata | undefined {
  const [meta, setMeta] = useState(undefined);

  const [response] =
    useContractCall(
      id && {
        abi: EthTimeInterface,
        address: ETH_TIME_ADDRESS,
        method: "tokenURI",
        args: [id],
      }
    ) ?? [];

  useEffect(() => {
    if (response) {
      const newMetaString = Buffer.from(response, "base64")
        .toString()
        .slice(28);
      const newMeta = JSON.parse(newMetaString);
      setMeta(newMeta as Metadata);
    }
  }, [response, setMeta]);

  return meta;
}

export function useEthTimeImagePreview(
  user: string | undefined,
  id: BigNumber | undefined
): string | undefined {
  const [svg, setSvg] = useState(undefined);

  const [response] =
    useContractCall(
      user &&
        id && {
          abi: EthTimeInterface,
          address: ETH_TIME_ADDRESS,
          method: "tokenImagePreview",
          args: [user, id],
        }
    ) ?? [];

  useEffect(() => {
    if (response) {
      setSvg(`data:image/svg+xml;base64,${response}`);
    }
  }, [response, setSvg]);

  return svg;
}

// pick random ids until one of them is available
export function useAvailableId(): BigNumber | undefined {
  const [id, setId] = useState(undefined);

  const randomBigNumber = useCallback(() => {
    const bytes = ethers.utils.randomBytes(32);
    return ethers.BigNumber.from(bytes);
  }, []);

  const [candidateId, setCandidateId] = useState(() => {
    return randomBigNumber();
  });

  const [owner] =
    useContractCall({
      abi: EthTimeInterface,
      address: ETH_TIME_ADDRESS,
      method: "ownerOf",
      args: [candidateId],
    }) ?? [];

  useEffect(() => {
    if (owner === ethers.constants.AddressZero) {
      setId(candidateId);
    } else {
      setCandidateId(randomBigNumber());
    }
  }, [owner, setId, randomBigNumber]);

  return id;
}

interface TokenTransfer {
  from: string;
  to: string;
  id: BigNumber;
}

interface AccountTokensInitializing {
  type: "initializing";
  buffer: TokenTransfer[];
}

interface AccountTokensReady {
  type: "ready";
  owned: BigNumber[];
}

type AccountTokensState = AccountTokensInitializing | AccountTokensReady;

interface AccountTokensIncomingTransfer {
  type: "incoming";
  transfer: TokenTransfer;
}

interface AccountTokensOutgoingTransfer {
  type: "outgoing";
  transfer: TokenTransfer;
}

interface AccountTokensInitialize {
  type: "initialize";
  account: string;
  incomingTransfers: Event[];
  outgoingTransfers: Event[];
}

type AccountTokensAction =
  | AccountTokensIncomingTransfer
  | AccountTokensOutgoingTransfer
  | AccountTokensInitialize;

function accountTokensReducer(
  state: AccountTokensState,
  action: AccountTokensAction
): AccountTokensState {
  if (state.type === "initializing") {
    if (action.type === "incoming" || action.type === "outgoing") {
      return {
        ...state,
        buffer: [...state.buffer, action.transfer],
      };
    }
    // compute initial set of owned tokens
    // keep them sorted by the last block they were used
    const ownedWithBlock = new Map<string, [BigNumber, number]>();
    const account = action.account.toLowerCase();
    const allEvents = [
      ...action.incomingTransfers,
      ...action.outgoingTransfers,
    ].sort((a, b) => a.blockNumber - b.blockNumber);
    allEvents.forEach((event) => {
      const { from, to, id } = event.args;
      if (BigNumber.isBigNumber(id)) {
        if (to.toLowerCase() == account) {
          // incoming
          ownedWithBlock.set(id.toHexString(), [id, event.blockNumber]);
        } else if (from.toLowerCase() == account) {
          ownedWithBlock.delete(id.toHexString());
        }
      }
    });

    const owned = [...ownedWithBlock]
      .sort(([_ida, [_idbna, a]], [_idb, [_idbnb, b]]) => b - a)
      .map(([_id, [bn, _b]]) => bn);

    return {
      type: "ready",
      owned,
    };
  } else if (state.type === "ready") {
    if (action.type === "incoming") {
      if (action.transfer.from == action.transfer.to) {
        // self transfer, move to front
        const newOwned = [
          action.transfer.id,
          ...state.owned.filter((id) => !id.eq(action.transfer.id)),
        ];
        return {
          ...state,
          owned: newOwned,
        };
      }

      const newOwned = [action.transfer.id, ...state.owned];
      return {
        ...state,
        owned: newOwned,
      };
    } else if (action.type == "outgoing") {
      if (action.transfer.from == action.transfer.to) {
        // self transfer
        return state;
      }
      const newOwned = state.owned.filter((id) => !id.eq(action.transfer.id));
      return {
        ...state,
        owned: newOwned,
      };
    }
  }
  return state;
}

// keep track of nfts owned by user by listening to events
export function useAccountCollection(account: string | undefined) {
  const { library } = useEthers();
  const [state, dispatch] = useReducer(accountTokensReducer, {
    type: "initializing",
    buffer: [],
  });

  const onIncomingTransfer = useCallback(
    (from: string, to: string, id: BigNumber) => {
      const transfer = { from, to, id };
      dispatch({ type: "incoming", transfer });
    },
    [dispatch]
  );

  const onOutgoingTransfer = useCallback(
    (from: string, to: string, id: BigNumber) => {
      const transfer = { from, to, id };
      dispatch({ type: "outgoing", transfer });
    },
    [dispatch]
  );

  const contract = useMemo(() => {
    if (library) {
      const contract = new Contract(ETH_TIME_ADDRESS, EthTimeInterface);
      return contract.connect(library);
    }
    return null;
  }, [library]);

  // initialize state and subscribe to events
  useEffect(() => {
    const initializeCollection = async () => {
      if (!account || !contract) {
        return;
      }
      const incomingTransferFilter = contract.filters.Transfer(null, account);
      const outgoingTransferFilter = contract.filters.Transfer(account, null);
      const incomingTransfers = await contract.queryFilter(
        incomingTransferFilter
      );
      const outgoingTransfers = await contract.queryFilter(
        outgoingTransferFilter
      );
      dispatch({
        type: "initialize",
        account,
        incomingTransfers,
        outgoingTransfers,
      });
    };

    if (account && contract) {
      const incomingTransferFilter = contract.filters.Transfer(null, account);
      const outgoingTransferFilter = contract.filters.Transfer(account, null);
      contract.on(incomingTransferFilter, onIncomingTransfer);
      contract.on(outgoingTransferFilter, onOutgoingTransfer);
      initializeCollection();
      return () => {
        contract.off(incomingTransferFilter, onIncomingTransfer);
        contract.off(outgoingTransferFilter, onOutgoingTransfer);
      };
    }
  }, [account, contract, dispatch]);

  return state.type === "ready" ? state.owned : [];
}

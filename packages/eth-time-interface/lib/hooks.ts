import { useContractCall, useContractFunction } from "@usedapp/core";
import { BigNumber, Contract, ethers } from "ethers";
import { Interface } from "ethers/lib/utils";
import { useCallback, useEffect, useState } from "react";
import ETH_TIME_ABI from "../abis/EthTime.json";

const ETH_TIME_ADDRESS = "0x4573f780c4cfba802f51e9edc37c7adc05154218";

const EthTimeInterface = new Interface(ETH_TIME_ABI.abi);

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
    return ethers.BigNumber.from(bytes)
  }, [])

  const [candidateId, setCandidateId] = useState(() => {
      return randomBigNumber()
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
        setCandidateId(randomBigNumber())
    }
  }, [owner, setId, randomBigNumber]);

  return id;
}

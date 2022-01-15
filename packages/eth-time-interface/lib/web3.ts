import * as ethers from "ethers";
import { useEffect, useMemo, useState } from "react";

export const INFURA_API_KEY = process.env.NEXT_PUBLIC_INFURA_API_KEY ?? "";

export function useMainnetProvider() {
  return useMemo(() => {
    return new ethers.providers.JsonRpcProvider(
      `https://mainnet.infura.io/v3/${INFURA_API_KEY}`
    );
  }, []);
}

export function useEnsName(account: string | undefined): string | undefined {
  const [name, setName] = useState(undefined);
  const provider = useMainnetProvider();

  useEffect(() => {
    if (account) {
      provider
        .lookupAddress(account)
        .then((name) => {
          if (name) {
            setName(name);
          } else {
            setName(account);
          }
        })
        .catch((err) => {
          setName(account);
        });
    }
  }, [provider, account, setName]);
  return name;
}

export function useResolveAddress(name: string | undefined): string | undefined {
  const [address, setAddress] = useState(undefined);
  const provider = useMainnetProvider();

  useEffect(() => {
      if (name && name.endsWith('.eth')) {
          provider.resolveName(name).then((resolved) => {
              setAddress(resolved)
          }).catch(err => {
              console.log(err)
          })
      }
  }, [provider, name, setAddress])

  return address
}
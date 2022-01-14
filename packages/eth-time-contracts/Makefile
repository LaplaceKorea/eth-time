all    :; dapp build
clean  :; dapp clean
test   :; dapp test
deploy :; dapp create EthTimeContracts

SOLC_VERSION := 0_8_10
solc:; nix-env -f https://github.com/dapphub/dapptools/archive/master.tar.gz -iA solc-static-versions.solc_${SOLC_VERSION}
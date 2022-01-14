all     :; dapp build
clean   :; dapp clean
test    :; dapp test
testnet :; ganache-cli

SOLC_VERSION := 0_8_10
solc:; nix-env -f https://github.com/dapphub/dapptools/archive/master.tar.gz -iA solc-static-versions.solc_${SOLC_VERSION}
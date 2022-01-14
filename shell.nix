{
  pkgs ? import <nixpkgs> {}
}:

let
  dt-pkgs = import (builtins.fetchGit rec {
    name = "dapptools-${rev}";
    url = https://github.com/dapphub/dapptools;
    rev = "249c8cca1a4806b8bc47882ca7214ab380d29082";
  }) {};

in
  pkgs.mkShell {
    src = null;
    name = "eth-time";
    buildInput = [
      pkgs.nix
      pkgs.gnumake
      pkgs.yarn
      pkgs.jq
      pkgs.tcl
      dt-pkgs.dapp
      dt-pkgs.seth
      dt-pkgs.go-ethereum-unlimited
      dt-pkgs.hevm
    ];
  }
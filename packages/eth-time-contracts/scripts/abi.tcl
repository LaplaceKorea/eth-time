# Get the contract abi

set where [file dirname [info script]]
source [file join $where common.tcl]

set network [lindex $argv 0]
set contractName "EthTime"
set contractPath "src/EthTime.sol"

set contractPattern ".contracts\[\"$contractPath\"\].$contractName"

set abi [exec jq -r "$contractPattern.abi" out/dapp.sol.json]

puts $abi
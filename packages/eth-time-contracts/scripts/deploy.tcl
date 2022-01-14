proc ::rpcUrl {network} {
    return "http://localhost:8545"
}

proc ::setupEnv {network} {
    set rpcUrl [::rpcUrl $network] 
    set ::env(ETH_RPC_URL) $rpcUrl

    if [info exists ::env(ETH_FROM)] {
        set ethFrom $::env(ETH_FROM)
    } else {
        error "missing ETH_FROM"
    }
}

set network [lindex $argv 0]
set contractName [lindex $argv 1]
set contractPath [lindex $argv 2]

::setupEnv $network

set contractPattern ".contracts\[\"$contractPath\"\].$contractName"
set abi [exec jq -r "$contractPattern.abi" out/dapp.sol.json]
set sig [exec echo $abi | seth --abi-constructor]
set bytecode 0x[exec jq -r "$contractPattern.evm.bytecode.object" out/dapp.sol.json]
set gasCost [exec seth estimate --create $bytecode $sig]

set address [exec -ignorestderr seth send --create $bytecode $sig --gas $gasCost]

puts stderr "ETH TIME ADDRESS: $address"
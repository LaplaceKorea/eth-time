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

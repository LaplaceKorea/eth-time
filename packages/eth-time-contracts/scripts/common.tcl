proc ::rpcUrl {network} {
    set infuraApiKey $::env(INFURA_API_KEY)
    switch $network {
        "localhost" {
            return "http://localhost:8545"
        }
        "rinkeby" {
            set networkPrefix "https://rinkeby.infura.io/v3"
        }
        default {
            error "invalid network $network"
        }
    }
    return "$networkPrefix/$infuraApiKey"
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

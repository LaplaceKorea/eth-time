# Execute seth with the correct ETH_RPC_URL

set where [file dirname [info script]]
source [file join $where common.tcl]

set network [lindex $argv 0]
set args [lrange $argv 1 end]

::setupEnv $network

exec seth {*}$args  <@stdin >@stdout 2>@stderr

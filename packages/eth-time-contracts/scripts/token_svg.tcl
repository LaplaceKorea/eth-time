# Retrieves and saves the SVG content of an NFT

set where [file dirname [info script]]
source [file join $where common.tcl]

set network [lindex $argv 0]
set address [lindex $argv 1]
set tokenId [lindex $argv 2]
set outfile [lindex $argv 3]

::setupEnv $network

set selector "tokenURI(uint256)"
set encMeta [exec seth call $address $selector $tokenId | seth --to-ascii]

set meta [exec base64 -di << [string trim $encMeta]]
# remove data:application/json;base64,
set meta [string range $meta 28 end]

puts $meta

set encImage [exec jq -r ".image" << $meta]
# remove data:image/svg+xml;base64,
set encImage [string range $encImage 26 end]

set image [exec base64 -di << $encImage]

set fp [open $outfile "w"]
puts $fp $image
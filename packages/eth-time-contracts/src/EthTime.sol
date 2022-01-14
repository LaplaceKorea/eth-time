// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity 0.8.10;

import {ERC721} from "@solmate/tokens/ERC721.sol";

/// @notice ETH-Time NFT contract.
contract EthTime is ERC721("ETH Time", "ETHT") {
    //////////////////////////////////////////////////////////////////////////
    //                                                                      //
    //                     Transfer with History                            //
    //                                                                      //
    //////////////////////////////////////////////////////////////////////////

    /// @notice The state of each NFT.
    mapping(uint256 => uint160) public historyAccumulator;

    function transferFrom(address from, address to, uint256 id)
        public
        override
    {
        super.transferFrom(from, to, id);

        _updateHistory(to, id);
    }

    function safeTransferFrom(address from, address to, uint256 id)
        public
        override
    {
        super.safeTransferFrom(from, to, id);

        _updateHistory(to, id);
    }

    function safeTransferFrom(address from, address to, uint256 id, bytes memory data)
        public
        override
    {
        super.safeTransferFrom(from, to, id, data);

        _updateHistory(to, id);
    }

    //////////////////////////////////////////////////////////////////////////
    //                                                                      //
    //                              Minting                                 //
    //                                                                      //
    //////////////////////////////////////////////////////////////////////////

    /// @notice Mint a new NFT, transfering ownership to the given account.
    /// @dev If the token id already exists, this method fails.
    /// @param to the NFT ower.
    /// @param id the NFT unique id.
    function mint(address to, uint256 id)
        public
        virtual
    {
        _safeMint(to, id);

        // effects: seed history with unique starting value.
        historyAccumulator[id] = uint160(id);
    }

    //////////////////////////////////////////////////////////////////////////
    //                                                                      //
    //                           Token URI                                  //
    //                                                                      //
    //////////////////////////////////////////////////////////////////////////

    /// @notice Returns the URI with the NFT metadata.
    /// @dev Returns the base64 encoded metadata inline.
    /// @param id the NFT unique id
    function tokenURI(uint256 id)
        public
        view
        override
        returns (string memory)
    {
        return string(bytes.concat("data:application/json;bas64"));
    }

    //////////////////////////////////////////////////////////////////////////
    //                                                                      //
    //                         Private Functions                            //
    //                                                                      //
    //////////////////////////////////////////////////////////////////////////

    /// @dev Update the NFT history based on the transfer to the given account.
    /// @param to the address that will receive the nft.
    /// @param id the NFT unique id.
    function _updateHistory(address to, uint256 id)
        internal
    {
        // effects: xor existing value with address bytes content.
        historyAccumulator[id] ^= uint160(to);
    }
}

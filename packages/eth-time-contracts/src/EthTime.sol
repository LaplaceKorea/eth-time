// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity 0.8.10;

import {Base64} from "@base64-sol/base64.sol";
import {ERC721} from "@solmate/tokens/ERC721.sol";
import {Strings} from "@openzeppelin/utils/Strings.sol";


/// @notice The NFT with the given id does not exist.
error EthTime__DoesNotExist();

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
        string memory tokenId = Strings.toString(id);

        return
            Base64.encode(
                bytes.concat(
                    'data:application/json;bas64,',
                    '{"name": "ETH Time #',
                    bytes(tokenId),
                    '", "description": "TODO", "image": "data:image/svg+xml;base64,',
                    bytes(_tokenImage(id)),
                    '"}'
                )
            );
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

    bytes constant groupOpenStart = '<g transform="translate(';
    bytes constant groupOpenEnd = ')">';
    bytes constant groupClose = '</g>';
    bytes constant dots = '<circle cx="20" cy="36" r="6" fill="#FFFFFF"/><circle cx="20" cy="64" r="6" fill="#FFFFFF"/>';

    /// @dev Generate the SVG image for the given NFT.
    /// @param id the NFT unique id.
    function _tokenImage(uint256 id)
        internal
        view
        returns (string memory)
    {
        if (ownerOf[id] == address(0)) {
            revert EthTime__DoesNotExist();
        }

        return
            Base64.encode(
                bytes.concat(
                    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">',
                    '<linearGradient id="bg" gradientTransform="rotate(90)">',
                    '<stop offset="0%" stop-color="hsl(10, 100%, 50%)" /><stop offset="100%" stop-color="hsl(100, 100%, 50%)" />',
                    '</linearGradient>',
                    '<rect x="0" y="0" width="1000" height="1000" fill="url(#bg)" />',
                    _dots(500, 500),
                    '</svg>'
                )
            );
    }

    function _dots(uint16 x, uint16 y)
        internal
        pure
        returns (bytes memory)
    {
        return
            bytes.concat(
                groupOpenStart,
                _uintToBytes(x),
                ',',
                _uintToBytes(y),
                groupOpenEnd,
                dots,
                groupClose
            );
    }

    /// @dev Taken from DVD Logo NFT 0x68a65e7968fbacd2387dad316918da69a7011608
    function _uintToBytes(uint n)
        internal
        pure
        returns (bytes memory)
    {
        if (n == 0) {
            return bytes("0");
        }
        bytes memory reversed = new bytes(100);
        uint len = 0;
        while (n != 0) {
            uint r = n % 10;
            n = n / 10;
            reversed[len++] = bytes1(uint8(48 + r));
        }
        bytes memory buf = new bytes(len);
        for (uint i= 0; i < len; i++) {
            buf[i] = reversed[len - i - 1];
        }
        return buf;
    }
}

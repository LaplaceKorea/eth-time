// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity 0.8.10;

import {Base64} from "@base64-sol/base64.sol";
import {BokkyPooBahsDateTimeLibrary} from "@bpb-datetime/BokkyPooBahsDateTimeLibrary.sol";
import {ERC721} from "@solmate/tokens/ERC721.sol";
import {ReentrancyGuard} from "@solmate/utils/ReentrancyGuard.sol";
import {Strings} from "@openzeppelin/utils/Strings.sol";


/// @notice The NFT with the given id does not exist.
error EthTime__DoesNotExist();

/// @notice The number is outside the supported range.
error EthTime__NumberOutOfRange();

/// @notice ETH-Time NFT contract.
contract EthTime is ERC721("ETH Time", "ETHT"), ReentrancyGuard {
    //////////////////////////////////////////////////////////////////////////
    //                                                                      //
    //                     Transfer with History                            //
    //                                                                      //
    //////////////////////////////////////////////////////////////////////////

    /// @notice The state of each NFT.
    mapping(uint256 => uint160) public historyAccumulator;

    function transferFrom(address from, address to, uint256 id)
        public
        nonReentrant
        override
    {
        // effects: update history
        _updateHistory(to, id);

        // effects: transfer token
        super.transferFrom(from, to, id);
    }

    function safeTransferFrom(address from, address to, uint256 id)
        public
        nonReentrant
        override
    {
        // effects: update history
        _updateHistory(to, id);

        // interactions: safe transfer token
        super.safeTransferFrom(from, to, id);
    }

    function safeTransferFrom(address from, address to, uint256 id, bytes memory data)
        public
        nonReentrant
        override
    {
        // effects: update history
        _updateHistory(to, id);

        // interactions: safe transfer token
        super.safeTransferFrom(from, to, id, data);
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
        nonReentrant
        virtual
    {
        // effects: seed history with unique starting value.
        historyAccumulator[id] = uint160(id);

        // interactions: safe mint
        _safeMint(to, id);
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
        if (ownerOf[id] == address(0)) {
            revert EthTime__DoesNotExist();
        }

        string memory tokenId = Strings.toString(id);

        bytes memory topHue = _computeHue(historyAccumulator[id], id);
        bytes memory bottomHue = _computeHue(uint160(ownerOf[id]), id);

        return
            Base64.encode(
                bytes.concat(
                    'data:application/json;bas64,',
                    '{"name": "ETH Time #',
                    bytes(tokenId),
                    '", "description": "ETH Time", "image": "data:image/svg+xml;base64,',
                    bytes(_tokenImage(topHue, bottomHue)),
                    '"}'
                )
            );
    }

    /// @dev Generate a preview of the token that will be minted.
    /// @param to the minter.
    /// @param id the NFT unique id.
    function tokenImagePreview(address to, uint256 id)
        public
        view
        returns (string memory)
    {
        bytes memory topHue = _computeHue(uint160(id), id);
        bytes memory bottomHue = _computeHue(uint160(to), id);
        return _tokenImage(topHue, bottomHue);
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
        historyAccumulator[id] ^= uint160(to) << 32;
    }

    bytes constant onColor = "FFF";
    bytes constant offColor = "333";

    /// @dev Generate the SVG image for the given NFT.
    function _tokenImage(bytes memory topHue, bytes memory bottomHue)
        internal
        view
        returns (string memory)
    {
        uint256 hour = BokkyPooBahsDateTimeLibrary.getHour(block.timestamp);
        uint256 minute = BokkyPooBahsDateTimeLibrary.getMinute(block.timestamp);

        return
            Base64.encode(
                bytes.concat(
                    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">',
                    '<linearGradient id="bg" gradientTransform="rotate(90)">',
                    '<stop offset="0%" stop-color="hsl(', topHue, ',100%,89%)"/>',
                    '<stop offset="100%" stop-color="hsl(', bottomHue, ',77%,36%)"/>',
                    '</linearGradient>',
                    '<rect x="0" y="0" width="1000" height="1000" fill="url(#bg)"/>',
                    _binaryHour(hour),
                    _binaryMinute(minute),
                    '</svg>'
                )
            );
    }

    function _binaryHour(uint256 hour)
        internal
        pure
        returns (bytes memory)
    {
        if (hour > 24) {
            revert EthTime__NumberOutOfRange();
        }

        bytes[7] memory colors = _binaryColor(hour);

        return
            bytes.concat(
                '<circle cx="665" cy="875" r="25" fill="#', colors[0], '"/>',
                '<circle cx="665" cy="805" r="25" fill="#', colors[1], '"/>',
                // skip colors[2]
                '<circle cx="735" cy="875" r="25" fill="#', colors[3], '"/>',
                '<circle cx="735" cy="805" r="25" fill="#', colors[4], '"/>',
                '<circle cx="735" cy="735" r="25" fill="#', colors[5], '"/>',
                '<circle cx="735" cy="665" r="25" fill="#', colors[6], '"/>'
            );
    }

    function _binaryMinute(uint256 minute)
        internal
        pure
        returns (bytes memory)
    {
        if (minute > 59) {
            revert EthTime__NumberOutOfRange();
        }

        bytes[7] memory colors = _binaryColor(minute);

        return
            bytes.concat(
                '<circle cx="805" cy="875" r="25" fill="#', colors[0], '"/>',
                '<circle cx="805" cy="805" r="25" fill="#', colors[1], '"/>',
                '<circle cx="805" cy="735" r="25" fill="#', colors[2], '"/>',

                '<circle cx="875" cy="875" r="25" fill="#', colors[3], '"/>',
                '<circle cx="875" cy="805" r="25" fill="#', colors[4], '"/>',
                '<circle cx="875" cy="735" r="25" fill="#', colors[5], '"/>',
                '<circle cx="875" cy="665" r="25" fill="#', colors[6], '"/>'
            );
    }

    /// @dev Returns the colors to be used to display the time.
    /// The first 3 bytes are used for the first digit, the remaining 4 bytes
    /// for the second digit.
    function _binaryColor(uint256 n)
        internal
        pure
        returns (bytes[7] memory)
    {
        unchecked {
            uint256 firstDigit = n / 10;
            uint256 secondDigit = n % 10;

            return [
                (firstDigit & 0x1 != 0) ? onColor : offColor,
                (firstDigit & 0x2 != 0) ? onColor : offColor,
                (firstDigit & 0x4 != 0) ? onColor : offColor,

                (secondDigit & 0x1 != 0) ? onColor : offColor,
                (secondDigit & 0x2 != 0) ? onColor : offColor,
                (secondDigit & 0x4 != 0) ? onColor : offColor,
                (secondDigit & 0x8 != 0) ? onColor : offColor
            ];
        }
    }

    function _computeHue(uint160 n, uint256 id)
        internal
        pure
        returns (bytes memory)
    {
        bytes20 b = bytes20(n ^ uint160(id));
        uint16 acc = 0;
        unchecked {
            uint16 t;
            for (uint8 i = 0; i < 10; i++) {
                t = uint16(bytes2(b[2*i]) | (bytes2(b[2*i+1]) << 8));
                acc ^= t;
            }
        }
        acc = acc % 360;
        return bytes(Strings.toString(acc));
    }
}

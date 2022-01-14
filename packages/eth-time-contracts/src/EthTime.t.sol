// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity 0.8.10;

import {DSTestPlus} from "@solmate/test/utils/DSTestPlus.sol";
import {ERC721TokenReceiver} from "@solmate/tokens/ERC721.sol";

import {EthTime} from "./EthTime.sol";

contract EthTimeTest is DSTestPlus, ERC721TokenReceiver {
    EthTime collection;

    function onERC721Received(
        address /* operator */,
        address /* from */,
        uint256 /* id */,
        bytes calldata /* data */
    ) public virtual override returns (bytes4) {
        return ERC721TokenReceiver.onERC721Received.selector;
    }

    function setUp() public {
        collection = new EthTime();
    }

    function testHistoryIsSeeded() public {
        collection.mint(address(0xCECC0), 0);
        assertEq(collection.historyAccumulator(0), 0);

        collection.mint(address(0xCECC0), 1);
        assertGt(collection.historyAccumulator(1), 0);

        assertEq(collection.balanceOf(address(0xCECC0)), 2);
    }

    function testFailMintingDuplicate() public {
        collection.mint(address(0xCECC0), 1);
        collection.mint(address(0xCECC0), 1);
    }

    function testTokenURIIsUniqueById() public {
        collection.mint(address(0xCECC0), 0);
        collection.mint(address(0xCECC0), 1);

        string memory tokenUri0 = collection.tokenURI(0);
        string memory tokenUri1 = collection.tokenURI(1);
        bytes32 tokenUri0Hash = keccak256(bytes(tokenUri0));
        bytes32 tokenUri1Hash = keccak256(bytes(tokenUri1));

        assertTrue(tokenUri0Hash != tokenUri1Hash);
    }

    function testTokenURIChangesOnTransfer() public {
        collection.mint(address(this), 0);
        string memory tokenUriBefore = collection.tokenURI(0);
        collection.transferFrom(address(this), address(0xCECC0), 0);
        string memory tokenUriAfter = collection.tokenURI(0);

        bytes32 tokenUriBeforeHash = keccak256(bytes(tokenUriBefore));
        bytes32 tokenUriAfterHash = keccak256(bytes(tokenUriAfter));

        assertTrue(tokenUriBeforeHash != tokenUriAfterHash);
    }
}
// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity 0.8.10;

import {DSTestPlus} from "@solmate/test/utils/DSTestPlus.sol";

import {EthTime} from "./EthTime.sol";

contract EthTimeTest is DSTestPlus {
    EthTime collection;

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
}
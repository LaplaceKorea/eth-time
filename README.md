# ETH Time

ETH Time is a new NFT collection created to explore new ways of generating NFTs on-chain. It is inspired by existing projects such as Zora's Zorbs. We wanted to play with the idea of having NFTs change as they are used the same way that physical objects do.

An ETH Time NFT is made of three parts: the bottom shade color is determined by the current NFT owner and the unique token id, while the top shade color is determined by the history of the NFT. The NFT look will change as it's exchanged between people.
Inspired by instant film cameras, we added a timestamp in the bottom right corner. We use a binary clock to obtain a more minimal look and to work around the limited amount of data the on-chain SVG can contain.

Together with the NFT collection smart contract, we built a website where users can mint the NFT and exchange them with their friends. To improve user experience, we integrated with ENS to 1) display human-friendly addresses 2) display a customized avatar for the owner of an NFT, 3) send the NFT to an ENS name. Users can save their NFT by clicking the "Save Image" button and easily share it on social-media.

## How it's made

The smart contract is developed from scratch using:

 * Dapptools for managing the project and testing.
 * Solmate for the ERC721 contract.
 * BokkyPooBahsDateTimeLibrary to get the current hour and minutes.
 * Bas64.sol to encode the SVG image to base 64.
 * TCL to script dapptools and avoid repetitive tasks.

The web application is implemented using:

 * Next.js.
 * Ethers.js, Web3 React, and useDapp to interact with ETH from the application.
 * @davatar/react to display the ENS avatar of the current NFT owner.
 * The website is hosted on Vercel.

The application displays a live version of the user collection by fetching historical Transfer events and listening for new events.

Since the application is using the Rinkeby test network, we integrate ENS by creating a separate JSON RPC provider (connected to mainnet). We also use the wallet JSON RPC API to remind users to switch to the Rinkeby network before minting.
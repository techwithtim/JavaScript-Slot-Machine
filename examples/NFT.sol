// // SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

// To read more about NFTs, checkout the ERC721 standard:
// https://eips.ethereum.org/EIPS/eip-721 

/**
NOTE: THIS WILL NOT BE AUTOMATICALLY COMPILED.
If you want it to compile, either import it into contract.sol or copy and paste the contract directly into there!
**/

contract SimpleNFT is ERC721URIStorage, Ownable {
		uint256 public tokenCounter = 0;

		// You can pass in your own NFT name and symbol (like a stock ticker) here!
    constructor() ERC721("NFT Name", "SYMBOL") {
			// Put any initialization code inside of the constructor
    }

		// minting is essentially creating the NFT.
		// you pass in who will own it and the link to the token's URI - which is usually a link to an image hosted on IPFS.
    function mint(address recipient, string memory tokenURI) public returns (uint256) {
				// _mint is a built in function that actually puts your NFT onto the blockchain
        _mint(recipient, tokenCounter);

				// this will set the tokenURI of the NFT to the tokenURI that you pass in through this function.
        _setTokenURI(tokenCounter, tokenURI);

				// every time you mint, increment the amount of tokens you've created by 1.
        tokenCounter = tokenCounter + 1;
				// we return the current token count, which is being used as the ID of the NFT.
        return tokenCounter;
    }
}
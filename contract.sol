// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IUniswapV2Router02.sol";
import "@aave/protocol-v2/contracts/interfaces/ILendingPool.sol";
import "@aave/protocol-v2/contracts/interfaces/ILendingPoolAddressesProvider.sol";
import "@aave/protocol-v2/contracts/interfaces/IFlashLoanReceiver.sol";

contract FlashLoanArbitrage is IFlashLoanReceiver, Ownable {
    using SafeMath for uint256;

    address public constant UNISWAP_ROUTER_ADDRESS = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    address public constant DAI_ADDRESS = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
    address public constant USDC_ADDRESS = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
    address public constant AAVE_ADDRESSES_PROVIDER = 0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5;

    IUniswapV2Router02 public uniswapRouter;
    ILendingPoolAddressesProvider public provider;
    ILendingPool public lendingPool;

    constructor() {
        uniswapRouter = IUniswapV2Router02(UNISWAP_ROUTER_ADDRESS);
        provider = ILendingPoolAddressesProvider(AAVE_ADDRESSES_PROVIDER);
        lendingPool = ILendingPool(provider.getLendingPool());
    }

    function runArbitrage(uint amount) external onlyOwner {
        // Execute the flash loan
        address[] memory assets = new address[](1);
        assets[0] = DAI_ADDRESS;
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = amount;
        uint256[] memory modes = new uint256[](1);
        modes[0] = 0;

        lendingPool.flashLoan(
            address(this),
            assets,
            amounts,
            modes,
            address(this),
            "", // Empty params
            0
        );
    }

    function executeOperation(
        address[] calldata assets,
        uint256[] calldata amounts,
        uint256[] calldata premiums,
        address initiator,
        bytes calldata params
    ) external override returns (bool) {
        require(msg.sender == address(lendingPool), "Invalid sender");

        // Get the DAI and USDC balance of this contract
        uint daiBalance = IERC20(DAI_ADDRESS).balanceOf(address(this));
        uint usdcBalance = IERC20(USDC_ADDRESS).balanceOf(address(this));

        // Swap USDC to DAI using Uniswap
        address[] memory path = new address[](2);
        path[0] = USDC_ADDRESS;
        path[1] = DAI_ADDRESS;

        uint[] memory swapAmounts = uniswapRouter.swapExactTokensForTokens(
            usdcBalance, 0, path, address(this), block.timestamp
        );

                // Calculate profit
        uint profit = daiBalance.add(swapAmounts[1]).sub(amounts[0]);

        // If there is profit, execute the arbitrage
        if (profit > 0) {
            // Repay the Aave loan with the borrowed amount plus premium
            for (uint i = 0; i < assets.length; i++) {
                uint amountOwing = amounts[i].add(premiums[i]);
                IERC20(assets[i]).approve(address(lendingPool), amountOwing);
                lendingPool.repay(assets[i], amountOwing, 1, address(this));
            }

            // Transfer the profit to the contract owner
            IERC20(DAI_ADDRESS).transfer(owner(), profit);
        } else {
            // If there is no profit, repay the Aave loan without executing the arbitrage
            for (uint i = 0; i < assets.length; i++) {
                uint amountOwing = amounts[i].add(premiums[i]);
                IERC20(assets[i]).approve(address(lendingPool), amountOwing);
                lendingPool.repay(assets[i], amountOwing, 1, address(this));
            }
        }

        return true;
    }
}


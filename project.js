
document.addEventListener("DOMContentLoaded", () => {
    const ROWS = 3;
    const COLS = 3;

    const SYMBOLS_COUNT = {
        A: 2,
        B: 4,
        C: 6,
        D: 8
    };

    const SYMBOLS_VALUES = {
        A: 5,
        B: 4,
        C: 3,
        D: 2
    };

    let balance = 0;

    const balanceDisplay = document.getElementById("balance");
    const depositInput = document.getElementById("deposit");
    const depositButton = document.getElementById("deposit-button");
    const linesInput = document.getElementById("lines");
    const betInput = document.getElementById("bet");
    const spinButton = document.getElementById("spin-button");
    const resultMessage = document.getElementById("result-message");
    const playAgainButton = document.getElementById("play-again-button");

    const reels = [
        document.getElementById("reel1"),
        document.getElementById("reel2"),
        document.getElementById("reel3")
    ];

    depositButton.addEventListener("click", () => {
        const depositAmount = parseFloat(depositInput.value);
        if (isNaN(depositAmount) || depositAmount <= 0) {
            alert("Invalid deposit amount, try again.");
        } else {
            balance += depositAmount;
            updateBalance();
            depositInput.value = "";
        }
    });

    spinButton.addEventListener("click", () => {
        const numberOfLines = parseInt(linesInput.value);
        const betAmount = parseFloat(betInput.value);

        if (isNaN(numberOfLines) || numberOfLines <= 0 || numberOfLines > 3) {
            alert("Invalid number of lines, try again.");
            return;
        }

        if (isNaN(betAmount) || betAmount <= 0 || betAmount > balance / numberOfLines) {
            alert("Invalid bet amount, try again.");
            return;
        }

        balance -= betAmount * numberOfLines;
        updateBalance();

        const result = spin();
        const rows = transpose(result);
        displayReels(rows);
        const winnings = getWinnings(rows, betAmount, numberOfLines);
        balance += winnings;
        updateBalance();

        resultMessage.textContent = `You won $${winnings}`;

        if (balance <= 0) {
            alert("You ran out of money!");
            spinButton.disabled = true;
            playAgainButton.style.display = "inline-block";
        }
    });

    playAgainButton.addEventListener("click", () => {
        balance = 0;
        updateBalance();
        spinButton.disabled = false;
        playAgainButton.style.display = "none";
        resultMessage.textContent = "";
    });

    const updateBalance = () => {
        balanceDisplay.textContent = `Balance: $${balance}`;
    };

    const spin = () => {
        const symbols = [];
        for (const [symbol, count] of Object.entries(SYMBOLS_COUNT)) {
            for (let i = 0; i < count; i++) {
                symbols.push(symbol);
            }
        }

        const reels = [];
        for (let i = 0; i < COLS; i++) {
            reels.push([]);
            const reelSymbols = [...symbols];
            for (let j = 0; j < ROWS; j++) {
                const randomIndex = Math.floor(Math.random() * reelSymbols.length);
                const selectedSymbol = reelSymbols[randomIndex];
                reels[i].push(selectedSymbol);
                reelSymbols.splice(randomIndex, 1);
            }
        }
        return reels;
    };

    const transpose = (reels) => {
        const rows = [];
        for (let i = 0; i < ROWS; i++) {
            rows.push([]);
            for (let j = 0; j < COLS; j++) {
                rows[i].push(reels[j][i]);
            }
        }
        return rows;
    };

    const displayReels = (rows) => {
        rows.forEach((row, index) => {
            reels[index].innerHTML = row.map(symbol => `<span>${symbol}</span>`).join('');
        });
    };

    const getWinnings = (rows, bet, lines) => {
        let winnings = 0;
        for (let row = 0; row < lines; row++) {
            const symbols = rows[row];
            if (symbols.every(symbol => symbol === symbols[0])) {
                winnings += bet * SYMBOLS_VALUES[symbols[0]];
            }
        }
        return winnings;
    };
});

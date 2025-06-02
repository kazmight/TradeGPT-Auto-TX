# TradeGPT Auto Bot

An automated bot for interacting with TradeGPT Finance, performing swaps, and earning points on the 0G Testnet.

## Features ✨

- **Multi-wallet support** - Manage multiple wallets from `.env` file
- **Automated chat interactions** - Random prompts to simulate user activity
- **Token swapping** - Automated USDT to LOP swaps
- **Points tracking** - Monitor your airdrop points in real-time

## Prerequisites 📋

- Node.js v18+
- npm or yarn
- 0G Testnet USDT and native OG tokens
- Private keys (stored securely in `.env` file)

## Installation 🛠️

1. Clone the repository:
```bash
git clone https://github.com/kazmight/TradeGPT-Auto-TX.git
cd TradeGPT-Auto-TX
```

2. Install dependencies:
```bash
npm install
```

3. Open a `.env` file:
```ini
PRIVATE_KEY_1=your_private_key_here
PRIVATE_KEY_2=optional_second_private_key
# Add more as needed
```

## Running Script

4. Run the bot:
```bash
node index.js
```

The bot will:
1. Display all wallet information (balances and points)
2. Ask for number of chat interactions per wallet
3. Perform random chat interactions
4. Execute random USDT to LOP swaps
5. Display updated points after completion


## Safety & Security 🔒

⚠️ **Important Security Notes**:
- Never share your private keys
- Use dedicated wallets for testing
- The bot is for testnet use only
- Review all code before running

## License 📄

MIT License - See [LICENSE](LICENSE) for details.

require('dotenv').config();
const axios = require('axios');
const ethers = require('ethers');
const prompt = require('prompt-sync')(); // prompt-sync is used here, so input will be plain text

const colors = {
    reset: "\x1b[0m",
    cyan: "\x1b[36m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    white: "\x1b[37m",
    bold: "\x1b[1m"
};

const logger = {
    info: (msg) => console.log(`${colors.green}[✅] ${msg}${colors.reset}`),
    warn: (msg) => console.log(`${colors.yellow}[🚫] ${msg}${colors.reset}`),
    error: (msg) => console.log(`${colors.red}[❎] ${msg}${colors.reset}`),
    success: (msg) => console.log(`${colors.green}[✅] ${msg}${colors.reset}`), // Adjusted for consistency
    loading: (msg) => console.log(`${colors.cyan}[🔁] ${msg}${colors.reset}`),
    step: (msg) => console.log(`${colors.white}[▶] ${msg}${colors.reset}`),
    banner: () => {
        console.log(`${colors.cyan}${colors.bold}`);
        console.log('████████╗██████╗░░█████╗░██████╗░███████╗░██████╗░██████╗░████████╗');
        console.log('╚══██╔══╝██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔════╝░██╔══██╗╚══██╔══╝');
        console.log('░░░██║░░░██████╔╝███████║██║░░██║█████╗░░██║░░██╗░██████╔╝░░░██║░░░');
        console.log('░░░██║░░░██╔══██╗██╔══██║██║░░██║██╔══╝░░██║░░╚██╗██╔═══╝░░░░██║░░░');
        console.log('░░░██║░░░██║░░██║██║░░██║██████╔╝███████╗╚██████╔╝██║░░░░░░░░██║░░░');
        console.log('░░░╚═╝░░░╚═╝░░╚═╝╚═╝░░╚═╝╚═════╝░╚══════╝░╚═════╝░╚═╝░░░░░░░░╚═╝░░░');
        console.log('\nby Kazmight');
        console.log(`${colors.reset}\n`);
    },
    // Menambahkan pesan password
    passwordPrompt: (msg) => console.log(`${colors.yellow}[🔒] ${msg}${colors.reset}`),
    passwordCorrect: (msg) => console.log(`${colors.green}[✅] ${msg}${colors.reset}`),
    passwordIncorrect: (msg) => console.log(`${colors.red}[❎] ${msg}${colors.reset}`),
    passwordEnvMissing: (msg) => console.log(`${colors.red}[❎] ${msg}${colors.reset}`),
};

const getRandomUserAgent = () => {
    const userAgents = [
        '"Chromium";v="136", "Brave";v="136", "Not.A/Brand";v="99"',
        '"Chromium";v="128", "Google Chrome";v="128", "Not.A/Brand";v="24"',
        '"Firefox";v="126", "Gecko";v="20100101"',
        '"Safari";v="17.0", "AppleWebKit";v="605.1.15", "Not.A/Brand";v="8"',
    ];
    return userAgents[Math.floor(Math.random() * userAgents.length)];
};

const getRandomPrompt = () => {
    const prompts = [
        "What's the value of my portfolio?",
        "What can I do on TradeGPT?",
        "What is the price of SLJD?",
        "Perform initial analysis of the users wallet",
        "Can you check my recent transactions?",
        "What are the top tokens to watch today?",
        "Need alpha",
        "How's my wallet performance?",
        "Any new trading opportunities?",
        "What are the trending markets today?",
        "Can you suggest a trading strategy?",
        "What is the price of LOP?",
        "Show me my transaction history",
        "Are there any upcoming airdrops?",
        "What tokens should I hold for the long term?"
    ];
    return prompts[Math.floor(Math.random() * prompts.length)];
};

const loadPrivateKeys = () => {
    const privateKeys = [];
    for (const [key, value] of Object.entries(process.env)) {
        if (key.startsWith('PRIVATE_KEY_') && value) {
            privateKeys.push(value);
        }
    }
    return privateKeys;
};

const networkConfig = {
    rpc: 'https://evmrpc-testnet.0g.ai/',
    chainId: 16601,
    symbol: 'OG',
    explorer: 'https://chainscan-galileo.0g.ai/',
};

const uniswapRouterAddress = '0xDCd7d05640Be92EC91ceb1c9eA18e88aFf3a6900';
const usdtAddress = '0xe6c489B6D3eecA451D60cfda4782e9E727490477';

// Define the tokens available for trading on 0G testnet
const tokens = {
    NEIZ: '0x5d77d8bd959Bfb48c55E19199df54C7ab23f3e4d',
    SYY: '0xd0A1EC4b80e32D207bCc77B17cbB5F3132abDE6D',
    LOP: '0x8B1B701966CfDd5021014bC9C18402b38091b7A8',
    AEOC: '0x7dAbc660f27084FEF9c69Cd992faB69af7b3d034',
    AUR: '0x0eEf6D0198D38330c0317e5F6f485244b4e29eE3',
    FRNU: '0xa9ee01E99d59Fb01B72F5DB9AEDa8b02305DcD69',
    SHEU: '0x90a165f6A012f192E880365a5b04863450137708',
    MEIX: '0x8E174BD3d9AeBAf5a65701e9e9D2879FD3B77Ed6',
    CLSM: '0xBd083A3F30ab27FAF242De03bC32550ed121E719',
    LAQ: '0x388819E43FDbA9fDcaa945277B185514b6c3bEc5',
    AGIF: '0x290322DAC0D75B12f6e38b13C5D7cAE3889eF7D7',
    PRMG: '0x77CB70C4af94cfAF34c3Fa6C6A712F9814F72E12',
    THY: '0x195872c89Ee481bc00d77A4C3C0d87dAFA97B502',
    ECBX: '0x96A9cEf99b40BbeD2AE24E354b78F90C78BaAE74',
    CHN: '0x5Ff6E6cD23B0854998EDA0Ab6BD3DBB645AbC672',
    YIU: '0x317336E2e9D564a1C0A173bA446bA41c99B0a009',
    BADE: '0xbD631c902Fd266e3c60056C0f23F41a75F20Ff72',
    DEAX: '0xA2ad0dD117AFaC54d40d854b8cADC4230571C222',
    REU: '0x84a6f826730693F09a8B488E90963356fE4e8561',
    STG: '0x3a0492969230432b473744c666dBeBceCd0c202B',
    SWR: '0xc40a54Db43a08311025dA04cefa521e5cbe0e82e',
    DENZ: '0xd65FCF829748b77371766022dCd9839c51FEc87D',
    TRA: '0x570A4D57C5eb6e755a99E346F44DfAb6dCD3919C',
    SLJD: '0xfA1bA7E4aD67c1555Bb15CD3d1Ce4523d4D24643',
    ROYN: '0x5f9A7d510D18dA9D00887c5ad60E5dE8Ba435086'
};

// Get a list of token symbols (excluding USDT, which is the input token)
const tradeableTokens = Object.keys(tokens);

const uniswapRouterABI = [
    'function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to, uint256 deadline) external returns (uint256[] memory amounts)',
];

const erc20ABI = [
    'function balanceOf(address account) view returns (uint256)',
    'function decimals() view returns (uint8)',
    'function approve(address spender, uint256 amount) returns (bool)',
];

const getHeaders = () => ({
    'accept': 'application/json, text/plain, */*',
    'accept-language': 'en-US,en;q=0.9',
    'content-type': 'application/json',
    'sec-ch-ua': getRandomUserAgent(),
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'cross-site',
    'sec-gpc': '1',
    'Referer': 'https://0g.app.tradegpt.finance/',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
});

async function fetchWalletPoints(walletAddress) {
    const url = `https://trade-gpt-800267618745.herokuapp.com/points/${walletAddress.toLowerCase()}`;
    try {
        const response = await axios.get(url, { headers: getHeaders() });
        return response.data;
    } catch (error) {
        logger.error(`Failed to fetch points for wallet ${walletAddress}: ${error.message}`);
        return null;
    }
}

async function checkWalletInfo(wallet, provider, walletAddress) {
    try {
        const usdtContract = new ethers.Contract(usdtAddress, erc20ABI, provider);
        const nativeBalance = await provider.getBalance(walletAddress);
        const usdtBalance = await usdtContract.balanceOf(walletAddress);
        const usdtDecimals = await usdtContract.decimals();
        const pointsData = await fetchWalletPoints(walletAddress);

        return { usdtBalance, usdtDecimals, nativeBalance, pointsData };
    } catch (error) {
        logger.error(`Failed to fetch wallet info for ${walletAddress}: ${error.message}`);
        throw error;
    }
}

async function displayAllWalletInfo(privateKeys, provider) {
    for (const privateKey of privateKeys) {
        let walletAddress = 'UNKNOWN_WALLET'; // Initialize before try block
        try {
            const wallet = new ethers.Wallet(privateKey, provider);
            walletAddress = wallet.address; // Assign inside try block
            const { usdtBalance, usdtDecimals, nativeBalance, pointsData } = await checkWalletInfo(wallet, provider, walletAddress);

            logger.info(`Wallet Information for ${walletAddress}:`);
            logger.info(`Native (OG): ${ethers.formatEther(nativeBalance)} OG`);
            logger.info(`USDT: ${ethers.formatUnits(usdtBalance, usdtDecimals)} USDT`);
            if (pointsData) {
                logger.info(`Points: ${pointsData.totalPoints} (Mainnet: ${pointsData.mainnetPoints}, Testnet: ${pointsData.testnetPoints}, Social: ${pointsData.socialPoints})`);
                logger.info(`Last Updated: ${new Date(pointsData.lastUpdated).toISOString()}`);
            } else {
                logger.warn(`No points data available for wallet ${walletAddress}`);
            }
            console.log('');
        } catch (error) {
            logger.error(`Failed to display info for wallet ${walletAddress}: ${error.message}`);
        }
    }
}

async function sendChatRequest(walletAddress, promptMessage) { // Renamed 'prompt' to 'promptMessage' to avoid conflict with prompt-sync
    const url = 'https://trade-gpt-800267618745.herokuapp.com/ask/ask';
    const payload = {
        chainId: networkConfig.chainId,
        user: walletAddress,
        questions: [
            {
                question: promptMessage,
                answer: '',
                baseMessage: {
                    lc: 1,
                    type: 'constructor',
                    id: ['langchain_core', 'messages', 'HumanMessage'],
                    kwargs: { content: promptMessage, additional_kwargs: {}, response_metadata: {} },
                },
                type: null,
                priceHistorical: null,
                priceHistoricalData: null,
                isSynchronized: false,
                isFallback: false,
            },
        ],
        testnetOnly: true,
    };

    try {
        logger.loading(`Sending chat request for wallet ${walletAddress}: "${promptMessage}"`);
        const response = await axios.post(url, payload, { headers: getHeaders() });
        logger.info(`Chat request successful for wallet ${walletAddress}: ${promptMessage}`);
        return response.data;
    } catch (error) {
        logger.error(`Chat request failed for wallet ${walletAddress}: ${error.message}`);
        throw error;
    }
}

async function performSwap(wallet, provider, amountUSDT, targetTokenSymbol, walletAddress) {
    // Get the target token address from our `tokens` object
    const targetTokenAddress = tokens[targetTokenSymbol];
    if (!targetTokenAddress) {
        throw new Error(`Target token symbol ${targetTokenSymbol} not found in the token list.`);
    }

    try {
        const { usdtBalance, usdtDecimals, nativeBalance } = await checkWalletInfo(wallet, provider, walletAddress);
        const amountIn = ethers.parseUnits(amountUSDT.toString(), usdtDecimals);

        if (usdtBalance < amountIn) {
            throw new Error(`Insufficient USDT balance: ${ethers.formatUnits(usdtBalance, usdtDecimals)} USDT`);
        }
        if (nativeBalance < ethers.parseEther('0.001')) { // Ensure sufficient OG for gas
            throw new Error(`Insufficient OG balance for gas: ${ethers.formatEther(nativeBalance)} OG`);
        }

        const path = [usdtAddress, targetTokenAddress];
        const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from now

        const url = 'https://trade-gpt-800267618745.herokuapp.com/ask/ask';
        const payload = {
            chainId: networkConfig.chainId,
            user: walletAddress,
            questions: [
                {
                    question: `Swap ${amountUSDT} USDT to ${targetTokenSymbol}`,
                    answer: '',
                    baseMessage: {
                        lc: 1,
                        type: 'constructor',
                        id: ['langchain_core', 'messages', 'HumanMessage'],
                        kwargs: { content: `Swap ${amountUSDT} USDT to ${targetTokenSymbol}`, additional_kwargs: {}, response_metadata: {} },
                    },
                    type: null,
                    priceHistorical: null,
                    priceHistoricalData: null,
                    isSynchronized: false,
                    isFallback: false,
                },
            ],
            testnetOnly: true,
        };

        logger.loading(`Fetching swap details for ${amountUSDT} USDT to ${targetTokenSymbol}`);
        const response = await axios.post(url, payload, { headers: getHeaders() });
        const swapData = JSON.parse(response.data.questions[0].answer[0].content);

        if (!swapData.amountOutMin) {
            throw new Error('Invalid swap data: amountOutMin is undefined from TradeGPT response');
        }

        // It's crucial here to get the decimals of the target token to parse amountOutMin correctly.
        // For simplicity and assuming most tokens on this testnet might have 18 decimals,
        // we'll default to 18. If a token has different decimals, this will need to be fetched
        // dynamically (e.g., by creating an Ethers.Contract instance for the target token
        // and calling `decimals()`).
        // For now, let's assume 18 decimals for the output token unless specified.
        let targetTokenDecimals = 18;
        // You would typically fetch this:
        // const targetTokenContract = new ethers.Contract(targetTokenAddress, erc20ABI, provider);
        // targetTokenDecimals = await targetTokenContract.decimals();

        const amountOutMin = ethers.parseUnits(swapData.amountOutMin.toString(), targetTokenDecimals);

        const usdtContract = new ethers.Contract(usdtAddress, erc20ABI, wallet);
        logger.loading(`Approving USDT for Uniswap Router for wallet ${walletAddress}`);
        // Ensure to set a gas limit for approval, or let Ethers estimate.
        // A hardcoded limit (like 100000) might fail if actual gas is higher.
        const approveTx = await usdtContract.approve(uniswapRouterAddress, amountIn, { gasLimit: 100000 });
        await approveTx.wait();
        logger.info(`USDT approval successful for wallet ${walletAddress}`);

        const router = new ethers.Contract(uniswapRouterAddress, uniswapRouterABI, wallet);
        logger.loading(`Initiating swap of ${amountUSDT} USDT to ${targetTokenSymbol} for wallet ${walletAddress}`);
        const tx = await router.swapExactTokensForTokens(
            amountIn,
            amountOutMin,
            path,
            walletAddress,
            deadline,
            { gasLimit: 200000 } // Set a reasonable gas limit for the swap
        );

        logger.loading(`Waiting for transaction confirmation: ${tx.hash}`);
        const receipt = await tx.wait();
        logger.info(`Swap successful! Tx Hash: ${networkConfig.explorer}/tx/${tx.hash}`);

        const logResponse = await logTransaction(walletAddress, amountUSDT, tx.hash, 'USDT', targetTokenSymbol);
        logger.success(`Transaction logged successfully: - [✅] "status": "${logResponse.data.status}"`); // Updated success message

        return receipt;
    } catch (error) {
        logger.error(`Swap failed for wallet ${walletAddress} (USDT to ${targetTokenSymbol}): ${error.message}`);
        if (error.transaction) {
            logger.error(`Transaction details: ${JSON.stringify(error.transaction, null, 2)}`);
        }
        if (error.receipt) {
            logger.error(`Receipt details: ${JSON.stringify(error.receipt, null, 2)}`);
        }
        throw error;
    }
}

async function logTransaction(walletAddress, amountUSDT, txHash, currencyIn, currencyOut) {
    const url = 'https://trade-gpt-800267618745.herokuapp.com/log/logTransaction';
    const payload = {
        walletAddress,
        chainId: networkConfig.chainId,
        txHash,
        amount: amountUSDT.toString(),
        usdValue: amountUSDT, // Assuming USDT value is 1:1 with USD for logging
        currencyIn: currencyIn,
        currencyOut: currencyOut,
        timestamp: Date.now(),
        timestampFormatted: new Date().toISOString(),
    };

    try {
        logger.loading(`Logging transaction ${txHash}`);
        const response = await axios.post(url, payload, { headers: getHeaders() });
        return response;
    } catch (error) {
        logger.error(`Failed to log transaction ${txHash}: ${error.message}`);
        throw error;
    }
}

async function runBot() {
    logger.banner();

    // --- FITUR PASSWORD DITAMBAHKAN DI SINI ---
    const correctPassword = process.env.BOT_PASSWORD;
    if (!correctPassword) {
        logger.passwordEnvMissing('Variabel lingkungan BOT_PASSWORD tidak ditemukan. Harap setel sebelum menjalankan skrip.');
        process.exit(1);
    }

    logger.passwordPrompt('Enter password:');
    const enteredPassword = prompt(''); // prompt-sync akan menampilkan teks yang diketik pengguna
    
    if (enteredPassword !== correctPassword) {
        logger.passwordIncorrect('Password salah! Keluar...');
        process.exit(1);
    }
    logger.passwordCorrect('Password benar! Memulai bot...');
    console.log('\n'); // Tambahkan baris kosong untuk jarak
    // --- AKHIR FITUR PASSWORD ---


    const privateKeys = loadPrivateKeys();
    if (privateKeys.length === 0) {
        logger.warn('No private keys found in .env file. Exiting...');
        return;
    }

    const provider = new ethers.JsonRpcProvider(networkConfig.rpc);

    await displayAllWalletInfo(privateKeys, provider);

    const numPrompts = parseInt(prompt('Enter the number of random chat prompts (and corresponding swaps) to send per wallet: '));
    if (isNaN(numPrompts) || numPrompts < 1) {
        logger.error('Invalid number of prompts. Exiting...');
        return;
    }

    for (const privateKey of privateKeys) {
        let walletAddress = 'UNKNOWN_WALLET'; // Initialize here, before the try block
        try {
            const wallet = new ethers.Wallet(privateKey, provider);
            walletAddress = wallet.address; // Assign inside try

            logger.step(`Processing wallet: ${walletAddress}`);

            for (let i = 0; i < numPrompts; i++) {
                // Pick a random chat prompt
                const randomPrompt = getRandomPrompt();
                await sendChatRequest(walletAddress, randomPrompt);
                await new Promise(resolve => setTimeout(resolve, 3000)); // Small delay after chat

                // Pick a random target token for the swap
                const randomTargetTokenSymbol = tradeableTokens[Math.floor(Math.random() * tradeableTokens.length)];
                const randomAmount = (Math.random() * (1 - 0.1) + 0.1).toFixed(6); // Random amount between 0.1 and 1 USDT

                const swapPrompt = `Swap ${randomAmount} USDT to ${randomTargetTokenSymbol}`;
                await sendChatRequest(walletAddress, swapPrompt);
                await new Promise(resolve => setTimeout(resolve, 3000)); // Small delay after chat

                await performSwap(wallet, provider, randomAmount, randomTargetTokenSymbol, walletAddress);

                logger.info(`Completed action set ${i + 1}/${numPrompts} for wallet ${walletAddress}.`);
                await new Promise(resolve => setTimeout(resolve, 5000)); // Longer delay between full cycles
            }
        } catch (error) {
            logger.error(`Error processing wallet ${walletAddress}: ${error.message}`);
        }
        console.log(`\n--- Finished processing wallet ${walletAddress} ---\n`);
        await new Promise(resolve => setTimeout(resolve, 10000)); // Longer delay between wallets
    }

    logger.success('Bot execution completed for all wallets. Fetching final points...');
    for (const privateKey of privateKeys) {
        let walletAddress = 'UNKNOWN_WALLET'; // Also initialize here for the final points loop
        try {
            const wallet = new ethers.Wallet(privateKey, provider);
            walletAddress = wallet.address;
            const pointsData = await fetchWalletPoints(walletAddress);
            if (pointsData) {
                logger.info(`Final Points for ${walletAddress}: Total: ${pointsData.totalPoints} (Mainnet: ${pointsData.mainnetPoints}, Testnet: ${pointsData.testnetPoints}, Social: ${pointsData.socialPoints})`);
            } else {
                logger.warn(`No final points data available for wallet ${walletAddress}`);
            }
        } catch (error) {
            logger.error(`Failed to fetch updated points for wallet ${walletAddress}: ${error.message}`);
        }
    }
}

runBot().catch(error => logger.error(`Bot failed: ${error.message}`));

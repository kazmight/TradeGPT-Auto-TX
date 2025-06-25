require('dotenv').config();
const axios = require('axios');
const ethers = require('ethers');
const prompt = require('prompt-sync')();

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
    warn: (msg) => console.log(`${colors.yellow}[⚠️] ${msg}${colors.reset}`),
    error: (msg) => console.log(`${colors.red}[❌] ${msg}${colors.reset}`),
    success: (msg) => console.log(`${colors.green}[🎉] ${msg}${colors.reset}`),
    loading: (msg) => console.log(`${colors.cyan}[🔄] ${msg}${colors.reset}`),
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
    }
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
        "What is the price of CSYN?", 
        "Perform initial analysis of the users wallet",
        "Can you check my recent transactions?",
        "What are the top tokens to watch today?",
        "Need alpha",
        "How's my wallet performance?",
        "Any new trading opportunities?",
        "What are the trending markets today?",
        "Can you suggest a trading strategy?",
        "What is the price of MTP?", 
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

const usdtAddress = '0x217C6f12d186697b16dE9e1ae9F85389B93BdB30';


const tokens = {
    CSYN: '0xd12F4750a60c4B22680264E018Bb1664Ca23aF40',
    MTP: '0x5506EBd25960Fb30704c2Dc548c3dA7351277eBa',
    BYTX: '0xE226Ceb3BfE97d416fE099BCA68251238D28C1E5',
    DRNT: '0x5f9909a75f871320b9A93574bD6589C82291e391',
    ECHO: '0xEfB05F9D387D5c24967439C3B949b14D1e474983',
    ZFI: '0x9FbC11391167F113641492bE2b10dFE729ea5063',
    NVLK: '0xd2229c8CD8e077fb65b60ecBE01B1c436260fCc4',
    GSWP: '0x42ce92E9C25D22827b97e3b8cBa75bb6F769e8FD',
    LPMD: '0x38CfB9e43e2c85A30b3da6dA85Dd32D09133203C',
    NPAY: '0x25F9F6D80BA137481C2E2C50d4Fe0F7586e06cF0',
    CLYR: '0xB82E4CbbC20B2A3ff52f6B3C7b7d003809149c43',
    FZRO: '0x0d5C1d9E47F1c871BC22C48A5f32425BdA39DcAa',
    THPY: '0xC4d03e091E21a069b8BF9FCA254620BCB8CA806a',
    MCHN: '0x56486F582F55448e58c0321A01A61111CFD99D63',
    FLOV: '0x8f65e752bD9Bde431808c9D07fa0Cb835acf83CC',
    GEDG: '0xD79879872f7864f6cDBddA064635CAe9cB25218e',
    MPTC: '0xC3461CF239bbf520D0853fFB60fa05cdD819C814',
    DGUR: '0xB8CBCFC5a9bb929122299873E1d75c656c78FC01',
    GRMS: '0xCA223a007868F3eFd7D61C6F6F87a2Cc3336c123',
    VCRA: '0xa92b466e00ecc3c569AF97531542E8bBddd870CD'
};


const tradeableTokens = Object.keys(tokens);

const uniswapRouterABI = [
    'function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to, uint256 deadline) external returns (uint256[] memory amounts)',
    'function getAmountsOut(uint256 amountIn, address[] calldata path) view returns (uint256[] memory amounts)'
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
        let walletAddress = 'UNKNOWN_WALLET';
        try {
            const wallet = new ethers.Wallet(privateKey, provider);
            walletAddress = wallet.address;
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

async function sendChatRequest(walletAddress, prompt) {
    const url = 'https://trade-gpt-800267618745.herokuapp.com/ask/ask';
    const payload = {
        chainId: networkConfig.chainId,
        user: walletAddress,
        questions: [
            {
                question: prompt,
                answer: '',
                baseMessage: {
                    lc: 1,
                    type: 'constructor',
                    id: ['langchain_core', 'messages', 'HumanMessage'],
                    kwargs: { content: prompt, additional_kwargs: {}, response_metadata: {} },
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
        logger.loading(`Sending chat request for wallet ${walletAddress}: "${prompt}"`);
        const response = await axios.post(url, payload, { headers: getHeaders() });

        
        if (response.headers['content-type'] && response.headers['content-type'].includes('application/json')) {
            logger.info(`Chat request successful for wallet ${walletAddress}: "${prompt}"`);
            return response.data;
        } else {
            logger.error(`Chat request for wallet ${walletAddress} received non-JSON response. Content-Type: ${response.headers['content-type']}`);
            logger.error(`Raw response data: ${response.data.substring(0, 500)}...`); 
            throw new Error('API returned non-JSON response for chat request');
        }
    } catch (error) {
        logger.error(`Chat request failed for wallet ${walletAddress}: ${error.message}`);
        if (error.response && error.response.data) {
            logger.error(`API response data: ${error.response.data.substring(0, 500)}...`);
        }
        throw error;
    }
}

async function performSwap(wallet, provider, amountUSDT, targetTokenSymbol, walletAddress) {
    const targetTokenAddress = tokens[targetTokenSymbol];
    if (!targetTokenAddress) {
        throw new Error(`Target token symbol ${targetTokenSymbol} not found in the token list.`);
    }

    try {
        const { usdtBalance, usdtDecimals, nativeBalance } = await checkWalletInfo(wallet, provider, walletAddress);
        const amountIn = ethers.parseUnits(amountUSDT.toString(), usdtDecimals);

        if (usdtBalance < amountIn) {
            throw new Error(`Insufficient USDT balance: ${ethers.formatUnits(usdtBalance, usdtDecimals)} USDT. Required: ${amountUSDT} USDT.`);
        }
        if (nativeBalance < ethers.parseEther('0.001')) { 
            throw new Error(`Insufficient OG balance for gas: ${ethers.formatEther(nativeBalance)} OG. Required: min 0.001 OG.`);
        }

        const path = [usdtAddress, targetTokenAddress];
        const deadline = Math.floor(Date.now() / 1000) + 60 * 20; 

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

        let swapData;
        try {
            
            swapData = JSON.parse(response.data.questions[0].answer[0].content);
        } catch (jsonError) {
            
            logger.error(`API response content for swap details is not valid JSON. Error: ${jsonError.message}`);
            logger.error(`Raw response content: ${response.data.questions[0].answer[0].content.substring(0, 500)}...`);
            throw new Error("Failed to parse swap details from TradeGPT API. Response was not valid JSON. Check raw content for API error messages.");
        }
        
        if (!swapData || !swapData.amountOutMin) {
            logger.error(`Invalid swap data received from TradeGPT: ${JSON.stringify(swapData)}`);
            throw new Error('Invalid swap data: amountOutMin is undefined or missing from TradeGPT response');
        }

        
        const targetTokenContract = new ethers.Contract(targetTokenAddress, erc20ABI, provider);
        const targetTokenDecimals = await targetTokenContract.decimals();
        
        const amountOutMin = ethers.parseUnits(swapData.amountOutMin.toString(), targetTokenDecimals);

        const usdtContract = new ethers.Contract(usdtAddress, erc20ABI, wallet);
        logger.loading(`Approving USDT for Uniswap Router for wallet ${walletAddress}`);
        
        const approveTx = await usdtContract.approve(uniswapRouterAddress, amountIn); 
        await approveTx.wait();
        logger.info(`USDT approval successful for wallet ${walletAddress}. Tx Hash: ${networkConfig.explorer}/tx/${approveTx.hash}`);

        const router = new ethers.Contract(uniswapRouterAddress, uniswapRouterABI, wallet);
        logger.loading(`Initiating swap of ${amountUSDT} USDT to ${targetTokenSymbol} for wallet ${walletAddress}`);
        
        const tx = await router.swapExactTokensForTokens(
            amountIn,
            amountOutMin,
            path,
            walletAddress,
            deadline
        );

        logger.loading(`Waiting for transaction confirmation: ${tx.hash}`);
        const receipt = await tx.wait();
        logger.info(`Swap successful! Tx Hash: ${networkConfig.explorer}/tx/${tx.hash}`);

        const logResponse = await logTransaction(walletAddress, amountUSDT, tx.hash, 'USDT', targetTokenSymbol);
        logger.success(`Transaction logged successfully: - [🎉] "status": "${logResponse.data.status}"`);

        return receipt;
    } catch (error) {
        logger.error(`Swap failed for wallet ${walletAddress} (USDT to ${targetTokenSymbol}): ${error.message}`);
        if (error.transaction) {
            logger.error(`Transaction details: ${JSON.stringify(error.transaction, null, 2)}`);
        }
        if (error.receipt) {
            logger.error(`Receipt details: ${JSON.stringify(error.receipt, null, 2)}`);
        }
    }
}

async function logTransaction(walletAddress, amountUSDT, txHash, currencyIn, currencyOut) {
    const url = 'https://trade-gpt-800267618745.herokuapp.com/log/logTransaction';
    const payload = {
        walletAddress,
        chainId: networkConfig.chainId,
        txHash,
        amount: amountUSDT.toString(),
        usdValue: amountUSDT, 
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
        let walletAddress = 'UNKNOWN_WALLET';
        try {
            const wallet = new ethers.Wallet(privateKey, provider);
            walletAddress = wallet.address;

            logger.step(`Processing wallet: ${walletAddress}`);

            
            const { usdtBalance: currentUsdtBalance, usdtDecimals, nativeBalance: currentNativeBalance } = await checkWalletInfo(wallet, provider, walletAddress);
            const formattedUSDT = parseFloat(ethers.formatUnits(currentUsdtBalance, usdtDecimals));
            const formattedOG = parseFloat(ethers.formatEther(currentNativeBalance));

            if (formattedUSDT < 1.0) { 
                logger.warn(`Skipping wallet ${walletAddress} due to insufficient USDT balance (${formattedUSDT} USDT). Need at least 1 USDT for swaps.`);
                console.log(`\n--- Finished processing wallet ${walletAddress} ---\n`);
                await new Promise(resolve => setTimeout(resolve, 5000));
                continue; 
            }
            if (formattedOG < 0.001) { 
                logger.warn(`Skipping wallet ${walletAddress} due to insufficient OG balance (${formattedOG} OG). Need at least 0.001 OG for gas.`);
                console.log(`\n--- Finished processing wallet ${walletAddress} ---\n`);
                await new Promise(resolve => setTimeout(resolve, 5000));
                continue;
            }

            for (let i = 0; i < numPrompts; i++) {
                try {
                    
                    const randomPrompt = getRandomPrompt();
                    await sendChatRequest(walletAddress, randomPrompt);
                    await new Promise(resolve => setTimeout(resolve, 3000)); 

                    
                    const randomTargetTokenSymbol = tradeableTokens[Math.floor(Math.random() * tradeableTokens.length)];
                    
                    const randomAmount = (Math.random() * (1 - 0.1) + 0.1).toFixed(6);

                    
                    const swapPrompt = `Swap ${randomAmount} USDT to ${randomTargetTokenSymbol}`;
                    await sendChatRequest(walletAddress, swapPrompt);
                    await new Promise(resolve => setTimeout(resolve, 3000)); 

                    
                    await performSwap(wallet, provider, parseFloat(randomAmount), randomTargetTokenSymbol, walletAddress);

                    logger.info(`Completed action set ${i + 1}/${numPrompts} for wallet ${walletAddress}.`);
                    await new Promise(resolve => setTimeout(resolve, 5000)); 
                } catch (innerError) {
                    logger.error(`Error during action set ${i + 1}/${numPrompts} for wallet ${walletAddress}: ${innerError.message}`);
                    
                    await new Promise(resolve => setTimeout(resolve, 5000)); 
                }
            }
        } catch (error) {
            logger.error(`Fatal error processing wallet ${walletAddress}: ${error.message}`);
        }
        console.log(`\n--- Finished processing wallet ${walletAddress} ---\n`);
        await new Promise(resolve => setTimeout(resolve, 10000)); 
    }

    logger.success('Bot execution completed for all wallets. Fetching final points...');
    for (const privateKey of privateKeys) {
        let walletAddress = 'UNKNOWN_WALLET';
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

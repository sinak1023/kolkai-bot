const fs = require('fs');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const CONFIG = {
    API_BASE_URL: 'https://api1-pp.klokapp.ai/v1',
    TOKEN_FILE: 'token.txt',
    CHAT_INTERVAL: 60000,
    DAILY_WAIT_TIME: 24 * 60 * 60 * 1000,
    RANDOM_MESSAGES: [
        "What is Bitcoin?",
        "How does blockchain work?",
        "What is the difference between a coin and a token?",
        "Why is decentralization important in crypto?",
        "What is Ethereum used for?",
        "How do smart contracts work?",
        "What is the purpose of mining in crypto?",
        "What is a crypto wallet?",
        "How can I keep my crypto safe?",
        "What is DeFi?",
        "Why do cryptocurrencies have high volatility?",
        "What is the difference between proof of work and proof of stake?",
        "What are NFTs?",
        "How do I buy and sell cryptocurrencies?",
        "What is a public and private key in crypto?",
        "How does a crypto exchange work?",
        "What is staking in crypto?",
        "What are the risks of investing in cryptocurrencies?",
        "How can I earn passive income with crypto?",
        "What is the future of cryptocurrency?",
        "What is a stablecoin?",
        "How do crypto transactions work?",
        "What is a blockchain explorer?",
        "What is a crypto airdrop?",
        "How do I choose a good crypto project to invest in?",
        "What are the benefits of using cryptocurrency?",
        "What is a DAO in crypto?",
        "What is gas fee in Ethereum?",
        "What is the Lightning Network?",
        "How does a hardware wallet work?",
        "What are the top cryptocurrencies by market cap?",
        "What is a memecoin?",
        "What is the difference between a centralized and decentralized exchange?",
        "How does crypto lending work?",
        "What are some common crypto scams?",
        "What is a crypto faucet?",
        "How does yield farming work?",
        "What is the Metaverse in crypto?",
        "What is an ICO (Initial Coin Offering)?",
        "What is a crypto rug pull?",
        "How does token burning work?",
        "What is a hash function in blockchain?",
        "What is the role of nodes in a blockchain network?",
        "What is a 51% attack in crypto?",
        "How do governance tokens work?",
        "What is an oracle in blockchain?",
        "What is the difference between layer 1 and layer 2 solutions?",
        "What is a crypto bridge?",
        "How do I convert crypto to fiat?",
        "What is the impact of regulations on crypto?",
    ]
};

function showBanner() {
    console.log('\n\x1b[37m🚀 kachalkhan 🚀 - We Are Game changers\x1b[0m\n');
}

function getRandomMessage() {
    return CONFIG.RANDOM_MESSAGES[Math.floor(Math.random() * CONFIG.RANDOM_MESSAGES.length)];
}

function readTokensFromFile() {
    try {
        return fs.readFileSync(CONFIG.TOKEN_FILE, 'utf8').trim().split('\n').map(line => line.trim()).filter(line => line);
    } catch (error) {
        console.error(`⚠ Error reading token file:`, error);
        return [];
    }
}

function createApiClient(token) {
    return axios.create({
        baseURL: CONFIG.API_BASE_URL,
        headers: {
            'x-session-token': token,
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            'accept': '*/*',
        }
    });
}

async function checkPoints(apiClient) {
    try {
        const response = await apiClient.get('/points');
        console.log(`✅ Points Balance: ${response.data.points || 0}, Total Points: ${response.data.total_points || 0}`);
        return response.data;
    } catch (error) {
        console.error('⚠ Error checking points:', error.response?.data || error.message);
        return null;
    }
}

async function getThreads(apiClient) {
    try {
        const response = await apiClient.get('/threads');
        return response.data.data;
    } catch (error) {
        console.error('⚠ Error fetching threads:', error.response?.data || error.message);
        return [];
    }
}

async function createNewThread(apiClient, message) {
    const threadData = {
        title: "New Chat",
        messages: [{ role: "user", content: message }],
        sources: null,
        id: uuidv4(),
        dataset_id: "34a725bc-3374-4042-9c37-c2076a8e4c2b",
        created_at: new Date().toISOString()
    };

    try {
        const response = await apiClient.post('/threads', threadData);
        return response.data;
    } catch (error) {
        console.error('⚠ Error creating thread:', error.response?.data || error.message);
        return null;
    }
}

async function sendMessageToThread(apiClient, threadId, message) {
    try {
        const chatData = {
            id: threadId,
            title: "New Chat",
            messages: [{ role: "user", content: message }],
            sources: [],
            model: "llama-3.3-70b-instruct",
            created_at: new Date().toISOString(),
            language: "english"
        };

        const response = await apiClient.post('/chat', chatData);
        console.log(`✅ Message sent to thread ${threadId}:`, message);
        return response.data;
    } catch (error) {
        if (error.response?.data?.detail === "429: rate_limit_exceeded") {
            console.error('⚠ Rate limit exceeded! Skipping to next account...');
            return "RATE_LIMIT";
        }
        console.error('⚠ Error sending message:', error.response?.data || error.message);
        return null;
    }
}

async function runAccount(token) {
    console.log(`🚀 Running bot for token: ${token.slice(0, 5)}...`);
    const apiClient = createApiClient(token);
    let currentThreadId = null;

    await checkPoints(apiClient);

    const threads = await getThreads(apiClient);
    if (threads.length > 0) {
        currentThreadId = threads[0].id;
        console.log('✅ Using existing thread:', currentThreadId);
    } else {
        const newThread = await createNewThread(apiClient, "Starting new conversation");
        if (newThread) {
            currentThreadId = newThread.id;
            console.log('✅ Created new thread:', currentThreadId);
        }
    }

    for (let i = 0; i < CONFIG.RANDOM_MESSAGES.length; i++) {  
        if (!currentThreadId) {
            console.log('⚠ No active thread. Creating new thread...');
            const newThread = await createNewThread(apiClient, "Starting new conversation");
            if (newThread) {
                currentThreadId = newThread.id;
            } else {
                return;
            }
        }

        const points = await checkPoints(apiClient);
        if (!points || points.total_points <= 0) {
            console.log('⚠ No points available. Skipping this account...');
            return;
        }

        const message = getRandomMessage();
        const result = await sendMessageToThread(apiClient, currentThreadId, message);

        if (result === "RATE_LIMIT") {
            return "RATE_LIMIT"; 
        }

        console.log(`⏳ Waiting ${CONFIG.CHAT_INTERVAL / 1000} seconds before next message...`);
        await new Promise(resolve => setTimeout(resolve, CONFIG.CHAT_INTERVAL));
    }

    console.log(`✅ Finished running account ${token.slice(0, 5)}.`);
}

async function runBot() {
    showBanner();

    const tokens = readTokensFromFile();
    if (tokens.length === 0) {
        console.error('❌ No tokens found. Exiting...');
        process.exit(1);
    }

    console.log(`✅ Loaded ${tokens.length} tokens.`);

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const result = await runAccount(token);

        if (result === "RATE_LIMIT" && i === tokens.length - 1) {
            console.log(`🛑 Last account hit rate limit. Sleeping for 24 hours...`);
            setTimeout(() => {
                console.log(`🔄 Restarting bot for a new day...`);
                runBot();
            }, CONFIG.DAILY_WAIT_TIME);
            return;
        }
    }

    console.log(`🛑 All accounts processed. Sleeping for 24 hours...`);
    setTimeout(() => {
        console.log(`🔄 Restarting bot for a new day...`);
        runBot();
    }, CONFIG.DAILY_WAIT_TIME);
}

runBot().catch(error => {
    console.error('❌ Bot crashed:', error);
    process.exit(1);
});

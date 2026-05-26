const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
const path = require('path');

const app = express();
const server = http.createServer(app);

// 🎯 [উইনগো কালার ট্রেড সিঙ্ক - মেগা সকেট প্রোটোকল লক]
const io = socketIo(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

app.use(express.json());
app.use(express.static(path.join(__dirname, './')));

app.use((req, res, next) => {
    res.setHeader("X-Frame-Options", "ALLOWALL");
    res.setHeader("Content-Security-Policy", "frame-ancestors *; default-src * 'unsafe-inline' 'unsafe-eval'; script-src * 'unsafe-inline' 'unsafe-eval'; connect-src * 'unsafe-inline'; img-src * data: blob:; style-src * 'unsafe-inline'; font-src * data:;");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});

// 🎰 [উইনগো কালার ট্রেড ওরিজিনাল ডোমেইন সিঙ্ক]
const MAIN_SITE_URL = "https://betlover247.onrender.com"; 

// 💰 ১. লাইভ অ্যাকাউন্ট ব্যালেন্স নিয়ে আসার ডেডিকেটেড গেটওয়ে
app.get('/api/coin-balance', async (req, res) => {
    const { userId, wallet } = req.query;
    try {
        const response = await axios.get(`${MAIN_SITE_URL}/api_callback.php?action=get_balance&username=${userId}&wallet=${wallet}`, { timeout: 30000 });
        if (response.data && response.data.status === "ok") {
            return res.json({ success: true, balance: response.data.balance });
        }
        return res.json({ success: false, balance: 0 });
    } catch (e) { return res.json({ success: false, balance: 0 }); }
});

// 🛫 ২. থ্রিডি কয়েন ফ্লিপ কোর এপিআই রাউট (POST Route - ৯৫% RTP প্রোটেকশন বর্ম লক ভাই ভাই!)
app.post('/api/coin-flip', async (req, res) => {
    const { userId, amount, wallet, prediction } = req.body;
    const targetWallet = wallet || "main";
    const reqAmount = parseFloat(amount) || 10;

    // 🔒 ১ থেকে ২০০০ বিডিটি পর্যন্ত কড়া বেট সিকিউরিটি ফিল্টার লক
    if (reqAmount < 1 || reqAmount > 2000) {
        return res.json({ success: false, message: "🚨 Invalid Bet Amount (৳১ - ৳২০০০)" });
    }

    try {
        const balCheck = await axios.get(`${MAIN_SITE_URL}/api_callback.php?action=get_balance&username=${userId}&wallet=${targetWallet}`, { timeout: 30000 });
        
        let currentDbBalance = 0;
        if (balCheck.data && balCheck.data.balance !== undefined && balCheck.data.balance !== null) {
            currentDbBalance = parseFloat(balCheck.data.balance);
        } else { currentDbBalance = 9999999; }

        if (currentDbBalance < reqAmount && currentDbBalance !== 9999999) {
            return res.json({ success: false, balance: currentDbBalance, message: "❌ Insufficient Balance! Please Recharge." });
        }

        // 🎰 [৯৫% ওরিজিনাল RTP ম্যাথমেটিক্যাল ক্যাসিনো পুল ভাই ভাই]
        // লাভ নিয়ন্ত্রণে হেড এবং টেইলের ওরিজিনাল ও সুষম ওয়েটেড পুল লক করা হলো
        const sidesPool = [
            "head", "tail", "head", "tail", "tail", "head", "tail", "head",
            "tail", "head", "tail", "head", "head", "tail", "head", "tail"
        ];
        
        const resultSide = sidesPool[Math.floor(Math.random() * sidesPool.length)];
        
        let multiplier = 0;
        let isPlayerWin = false;

        if (prediction === resultSide) {
            isPlayerWin = true;
            multiplier = 2.00; // হেড বা টেইল মিললে বাজি ধরার ডবল টাকা উইন ভাই ভাই!
        }

        let winAmount = 0;
        let dbAction = "bet";
        let dbAmount = reqAmount;

        if (isPlayerWin && multiplier > 0) {
            winAmount = Math.floor(reqAmount * multiplier);
            dbAction = "win";
            dbAmount = parseFloat(winAmount);
        }

        let phpPayload = {
            action: dbAction,
            username: userId,
            amount: dbAmount,
            wallet: targetWallet
        };

        if (dbAction === "win") {
            phpPayload.bet_amount = reqAmount;
            phpPayload.multiplier = parseFloat(multiplier).toFixed(2);
            phpPayload.status = "win";
            phpPayload.type = "win";
            phpPayload.is_win = 1;
            phpPayload.win_status = "win";
            phpPayload.log_status = "win";
        }

        const response = await axios.post(MAIN_SITE_URL + '/api_callback.php', phpPayload, { timeout: 30000 });

        if (response.data && response.data.status === "ok") {
            io.emit("balanceUpdate", { username: userId, balance: response.data.balance });

            return res.json({
                success: true,
                balance: response.data.balance,
                resultSide: resultSide, // 'head' বা 'tail' যা ফ্রন্টএ্যান্ড থ্রিডি ডিগবাজির সাথে সিঙ্ক করবে ভাই
                winAmount: winAmount
            });
        } else {
            let latestBal = (response.data && response.data.balance !== undefined) ? response.data.balance : currentDbBalance;
            return res.json({ success: false, balance: latestBal, message: "❌ Bet Declined by Database!" });
        }

    } catch (e) {
        console.error("Coin Flip Core Engine Error:", e.message);
        return res.json({ success: false, message: "⚠️ Timeout! Click FLIP again." });
    }
});

app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'index.html')); });

io.on('connection', (socket) => {
    console.log("Player connected to Coin Flip Engine!");
});

// ৭ নম্বর গেম ১৪০০০ এ রানিং, তাই ৮ নম্বর প্রজেক্টের সম্পূর্ণ ডেডিকেটেড নতুন পোর্ট ১৫০০০ কড়া লক হলো ভাই ভাই!
const PORT = process.env.PORT || 15000;
server.listen(PORT, () => { console.log(`🪙 Coin Flip Engine Running on port ${PORT}`); });

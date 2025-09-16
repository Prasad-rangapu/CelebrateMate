import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const BASE_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

export const sendTelegramMessage = async (chatId: string, text: string): Promise<void> => {
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn("⚠️ Telegram bot token not configured. Skipping message.");
    return;
  }

  try {
    await axios.post(`${BASE_URL}/sendMessage`, {
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML', // Or 'MarkdownV2'
    });
    console.log(`✈️ Telegram message sent to chat ID ${chatId}`);
  } catch (error: any) {
    console.error(`❌ Failed to send Telegram message to ${chatId}:`, error.response?.data || error.message);
    throw error;
  }
};
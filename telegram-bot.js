const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
require('dotenv').config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const API_URL = process.env.API_URL || 'http://localhost:3000/api/bookings';
const adminUsername = process.env.TELEGRAM_USERNAME;
const adminChatId = process.env.ADMIN_CHAT_ID;

const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const confirmationId = match[1];
  const username = msg.from.username || '';
  
  try {
    await bot.sendMessage(chatId, "Обрабатываем ваше подтверждение...");
    
    const response = await axios.put(API_URL, {
      confirmationId,
      chatId,
      username
    });
    
    if (!response.data.success) {
      await bot.sendMessage(chatId, "Произошла ошибка при подтверждении. Пожалуйста, попробуйте снова.");
    }
  } catch (error) {
    await bot.sendMessage(chatId, "Произошла ошибка при подтверждении. Пожалуйста, попробуйте снова.");
  }
});

bot.onText(/^\/start$/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Привет! Я бот для подтверждения заявок на сап-прогулки и серфинг.');
  
  if (adminChatId && chatId.toString() === adminChatId) {
    bot.sendMessage(chatId, `Приветствую, администратор! Вы получите уведомления о всех новых бронированиях.`);
  }
});

const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
require('dotenv').config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const API_URL = process.env.API_URL || 'http://localhost:3000/api/bookings';
const adminChatId = process.env.ADMIN_CHAT_ID;
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

if (!token) {
  console.error('TELEGRAM_BOT_TOKEN is required');
  process.exit(1);
}

if (!API_URL) {
  console.error('API_URL is required');
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

async function sendMessage(chatId, message, options = {}) {
  try {
    await bot.sendMessage(chatId, message, options);
    return true;
  } catch (error) {
    console.error(`Failed to send message to ${chatId}:`, error);
    return false;
  }
}

function getErrorMessage(error) {
  if (error.response?.data?.message === 'Время подтверждения истекло') 
    return "К сожалению, время подтверждения истекло (3 минуты). Пожалуйста, заполните форму заново.";
  
  if (error.response?.data?.message === 'Эта заявка уже подтверждена')
    return "Эта заявка уже была подтверждена ранее. Нет необходимости подтверждать её повторно.";
  
  return "Произошла ошибка при подтверждении. Пожалуйста, попробуйте снова.";
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
}

function formatDateTime(date, time) {
  return time ? `${formatDate(date)}, ${time}` : formatDate(date);
}

function getActivityName(type) {
  return type === 'sup' ? 'SUP-прогулка' : 'Серфинг';
}

function sortBookingsByDate(bookings) {
  return [...bookings].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
    const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
    return dateA - dateB;
  });
}

function createBookingsListMessage(bookings) {
  if (!bookings || bookings.length === 0) return null;
  
  const sortedBookings = sortBookingsByDate(bookings);
  const bookingsList = sortedBookings.map((booking, i) => {
    const dateText = formatDateTime(booking.date, booking.time);
    const typeText = getActivityName(booking.type);
    return `${i + 1}. ${dateText} - ${typeText}`;
  }).join('\n');
  
  return `🗓 Ваши бронирования:\n\n${bookingsList}`;
}

function createAdminBookingsListMessage(bookings) {
  if (!bookings || bookings.length === 0) return null;
  
  const sortedBookings = sortBookingsByDate(bookings);
  const bookingsList = sortedBookings.map((booking, i) => {
    const dateText = formatDateTime(booking.date, booking.time);
    const typeText = getActivityName(booking.type);
    const status = booking.confirmed ? "✅" : "⏳";
    const contactInfo = booking.telegram ? `@${booking.telegram}` : booking.phone;
    
    return `${i + 1}. ${status} ${dateText} - ${typeText}\n   👤 ${booking.name} | 📞 ${contactInfo}`;
  }).join('\n\n');
  
  return `📋 Список бронирований:\n\n${bookingsList}`;
}

async function handleBookingDetails(chatId, bookingId, messageId) {
  try {
    const response = await axios.get(`${BASE_URL}/api/user/bookings/details?bookingId=${bookingId}&chatId=${chatId}`);
    
    if (response.data.success) {
      const booking = response.data.booking;
      const dateText = formatDateTime(booking.date, booking.time);
      const typeText = getActivityName(booking.type);
      
      const detailsMessage = `📋 *Детали бронирования*\n\n` +
                         `📅 Дата и время: ${dateText}\n` +
                         `🏄‍♂️ Тип: ${typeText}\n` +
                         `👤 Имя: ${booking.name}\n` + 
                         `📞 Телефон: ${booking.phone}\n`;
      
      const inlineKeyboard = [
        [{text: "❌ Отменить бронирование", callback_data: `cancel_${booking.id}`}],
        [{text: "◀️ Назад к списку", callback_data: `back_to_list`}]
      ];
      
      await bot.editMessageText(detailsMessage, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: inlineKeyboard }
      });
    } else {
      await bot.answerCallbackQuery(query.id, {
        text: "Не удалось получить детали бронирования",
        show_alert: true
      });
    }
  } catch (error) {
    console.error('Error getting booking details:', error);
    await sendMessage(chatId, "Произошла ошибка при получении деталей бронирования.");
  }
}

async function handleBookingCancellation(chatId, bookingId, messageId, queryId = null) {
  try {
    const confirmMessage = "Вы уверены, что хотите отменить бронирование?";
    const confirmKeyboard = [
      [{text: "✅ Да, отменить", callback_data: `confirm_cancel_${bookingId}`}],
      [{text: "❌ Нет, оставить", callback_data: `back_to_list`}]
    ];
    
    await bot.editMessageText(confirmMessage, {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: { inline_keyboard: confirmKeyboard }
    });
    
    if (queryId) await bot.answerCallbackQuery(queryId);
  } catch (error) {
    console.error('Error preparing cancellation:', error);
    if (queryId) {
      await bot.answerCallbackQuery(queryId, {
        text: "Произошла ошибка при подготовке отмены",
        show_alert: true
      });
    }
  }
}

async function showUserBookings(chatId) {
  try {
    const response = await axios.get(`${BASE_URL}/api/user/bookings?chatId=${chatId}`);
    
    if (response.data.success) {
      if (!response.data.bookings || response.data.bookings.length === 0) {
        await sendMessage(chatId, "У вас пока нет бронирований.");
        return;
      }
      
      const bookings = response.data.bookings;
      const inlineKeyboard = bookings.map((booking, index) => ([
        {text: `📅 Подробнее #${index + 1}`, callback_data: `details_${booking.id}`},
        {text: `❌ Отменить #${index + 1}`, callback_data: `cancel_${booking.id}`}
      ]));
      
      const message = createBookingsListMessage(bookings);
      await sendMessage(chatId, message, {
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: inlineKeyboard }
      });
    } else {
      await sendMessage(chatId, "Не удалось получить ваши бронирования. Пожалуйста, попробуйте позже.");
    }
  } catch (error) {
    console.error('Error getting user bookings:', error);
    await sendMessage(chatId, "Произошла ошибка при получении бронирований. Пожалуйста, попробуйте позже.");
  }
}

async function fetchAndDisplayAdminBookings(chatId, period, titleText) {
  try {
    const endpoint = period 
      ? `${BASE_URL}/api/admin/bookings/filtered?period=${period}&token=${process.env.ADMIN_TOKEN}`
      : `${BASE_URL}/api/admin/bookings?token=${process.env.ADMIN_TOKEN}`;
      
    const response = await axios.get(endpoint);
    
    if (response.data.success) {
      if (!response.data.bookings || response.data.bookings.length === 0) {
        await sendMessage(chatId, `На ${titleText.toLowerCase()} нет бронирований.`);
        return;
      }
      
      const message = createAdminBookingsListMessage(response.data.bookings);
      const fullMessage = `${titleText}\n\n${message}`;
      
      const maxLength = 4000;
      if (fullMessage.length > maxLength) {
        const parts = [];
        for (let i = 0; i < fullMessage.length; i += maxLength) {
          parts.push(fullMessage.substring(i, i + maxLength));
        }
        
        for (let i = 0; i < parts.length; i++) {
          const header = i === 0 ? "" : `(продолжение ${i+1}/${parts.length})\n\n`;
          await sendMessage(chatId, `${header}${parts[i]}`, { parse_mode: 'Markdown' });
        }
      } else {
        await sendMessage(chatId, fullMessage, { parse_mode: 'Markdown' });
      }
    } else {
      await sendMessage(chatId, "Не удалось получить бронирования. Пожалуйста, попробуйте позже.");
    }
  } catch (error) {
    console.error(`Error getting ${period || 'all'} bookings:`, error);
    await sendMessage(chatId, "Произошла ошибка при получении бронирований.");
  }
}

const isAdmin = (chatId) => adminChatId && chatId.toString() === adminChatId.toString();

const getUserCommands = () => `🔹 *Доступные команды*:

/help - показать это сообщение
/bookings или /my - просмотреть ваши бронирования
/cancel - отменить бронирование`;

const getAdminCommands = () => `🔸 *Команды администратора*:

/help - показать это сообщение
/today - бронирования на сегодня
/tomorrow - бронирования на завтра
/nextweek - бронирования на неделю вперед
/nextmonth - бронирования на месяц вперед
/allbookings - все бронирования
/bookings или /my - ваши личные бронирования
/cancel - отменить бронирование`;

bot.onText(/\/start (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const confirmationId = match[1];
  const username = msg.from.username || '';
  
  await sendMessage(chatId, "Обрабатываем ваше подтверждение...");
  
  try {
    const response = await axios.put(API_URL, {
      confirmationId,
      chatId,
      username
    });
    
    if (!response.data.success) {
      await sendMessage(chatId, getErrorMessage(response));
    }

    if (adminChatId) {
      const userTag = username ? `@${username}` : `ID: ${chatId}`;
      const adminMessage = `✅ Подтвержденная заявка!\n\n👤 Имя: ${booking.name}\n📞 Телефон: ${booking.phone}\n📅 Дата и время: ${formattedDate}\n🏄‍♂️ Тип: ${getActivityName(booking.type)}\n📱 Telegram: ${userTag}`;
      await sendTelegramNotification(token, adminChatId, adminMessage);
    }
  } catch (error) {
    await sendMessage(chatId, getErrorMessage(error));
  }
});

bot.onText(/\/bookings/, async (msg) => await showUserBookings(msg.chat.id));
bot.onText(/\/my/, async (msg) => await showUserBookings(msg.chat.id));

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;
  const messageId = query.message.message_id;
  
  if (data.startsWith('details_')) {
    const bookingId = data.replace('details_', '');
    await handleBookingDetails(chatId, bookingId, messageId);
  } else if (data.startsWith('cancel_')) {
    const bookingId = data.replace('cancel_', '');
    await handleBookingCancellation(chatId, bookingId, messageId, query.id);
  } else if (data === 'back_to_list') {
    await bot.deleteMessage(chatId, messageId);
    await showUserBookings(chatId);
    await bot.answerCallbackQuery(query.id);
  } else if (data.startsWith('confirm_cancel_')) {
    const bookingId = data.replace('confirm_cancel_', '');
    
    try {
      const response = await axios.delete(`${BASE_URL}/api/user/bookings`, {
        data: { bookingId, chatId }
      });
      
      if (response.data.success) {
        await bot.answerCallbackQuery(query.id, {
          text: '✅ Бронирование успешно отменено'
        });
        
        await bot.deleteMessage(chatId, messageId);
        await sendMessage(chatId, "✅ Ваше бронирование было успешно отменено.");
        
        if (response.data.remainingBookings?.length > 0) {
          await showUserBookings(chatId);
        }
        
        if (adminChatId) {
          const bookingInfo = response.data.canceledBooking;
          const dateText = formatDateTime(bookingInfo.date, bookingInfo.time);
          const typeText = getActivityName(bookingInfo.type);
          const telegramInfo = query.from.username ? `@${query.from.username}` : `ID: ${chatId}`;
          
          const adminMessage = `❌ Отмена бронирования!\n\n👤 Имя: ${bookingInfo.name}\n📞 Телефон: ${bookingInfo.phone}\n📅 Дата и время: ${dateText}\n🏄‍♂️ Тип: ${typeText}\n📱 Telegram: ${telegramInfo}`;
          await sendMessage(adminChatId, adminMessage);
        }
      } else {
        await bot.answerCallbackQuery(query.id, {
          text: '⚠️ Ошибка при отмене бронирования',
          show_alert: true
        });
      }
    } catch (error) {
      console.error('Error canceling booking:', error);
      await bot.answerCallbackQuery(query.id, {
        text: 'Произошла ошибка при отмене',
        show_alert: true
      });
    }
  }
});

const adminCommandHandlers = {
  '/today': { period: 'today', title: '📅 *Бронирования на сегодня*' },
  '/tomorrow': { period: 'tomorrow', title: '📅 *Бронирования на завтра*' },
  '/nextweek': { period: 'week', title: '📅 *Бронирования на неделю вперед*' },
  '/nextmonth': { period: 'month', title: '📅 *Бронирования на месяц вперед*' },
  '/allbookings': { period: null, title: '📅 *Все бронирования*' }
};

Object.entries(adminCommandHandlers).forEach(([command, { period, title }]) => {
  bot.onText(new RegExp(command), async (msg) => {
    const chatId = msg.chat.id;
    
    if (!isAdmin(chatId)) {
      await sendMessage(chatId, "Эта команда доступна только администраторам.");
      return;
    }
    
    await fetchAndDisplayAdminBookings(chatId, period, title);
  });
});

bot.onText(/^\/start$/, (msg) => {
  const chatId = msg.chat.id;
  const isAdminUser = isAdmin(chatId);
  
  const welcomeMessage = 'Привет! Я бот для подтверждения заявок на сап-прогулки и серфинг. Используйте /help для просмотра доступных команд.';
  
  const userKeyboard = {
    reply_markup: {
      keyboard: [
        [{ text: 'Мои бронирования' }, { text: 'Отменить бронирование' }],
        [{ text: 'Помощь' }]
      ],
      resize_keyboard: true,
      one_time_keyboard: false
    }
  };
  
  const adminKeyboard = {
    reply_markup: {
      keyboard: [
        [{ text: 'Мои бронирования' }, { text: 'Отменить бронирование' }],
        [{ text: 'Сегодня' }, { text: 'Завтра' }],
        [{ text: 'На неделю' }, { text: 'На месяц' }],
        [{ text: 'Все бронирования' }, { text: 'Помощь' }]
      ],
      resize_keyboard: true,
      one_time_keyboard: false
    }
  };
  
  bot.sendMessage(chatId, welcomeMessage, isAdminUser ? adminKeyboard : userKeyboard);
  
  setTimeout(() => {
    const commandsText = isAdminUser ? getAdminCommands() : getUserCommands();
    bot.sendMessage(chatId, commandsText, { parse_mode: 'Markdown' });
  }, 500);
});

const textCommandMap = {
  'мои бронирования': '/bookings',
  'помощь': '/help',
  'отменить бронирование': '/cancel',
  'сегодня': '/today',
  'завтра': '/tomorrow',
  'на неделю': '/nextweek',
  'на месяц': '/nextmonth',
  'все бронирования': '/allbookings'
};

bot.on('message', (msg) => {
  if (!msg.text) return;
  
  const chatId = msg.chat.id;
  const text = msg.text.toLowerCase();
  const command = textCommandMap[text];
  
  if (command) {
    if (command.startsWith('/today') || command.startsWith('/tomorrow') || 
        command.startsWith('/nextweek') || command.startsWith('/nextmonth') || 
        command.startsWith('/allbookings')) {
      if (!isAdmin(chatId)) return;
    }
    
    bot.emit('text', msg, [command]);
  }
});

bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;
  const isAdminUser = isAdmin(chatId);
  const commandsText = isAdminUser ? getAdminCommands() : getUserCommands();
  await sendMessage(chatId, commandsText, { parse_mode: 'Markdown' });
});

bot.onText(/\/cancel/, async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    const response = await axios.get(`${BASE_URL}/api/user/bookings?chatId=${chatId}`);
    
    if (response.data.success && response.data.bookings && response.data.bookings.length > 0) {
      const bookings = response.data.bookings;
      const inlineKeyboard = bookings.map((booking, index) => ([{
        text: `❌ Отменить: ${formatDateTime(booking.date, booking.time)} - ${getActivityName(booking.type)}`,
        callback_data: `cancel_${booking.id}`
      }]));
      
      await sendMessage(chatId, "Выберите бронирование для отмены:", {
        reply_markup: { inline_keyboard: inlineKeyboard }
      });
    } else {
      await sendMessage(chatId, "У вас нет активных бронирований, которые можно отменить.");
    }
  } catch (error) {
    console.error('Error getting bookings for cancel:', error);
    await sendMessage(chatId, "Произошла ошибка при получении списка бронирований.");
  }
});

const standardCommands = [
  { command: 'start', description: 'Начать работу с ботом' },
  { command: 'help', description: 'Показать список команд' },
  { command: 'bookings', description: 'Посмотреть мои бронирования' },
  { command: 'my', description: 'Посмотреть мои бронирования' },
  { command: 'cancel', description: 'Отменить бронирование' }
];

const adminCommands = [
  ...standardCommands,
  { command: 'today', description: 'Бронирования на сегодня' },
  { command: 'tomorrow', description: 'Бронирования на завтра' },
  { command: 'nextweek', description: 'Бронирования на неделю' },
  { command: 'nextmonth', description: 'Бронирования на месяц' },
  { command: 'allbookings', description: 'Все бронирования' }
];

bot.setMyCommands(standardCommands);

if (adminChatId) {
  try {
    bot.setMyCommands(adminCommands, { scope: { chat_id: adminChatId } });
  } catch (error) {
    console.error('Error setting admin commands:', error);
  }
}

console.log('Telegram bot started successfully');

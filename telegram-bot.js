const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
require('dotenv').config();

// Загрузка параметров из .env
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
  if (error.response?.data?.message === 'Время подтверждения истекло') {
    return "К сожалению, время подтверждения истекло (3 минуты). Пожалуйста, заполните форму заново.";
  }
  if (error.response?.data?.message === 'Эта заявка уже подтверждена') {
    return "Эта заявка уже была подтверждена ранее. Нет необходимости подтверждать её повторно.";
  }
  return "Произошла ошибка при подтверждении. Пожалуйста, попробуйте снова.";
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
}

function formatDateTime(date, time) {
  const formattedDate = formatDate(date);
  return time ? `${formattedDate}, ${time}` : formattedDate;
}

function getActivityName(type) {
  return type === 'sup' ? 'SUP-прогулка' : 'Серфинг';
}

// Улучшенное форматирование списка бронирований для пользователей
function createBookingsListMessage(bookings) {
  if (!bookings || bookings.length === 0) return null;
  
  // Сортируем бронирования по дате (ближайшие первыми)
  const sortedBookings = [...bookings].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
    const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
    return dateA - dateB;
  });
  
  const bookingsList = sortedBookings.map((booking, i) => {
    const dateText = formatDateTime(booking.date, booking.time);
    const typeText = getActivityName(booking.type);
    return `${i + 1}. ${dateText} - ${typeText}`;
  }).join('\n');
  
  return `🗓 Ваши бронирования:\n\n${bookingsList}`;
}

// Улучшенное форматирование списка бронирований для админа
function createAdminBookingsListMessage(bookings) {
  if (!bookings || bookings.length === 0) return null;
  
  // Сортируем бронирования по дате (ближайшие первыми)
  const sortedBookings = [...bookings].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
    const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
    return dateA - dateB;
  });
  
  const bookingsList = sortedBookings.map((booking, i) => {
    const dateText = formatDateTime(booking.date, booking.time);
    const typeText = getActivityName(booking.type);
    const status = booking.confirmed ? "✅" : "⏳";
    const contactInfo = booking.telegram ? `@${booking.telegram}` : booking.phone;
    
    return `${i + 1}. ${status} ${dateText} - ${typeText}\n   👤 ${booking.name} | 📞 ${contactInfo}`;
  }).join('\n\n');
  
  return `📋 Список бронирований:\n\n${bookingsList}`;
}

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
  } catch (error) {
    await sendMessage(chatId, getErrorMessage(error));
  }
});

// Команда для просмотра бронирований пользователя
bot.onText(/\/bookings/, async (msg) => {
  const chatId = msg.chat.id;
  await showUserBookings(chatId);
});

// Команда my - альтернативное название для /bookings (более дружелюбное)
bot.onText(/\/my/, async (msg) => {
  const chatId = msg.chat.id;
  await showUserBookings(chatId);
});

// Выносим логику получения бронирований в отдельную функцию для переиспользования
async function showUserBookings(chatId) {
  try {
    const response = await axios.get(`${BASE_URL}/api/user/bookings?chatId=${chatId}`);
    
    if (response.data.success) {
      if (!response.data.bookings || response.data.bookings.length === 0) {
        await sendMessage(chatId, "У вас пока нет бронирований.");
        return;
      }
      
      const bookings = response.data.bookings;
      
      // Создаем inline кнопки для каждого бронирования
      const inlineKeyboard = bookings.map((booking, index) => ([
        {
          text: `📅 Подробнее #${index + 1}`,
          callback_data: `details_${booking.id}`
        },
        {
          text: `❌ Отменить #${index + 1}`,
          callback_data: `cancel_${booking.id}`
        }
      ]));
      
      const message = createBookingsListMessage(bookings);
      
      await sendMessage(chatId, message, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: inlineKeyboard
        }
      });
    } else {
      await sendMessage(chatId, "Не удалось получить ваши бронирования. Пожалуйста, попробуйте позже.");
    }
  } catch (error) {
    console.error('Error getting user bookings:', error);
    await sendMessage(chatId, "Произошла ошибка при получении бронирований. Пожалуйста, попробуйте позже.");
  }
}

// Обработка нажатия на кнопки отмены и просмотра деталей бронирования
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;
  const messageId = query.message.message_id;
  
  // Обработка просмотра деталей бронирования
  if (data.startsWith('details_')) {
    const bookingId = data.replace('details_', '');
    await handleBookingDetails(chatId, bookingId, messageId);
    return;
  }
  
  // Обработка отмены бронирования
  if (data.startsWith('cancel_')) {
    const bookingId = data.replace('cancel_', '');
    await handleBookingCancellation(chatId, bookingId, messageId, query.id);
    return;
  }
});

// Функция для отображения деталей бронирования
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
                           `👤 Имя: ${booking.name}\n`;
      
      // Создаем кнопки для действий с этим бронированием
      const inlineKeyboard = [
        [
          {
            text: "❌ Отменить бронирование",
            callback_data: `cancel_${booking.id}`
          }
        ],
        [
          {
            text: "◀️ Назад к списку",
            callback_data: `back_to_list`
          }
        ]
      ];
      
      await bot.editMessageText(detailsMessage, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: inlineKeyboard
        }
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

// Функция для отмены бронирования
async function handleBookingCancellation(chatId, bookingId, messageId, queryId = null) {
  try {
    // Сначала запрашиваем подтверждение
    const confirmMessage = "Вы уверены, что хотите отменить бронирование?";
    const confirmKeyboard = [
      [
        {
          text: "✅ Да, отменить",
          callback_data: `confirm_cancel_${bookingId}`
        }
      ],
      [
        {
          text: "❌ Нет, оставить",
          callback_data: `back_to_list`
        }
      ]
    ];
    
    await bot.editMessageText(confirmMessage, {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: {
        inline_keyboard: confirmKeyboard
      }
    });
    
    if (queryId) {
      await bot.answerCallbackQuery(queryId);
    }
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

// Обработка подтверждения отмены бронирования
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;
  
  // Возврат к списку бронирований
  if (data === 'back_to_list') {
    await bot.deleteMessage(chatId, query.message.message_id);
    await showUserBookings(chatId);
    await bot.answerCallbackQuery(query.id);
    return;
  }
  
  // Подтверждение отмены бронирования
  if (data.startsWith('confirm_cancel_')) {
    const bookingId = data.replace('confirm_cancel_', '');
    
    try {
      const response = await axios.delete(`${BASE_URL}/api/user/bookings`, {
        data: { 
          bookingId, 
          chatId 
        }
      });
      
      if (response.data.success) {
        await bot.answerCallbackQuery(query.id, {
          text: '✅ Бронирование успешно отменено'
        });
        
        await bot.deleteMessage(chatId, query.message.message_id);
        await sendMessage(chatId, "✅ Ваше бронирование было успешно отменено.");
        
        // Если у пользователя остались другие бронирования, отправим обновленный список
        if (response.data.remainingBookings?.length > 0) {
          await showUserBookings(chatId);
        }
        
        // Уведомляем администратора об отмене
        if (adminChatId) {
          const bookingInfo = response.data.canceledBooking;
          const dateText = formatDateTime(bookingInfo.date, bookingInfo.time);
          const typeText = getActivityName(bookingInfo.type);
          
          const adminMessage = `❌ Отмена бронирования!\n\n👤 Имя: ${bookingInfo.name}\n📅 Дата: ${dateText}\n🏄‍♂️ Тип: ${typeText}`;
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
    
    return;
  }
});

// Команды администратора для просмотра бронирований
// Проверяем, является ли пользователь администратором
const isAdmin = (chatId) => adminChatId && chatId.toString() === adminChatId.toString();

// Бронирования на сегодня
bot.onText(/\/today/, async (msg) => {
  const chatId = msg.chat.id;
  
  if (!isAdmin(chatId)) {
    await sendMessage(chatId, "Эта команда доступна только администраторам.");
    return;
  }
  
  try {
    const response = await axios.get(`${BASE_URL}/api/admin/bookings/filtered?period=today&token=${process.env.ADMIN_TOKEN}`);
    
    if (response.data.success) {
      if (!response.data.bookings || response.data.bookings.length === 0) {
        await sendMessage(chatId, "На сегодня нет бронирований.");
        return;
      }
      
      const message = createAdminBookingsListMessage(response.data.bookings);
      await sendMessage(chatId, `📅 *Бронирования на сегодня*\n\n${message}`, { parse_mode: 'Markdown' });
    } else {
      await sendMessage(chatId, "Не удалось получить бронирования. Пожалуйста, попробуйте позже.");
    }
  } catch (error) {
    console.error('Error getting today bookings:', error);
    await sendMessage(chatId, "Произошла ошибка при получении бронирований.");
  }
});

// Бронирования на завтра
bot.onText(/\/tomorrow/, async (msg) => {
  const chatId = msg.chat.id;
  
  if (!isAdmin(chatId)) {
    await sendMessage(chatId, "Эта команда доступна только администраторам.");
    return;
  }
  
  try {
    const response = await axios.get(`${BASE_URL}/api/admin/bookings/filtered?period=tomorrow&token=${process.env.ADMIN_TOKEN}`);
    
    if (response.data.success) {
      if (!response.data.bookings || response.data.bookings.length === 0) {
        await sendMessage(chatId, "На завтра нет бронирований.");
        return;
      }
      
      const message = createAdminBookingsListMessage(response.data.bookings);
      await sendMessage(chatId, `📅 *Бронирования на завтра*\n\n${message}`, { parse_mode: 'Markdown' });
    } else {
      await sendMessage(chatId, "Не удалось получить бронирования. Пожалуйста, попробуйте позже.");
    }
  } catch (error) {
    console.error('Error getting tomorrow bookings:', error);
    await sendMessage(chatId, "Произошла ошибка при получении бронирований.");
  }
});

// Бронирования на неделю вперед
bot.onText(/\/nextweek/, async (msg) => {
  const chatId = msg.chat.id;
  
  if (!isAdmin(chatId)) {
    await sendMessage(chatId, "Эта команда доступна только администраторам.");
    return;
  }
  
  try {
    const response = await axios.get(`${BASE_URL}/api/admin/bookings/filtered?period=week&token=${process.env.ADMIN_TOKEN}`);
    
    if (response.data.success) {
      if (!response.data.bookings || response.data.bookings.length === 0) {
        await sendMessage(chatId, "На следующую неделю нет бронирований.");
        return;
      }
      
      const message = createAdminBookingsListMessage(response.data.bookings);
      await sendMessage(chatId, `📅 *Бронирования на неделю вперед*\n\n${message}`, { parse_mode: 'Markdown' });
    } else {
      await sendMessage(chatId, "Не удалось получить бронирования. Пожалуйста, попробуйте позже.");
    }
  } catch (error) {
    console.error('Error getting week bookings:', error);
    await sendMessage(chatId, "Произошла ошибка при получении бронирований.");
  }
});

// Бронирования на месяц вперед
bot.onText(/\/nextmonth/, async (msg) => {
  const chatId = msg.chat.id;
  
  if (!isAdmin(chatId)) {
    await sendMessage(chatId, "Эта команда доступна только администраторам.");
    return;
  }
  
  try {
    const response = await axios.get(`${BASE_URL}/api/admin/bookings/filtered?period=month&token=${process.env.ADMIN_TOKEN}`);
    
    if (response.data.success) {
      if (!response.data.bookings || response.data.bookings.length === 0) {
        await sendMessage(chatId, "На следующий месяц нет бронирований.");
        return;
      }
      
      const message = createAdminBookingsListMessage(response.data.bookings);
      await sendMessage(chatId, `📅 *Бронирования на месяц вперед*\n\n${message}`, { parse_mode: 'Markdown' });
    } else {
      await sendMessage(chatId, "Не удалось получить бронирования. Пожалуйста, попробуйте позже.");
    }
  } catch (error) {
    console.error('Error getting month bookings:', error);
    await sendMessage(chatId, "Произошла ошибка при получении бронирований.");
  }
});

// Все бронирования
bot.onText(/\/allbookings/, async (msg) => {
  const chatId = msg.chat.id;
  
  if (!isAdmin(chatId)) {
    await sendMessage(chatId, "Эта команда доступна только администраторам.");
    return;
  }
  
  try {
    const response = await axios.get(`${BASE_URL}/api/admin/bookings?token=${process.env.ADMIN_TOKEN}`);
    
    if (response.data.success) {
      if (!response.data.bookings || response.data.bookings.length === 0) {
        await sendMessage(chatId, "Нет активных бронирований.");
        return;
      }
      
      const message = createAdminBookingsListMessage(response.data.bookings);
      
      // Разбиваем на части, если сообщение слишком длинное
      const maxLength = 4000; // Максимальная длина сообщения в Telegram
      if (message.length > maxLength) {
        const parts = [];
        for (let i = 0; i < message.length; i += maxLength) {
          parts.push(message.substring(i, i + maxLength));
        }
        
        await sendMessage(chatId, `📅 *Все бронирования (часть 1/${parts.length})*\n\n${parts[0]}`, { parse_mode: 'Markdown' });
        
        for (let i = 1; i < parts.length; i++) {
          await sendMessage(chatId, `📅 *Все бронирования (часть ${i+1}/${parts.length})*\n\n${parts[i]}`, { parse_mode: 'Markdown' });
        }
      } else {
        await sendMessage(chatId, `📅 *Все бронирования*\n\n${message}`, { parse_mode: 'Markdown' });
      }
    } else {
      await sendMessage(chatId, "Не удалось получить бронирования. Пожалуйста, попробуйте позже.");
    }
  } catch (error) {
    console.error('Error getting all bookings:', error);
    await sendMessage(chatId, "Произошла ошибка при получении бронирований.");
  }
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
  
  // Сразу после приветствия отправляем справку по командам
  setTimeout(() => {
    const commandsText = isAdminUser ? getAdminCommands() : getUserCommands();
    bot.sendMessage(chatId, commandsText, { parse_mode: 'Markdown' });
  }, 500);
});

bot.on('message', (msg) => {
  if (!msg.text) return;
  
  const chatId = msg.chat.id;
  const text = msg.text.toLowerCase();
  
  // Команды для всех пользователей
  if (text === 'мои бронирования') {
    bot.emit('text', msg, ['/bookings']);
    return;
  } else if (text === 'помощь') {
    bot.emit('text', msg, ['/help']);
    return;
  } else if (text === 'отменить бронирование') {
    bot.emit('text', msg, ['/cancel']);
    return;
  }
  
  // Команды только для администраторов
  if (!isAdmin(chatId)) return;
  
  switch (text) {
    case 'сегодня':
      bot.emit('text', msg, ['/today']);
      break;
    case 'завтра':
      bot.emit('text', msg, ['/tomorrow']);
      break;
    case 'на неделю':
      bot.emit('text', msg, ['/nextweek']);
      break;
    case 'на месяц':
      bot.emit('text', msg, ['/nextmonth']);
      break;
    case 'все бронирования':
      bot.emit('text', msg, ['/allbookings']);
      break;
  }
});

// Список команд для пользователей
const getUserCommands = () => {
  return `🔹 *Доступные команды*:

/help - показать это сообщение
/bookings или /my - просмотреть ваши бронирования
/cancel - отменить бронирование

Используйте кнопки внизу экрана для быстрого доступа к командам.`;
};

// Список команд для администратора
const getAdminCommands = () => {
  return `🔸 *Команды администратора*:

/help - показать это сообщение
/today - бронирования на сегодня
/tomorrow - бронирования на завтра
/nextweek - бронирования на неделю вперед
/nextmonth - бронирования на месяц вперед
/allbookings - все бронирования
/bookings или /my - ваши личные бронирования
/cancel - отменить бронирование

Используйте кнопки внизу экрана для быстрого доступа к командам.`;
};

// Команда help
bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;
  const isAdminUser = isAdmin(chatId);
  
  const commandsText = isAdminUser ? getAdminCommands() : getUserCommands();
  await sendMessage(chatId, commandsText, { parse_mode: 'Markdown' });
});

// Добавляем команду отмены бронирования
bot.onText(/\/cancel/, async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    const response = await axios.get(`${BASE_URL}/api/user/bookings?chatId=${chatId}`);
    
    if (response.data.success && response.data.bookings && response.data.bookings.length > 0) {
      const bookings = response.data.bookings;
      
      // Создаем inline кнопки для каждого бронирования
      const inlineKeyboard = bookings.map((booking, index) => ([
        {
          text: `❌ Отменить: ${formatDateTime(booking.date, booking.time)} - ${getActivityName(booking.type)}`,
          callback_data: `cancel_${booking.id}`
        }
      ]));
      
      await sendMessage(chatId, "Выберите бронирование для отмены:", {
        reply_markup: {
          inline_keyboard: inlineKeyboard
        }
      });
    } else {
      await sendMessage(chatId, "У вас нет активных бронирований, которые можно отменить.");
    }
  } catch (error) {
    console.error('Error getting bookings for cancel:', error);
    await sendMessage(chatId, "Произошла ошибка при получении списка бронирований.");
  }
});

// Регистрируем команды в Telegram
bot.setMyCommands([
  { command: 'start', description: 'Начать работу с ботом' },
  { command: 'help', description: 'Показать список команд' },
  { command: 'bookings', description: 'Посмотреть мои бронирования' },
  { command: 'my', description: 'Посмотреть мои бронирования' },
  { command: 'cancel', description: 'Отменить бронирование' }
]);

// Дополнительные команды для администраторов устанавливаем отдельно
if (adminChatId) {
  try {
    bot.setMyCommands([
      { command: 'start', description: 'Начать работу с ботом' },
      { command: 'help', description: 'Показать список команд' },
      { command: 'bookings', description: 'Посмотреть мои бронирования' },
      { command: 'my', description: 'Посмотреть мои бронирования' },
      { command: 'cancel', description: 'Отменить бронирование' },
      { command: 'today', description: 'Бронирования на сегодня' },
      { command: 'tomorrow', description: 'Бронирования на завтра' },
      { command: 'nextweek', description: 'Бронирования на неделю' },
      { command: 'nextmonth', description: 'Бронирования на месяц' },
      { command: 'allbookings', description: 'Все бронирования' }
    ], { scope: { chat_id: adminChatId } });
  } catch (error) {
    console.error('Error setting admin commands:', error);
  }
}

console.log('Telegram bot started successfully');

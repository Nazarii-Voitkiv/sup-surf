import { NextResponse } from 'next/server';
import { FormData } from '@/types';
import { generateConfirmationId } from '@/utils/bookingUtils';

const pendingBookings = new Map();

export async function POST(request: Request) {
  try {
    const data: FormData = await request.json();
    
    if (!data.name || !data.date || !data.type) {
      return NextResponse.json({ success: false, message: 'Не заполнены обязательные поля' }, { status: 400 });
    }
    
    const botUsername = process.env.TELEGRAM_BOT_USERNAME;
    if (!botUsername) {
      return NextResponse.json({ success: false, message: 'Ошибка конфигурации сервера' }, { status: 500 });
    }
    
    const confirmationId = generateConfirmationId();
    pendingBookings.set(confirmationId, {
      ...data,
      createdAt: new Date().toISOString(),
      confirmed: false
    });
    
    return NextResponse.json({ 
      success: true, 
      confirmationId, 
      confirmationLink: `https://t.me/${botUsername}?start=${confirmationId}` 
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Не удалось обработать запрос' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  
  if (!id || !pendingBookings.has(id)) {
    return NextResponse.json({ success: false, message: 'Бронь не найдена' }, { status: 404 });
  }
  
  return NextResponse.json({ 
    success: true, 
    confirmed: pendingBookings.get(id).confirmed 
  });
}

export async function PUT(request: Request) {
  try {
    const { confirmationId, chatId, username } = await request.json();
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const adminChatId = process.env.ADMIN_CHAT_ID;
    
    if (!token || !pendingBookings.has(confirmationId)) {
      return NextResponse.json({ 
        success: false, 
        message: !token ? 'Ошибка конфигурации сервера' : 'Бронь не найдена'
      }, { status: !token ? 500 : 404 });
    }
    
    const booking = pendingBookings.get(confirmationId);
    booking.confirmed = true;
    booking.userChatId = chatId;
    booking.telegramUsername = username;
    
    const formattedDate = new Date(booking.date).toLocaleDateString('ru-RU', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
    const activityType = booking.type === 'sup' ? 'SUP-прогулку' : 'Серфинг';
    
    if (chatId) {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          chat_id: chatId, 
          text: `✅ Спасибо за подтверждение заявки!\n\n👤 Имя: ${booking.name}\n📅 Дата: ${formattedDate}\n🏄‍♂️ Тип: ${activityType}\n\nМы свяжемся с вами в ближайшее время 🌊` 
        })
      });
    }
    
    if (adminChatId) {
      const userTag = username ? `@${username}` : `ID: ${chatId}`;
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          chat_id: adminChatId, 
          text: `✅ Подтвержденная заявка!\n\n👤 Имя: ${booking.name}\n📅 Дата: ${formattedDate}\n🏄‍♂️ Тип: ${activityType}\n📱 Telegram: ${userTag}` 
        })
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Не удалось обработать запрос' }, { status: 500 });
  }
}
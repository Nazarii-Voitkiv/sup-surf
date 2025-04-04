import { FormData } from '@/types';
import { generateConfirmationId } from '@/utils/bookingUtils';
import supabase from '@/lib/supabase';
import { errorResponse, successResponse, sendTelegramNotification } from '@/utils/api';
import { formatDateTime, getActivityTypeText } from '@/utils/formatters';

const CONFIRMATION_TIMEOUT_MINUTES = parseInt(process.env.CONFIRMATION_TIMEOUT_MINUTES || '3', 10);

export async function POST(request: Request) {
  try {
    const data: FormData = await request.json();
    
    if (!data.name || !data.date || !data.time || !data.type || !data.phone) {
      return errorResponse('Не заполнены обязательные поля', 400);
    }
    
    const botUsername = process.env.TELEGRAM_BOT_USERNAME;
    if (!botUsername) {
      return errorResponse('Ошибка конфигурации сервера');
    }
    
    const confirmationId = generateConfirmationId();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + CONFIRMATION_TIMEOUT_MINUTES * 60000);
    
    const { error } = await supabase
      .from('bookings')
      .insert({
        name: data.name,
        phone: data.phone,
        date: new Date(data.date).toISOString().split('T')[0],
        time: data.time,
        type: data.type,
        created_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        confirmed: false,
        confirmation_id: confirmationId
      });

    if (error) {
      console.error('Error creating booking:', error);
      return errorResponse('Ошибка сохранения данных');
    }
    
    return successResponse({ 
      confirmationId, 
      expiresAt: expiresAt.toISOString(),
      confirmationLink: `https://t.me/${botUsername}?start=${confirmationId}` 
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return errorResponse('Не удалось обработать запрос');
  }
}

export async function GET(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get('id');
    
    if (!id) {
      return errorResponse('ID не указан', 400);
    }
    
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('name, date, time, type, confirmed')
      .eq('confirmation_id', id)
      .single();
    
    if (error || !booking) {
      return errorResponse('Бронь не найдена', 404);
    }
    
    return successResponse({ confirmed: booking.confirmed, booking });
  } catch (error) {
    console.error('Error getting booking:', error);
    return errorResponse('Ошибка сервера');
  }
}

export async function PUT(request: Request) {
  try {
    const { confirmationId, chatId, username } = await request.json();
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const adminChatId = process.env.ADMIN_CHAT_ID;
    
    if (!token) {
      return errorResponse('Ошибка конфигурации сервера');
    }
    
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('confirmation_id', confirmationId)
      .single();
    
    if (fetchError || !booking) {
      return errorResponse('Бронь не найдена', 404);
    }
    
    if (booking.confirmed) {
      return errorResponse('Эта заявка уже подтверждена', 400);
    }
    
    const now = new Date();
    const expiresAt = new Date(booking.expires_at);
    
    if (now > expiresAt) {
      return errorResponse('Время подтверждения истекло', 400);
    }
    
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        confirmed: true,
        user_chat_id: chatId,
        telegram_username: username
      })
      .eq('confirmation_id', confirmationId);
    
    if (updateError) {
      console.error('Error updating booking:', updateError);
      return errorResponse('Ошибка обновления данных');
    }
    
    const formattedDate = formatDateTime(booking.date, booking.time);
    const activityType = getActivityTypeText(booking.type);
    
    if (chatId) {
      const userMessage = `✅ Спасибо за подтверждение заявки!\n\n👤 Имя: ${booking.name}\n📅 Дата и время: ${formattedDate}\n🏄‍♂️ Тип: ${activityType}\n\nМы свяжемся с вами в ближайшее время 🌊`;
      await sendTelegramNotification(token, chatId, userMessage);
    }
    
    if (adminChatId) {
      const userTag = username ? `@${username}` : `ID: ${chatId}`;
      const adminMessage = `✅ Подтвержденная заявка!\n\n👤 Имя: ${booking.name}\n📞 Телефон: ${booking.phone}\n📅 Дата и время: ${formattedDate}\n🏄‍♂️ Тип: ${activityType}\n📱 Telegram: ${userTag}`;
      await sendTelegramNotification(token, adminChatId, adminMessage);
    }
    
    return successResponse({});
  } catch (error) {
    console.error('Error updating booking:', error);
    return errorResponse('Не удалось обработать запрос');
  }
}
import { NextResponse } from 'next/server';
import { FormData } from '@/types';

export async function POST(request: Request) {
  try {
    const data: FormData = await request.json();
    
    if (!data.name || !data.contact || !data.date || !data.type) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' }, 
        { status: 400 }
      );
    }
    
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const username = process.env.TELEGRAM_USERNAME;
    
    if (!token || !username) {
      return NextResponse.json(
        { success: false, message: 'Server configuration error' }, 
        { status: 500 }
      );
    }
    
    const formattedDate = new Date(data.date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    const activityType = data.type === 'sup' ? 'SUP-прогулку' : 'Серфинг';
    
    const message = `🔔 Новая заявка!\n\n👤 Имя: ${data.name}\n📞 Контакт: ${data.contact}\n📅 Дата: ${formattedDate}\n🏄‍♂️ Тип: ${activityType}`;
    
    const chatResponse = await fetch(
      `https://api.telegram.org/bot${token}/getUpdates`
    );
    
    const updates = await chatResponse.json();
    
    if (updates.ok && updates.result?.length > 0) {
      for (const update of updates.result) {
        if (update.message?.from?.username?.toLowerCase() === username.toLowerCase()) {
          const chatId = update.message.chat.id;
          
          const response = await fetch(
            `https://api.telegram.org/bot${token}/sendMessage`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: chatId,
                text: message
              })
            }
          );
          
          const result = await response.json();
          
          if (result.ok) {
            return NextResponse.json({ success: true });
          }
        }
      }
    }
    
    return NextResponse.json(
      { success: false, message: 'Failed to send notification. Please message the bot first.' }, 
      { status: 500 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to process request' }, 
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';

export const errorResponse = (message: string, status = 500) => 
  NextResponse.json({ success: false, message }, { status });

export const successResponse = (data: any) =>
  NextResponse.json({ success: true, ...data });

export async function sendTelegramNotification(token: string, chatId: string, text: string) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text })
    });
    
    return await response.json();
  } catch (err) {
    console.error(`Failed to send notification to ${chatId}:`, err);
    return null;
  }
}

import supabase from '@/lib/supabase';
import { errorResponse, successResponse } from '@/utils/api';

export async function GET(request: Request) {
  try {
    const adminToken = new URL(request.url).searchParams.get('token');
    const expectedToken = process.env.ADMIN_TOKEN;
    
    if (!adminToken || adminToken !== expectedToken) {
      return errorResponse('Доступ запрещен', 403);
    }
    
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('id, name, phone, date, time, type, confirmed, telegram_username, created_at')
      .order('date', { ascending: true });
    
    if (error) {
      console.error('Error fetching admin bookings:', error);
      return errorResponse('Ошибка получения данных', 500);
    }
    
    return successResponse({ 
      bookings: bookings.map(b => ({
        id: b.id,
        name: b.name,
        phone: b.phone,
        date: b.date,
        time: b.time,
        type: b.type,
        confirmed: b.confirmed,
        telegram: b.telegram_username,
        createdAt: b.created_at
      }))
    });
  } catch (error) {
    console.error('Error getting admin bookings:', error);
    return errorResponse('Ошибка сервера', 500);
  }
}

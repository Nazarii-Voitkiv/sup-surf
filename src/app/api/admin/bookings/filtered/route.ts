import supabase from '@/lib/supabase';
import { errorResponse, successResponse } from '@/utils/api';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const adminToken = url.searchParams.get('token');
    const period = url.searchParams.get('period');
    const expectedToken = process.env.ADMIN_TOKEN;
    
    if (!adminToken || adminToken !== expectedToken) {
      return errorResponse('Доступ запрещен', 403);
    }
    
    if (!period) {
      return errorResponse('Не указан период', 400);
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    let startDate: string;
    let endDate: string | null = null;
    let query;
    
    switch (period) {
      case 'today':
        startDate = today.toISOString().split('T')[0];
        endDate = tomorrow.toISOString().split('T')[0];
        break;
      case 'tomorrow':
        startDate = tomorrow.toISOString().split('T')[0];
        const dayAfterTomorrow = new Date(tomorrow);
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
        endDate = dayAfterTomorrow.toISOString().split('T')[0];
        break;
      case 'week':
        startDate = today.toISOString().split('T')[0];
        endDate = nextWeek.toISOString().split('T')[0];
        break;
      case 'month':
        startDate = today.toISOString().split('T')[0];
        endDate = nextMonth.toISOString().split('T')[0];
        break;
      default:
        return errorResponse('Неверный период', 400);
    }
    
    query = supabase
      .from('bookings')
      .select('id, name, phone, date, time, type, confirmed, telegram_username, created_at')
      .gte('date', startDate);
      
    if (endDate) {
      query = query.lt('date', endDate);
    }
    
    const { data: bookings, error } = await query.order('date', { ascending: true });
    
    if (error) {
      console.error(`Error fetching ${period} bookings:`, error);
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
    console.error('Error getting filtered bookings:', error);
    return errorResponse('Ошибка сервера', 500);
  }
}

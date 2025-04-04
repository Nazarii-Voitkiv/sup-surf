import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { errorResponse, successResponse } from '@/utils/api';
import { formatDateTime, getActivityTypeName } from '@/utils/formatters';

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();
    
    if (!phone) {
      return errorResponse('Номер телефона не указан', 400);
    }
    
    // Нормализация номера телефона (удаление всех нецифр)
    const normalizedPhone = phone.replace(/\D/g, '');
    
    // Поиск бронирований по номеру телефона
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('id, name, date, time, type, confirmed')
      .eq('confirmed', true)
      .ilike('phone', `%${normalizedPhone.slice(-10)}%`) // Ищем последние 10 цифр
      .order('date', { ascending: true });
    
    if (error) {
      console.error('Error fetching bookings by phone:', error);
      return errorResponse('Ошибка получения данных', 500);
    }
    
    if (!bookings || bookings.length === 0) {
      return errorResponse('По данному номеру телефона бронирований не найдено', 404);
    }
    
    // Форматируем данные для отображения
    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      date: formatDateTime(booking.date),
      time: booking.time || '10:00',
      type: getActivityTypeName(booking.type)
    }));
    
    return successResponse({
      bookings: formattedBookings
    });
  } catch (error) {
    console.error('Error verifying phone:', error);
    return errorResponse('Ошибка сервера', 500);
  }
}

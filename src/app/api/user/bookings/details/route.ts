import supabase from '@/lib/supabase';
import { errorResponse, successResponse } from '@/utils/api';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const bookingId = url.searchParams.get('bookingId');
    const chatId = url.searchParams.get('chatId');
    
    if (!bookingId || !chatId) {
      return errorResponse('Недостаточно данных', 400);
    }
    
    // Получаем данные о бронировании
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();
    
    if (error || !booking) {
      return errorResponse('Бронирование не найдено', 404);
    }
    
    // Проверяем, что бронирование принадлежит этому пользователю
    if (booking.user_chat_id !== chatId.toString()) {
      return errorResponse('Нет прав на просмотр этого бронирования', 403);
    }
    
    return successResponse({ booking });
  } catch (error) {
    console.error('Error getting booking details:', error);
    return errorResponse('Ошибка сервера', 500);
  }
}

import supabase from '@/lib/supabase';
import { errorResponse, successResponse } from '@/utils/api';

export async function GET(request: Request) {
  try {
    const chatId = new URL(request.url).searchParams.get('chatId');
    
    if (!chatId) {
      return errorResponse('Параметр chatId не указан', 400);
    }
    
    // Получаем бронирования пользователя, сортируем по дате (ближайшие сначала)
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('id, name, date, time, type, confirmed, created_at')
      .eq('user_chat_id', chatId)
      .eq('confirmed', true)
      .order('date', { ascending: true }); // Меняем сортировку на по возрастанию (ближайшие сначала)
    
    if (error) {
      console.error('Error fetching user bookings:', error);
      return errorResponse('Ошибка получения данных', 500);
    }
    
    return successResponse({ bookings });
  } catch (error) {
    console.error('Error getting user bookings:', error);
    return errorResponse('Ошибка сервера', 500);
  }
}

export async function DELETE(request: Request) {
  try {
    const { chatId, bookingId } = await request.json();
    
    if (!chatId || !bookingId) {
      return errorResponse('Недостаточно данных для отмены бронирования', 400);
    }
    
    // Сначала получаем информацию о бронировании, чтобы проверить права доступа
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();
      
    if (fetchError || !booking) {
      return errorResponse('Бронирование не найдено', 404);
    }
    
    // Проверяем, что бронирование принадлежит этому пользователю
    if (booking.user_chat_id !== chatId.toString()) {
      return errorResponse('Нет прав на отмену этого бронирования', 403);
    }
    
    // Удаляем бронирование
    const { error: deleteError } = await supabase
      .from('bookings')
      .delete()
      .eq('id', bookingId);
      
    if (deleteError) {
      console.error('Error deleting booking:', deleteError);
      return errorResponse('Ошибка при удалении бронирования', 500);
    }
    
    // Получаем оставшиеся бронирования пользователя
    const { data: remainingBookings, error: remainingError } = await supabase
      .from('bookings')
      .select('id, name, date, time, type, confirmed, created_at')
      .eq('user_chat_id', chatId)
      .eq('confirmed', true)
      .order('date', { ascending: true });
      
    if (remainingError) {
      console.error('Error fetching remaining bookings:', remainingError);
    }
    
    return successResponse({
      message: 'Бронирование успешно отменено',
      canceledBooking: booking,
      remainingBookings: remainingBookings || []
    });
    
  } catch (error) {
    console.error('Error canceling booking:', error);
    return errorResponse('Ошибка сервера при отмене бронирования', 500);
  }
}

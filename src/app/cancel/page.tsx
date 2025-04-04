"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CancelPage() {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'code' | 'success'>('phone');
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmitPhone = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/bookings/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Бронирований не найдено');
      }
      
      setBookings(data.bookings);
      setStep('code');
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка при проверке номера');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (id: string) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/bookings/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: id, phone })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Не удалось отменить бронирование');
      }
      
      setBookings(bookings.filter(booking => booking.id !== id));
      
      if (bookings.length <= 1) {
        setStep('success');
      }
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка при отмене бронирования');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-primary">СапСерф</h1>
          </Link>
          <h2 className="text-2xl font-bold mt-6 mb-2">Отмена бронирования</h2>
          <p className="text-gray-600">Отмените вашу заявку онлайн</p>
        </div>
        
        <div className="bg-white shadow-lg rounded-lg p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700">
              {error}
            </div>
          )}
          
          {step === 'phone' && (
            <form onSubmit={handleSubmitPhone}>
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  Введите номер телефона, указанный при бронировании
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="+7 (XXX) XXX-XX-XX"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3"
              >
                {loading ? 'Проверка...' : 'Найти бронирование'}
              </button>
            </form>
          )}
          
          {step === 'code' && (
            <div>
              <h3 className="text-xl font-bold mb-4">Ваши бронирования</h3>
              {bookings.length > 0 ? (
                <ul className="space-y-4">
                  {bookings.map(booking => (
                    <li key={booking.id} className="p-4 border rounded-lg bg-gray-50">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{booking.date}, {booking.time}</p>
                          <p className="text-gray-600">{booking.type === 'sup' ? 'SUP-прогулка' : 'Серфинг'}</p>
                        </div>
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          disabled={loading}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          Отменить
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-500">У вас нет активных бронирований</p>
              )}
              
              <button
                onClick={() => setStep('phone')}
                className="mt-6 text-primary hover:underline"
              >
                Назад
              </button>
            </div>
          )}
          
          {step === 'success' && (
            <div className="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <h3 className="text-xl font-bold mb-2">Бронирование отменено</h3>
              <p className="text-gray-600 mb-6">Ваше бронирование было успешно отменено.</p>
              
              <Link href="/" className="btn-primary inline-block px-6 py-2">
                На главную
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

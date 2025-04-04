"use client";

import { useState, useEffect } from 'react';
import { formatDateTime } from '@/utils/formatters';

interface Booking {
  id: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  type: string;
  confirmed: boolean;
  telegram?: string;
  createdAt: string;
}

export default function AdminPage() {
  const [token, setToken] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  async function fetchBookings(authToken: string) {
    try {
      const response = await fetch(`/api/admin/bookings?token=${encodeURIComponent(authToken)}`);
      const data = await response.json();
      
      if (data.success) {
        setBookings(data.bookings);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return false;
    }
  }
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    
    setLoading(true);
    try {
      const success = await fetchBookings(token);
      
      if (success) {
        setIsAuthenticated(true);
        localStorage.setItem('adminToken', token);
      } else {
        alert('Неверный токен доступа');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      alert('Ошибка при авторизации');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    const savedToken = localStorage.getItem('adminToken');
    if (savedToken) {
      setToken(savedToken);
      fetchBookings(savedToken).then(success => {
        if (success) {
          setIsAuthenticated(true);
        }
      });
    }
  }, []);
  
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
    setToken('');
    setBookings([]);
  };
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold mb-6 text-center">Админ-панель</h1>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Токен доступа</label>
              <input
                type="password"
                value={token}
                onChange={e => setToken(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                placeholder="Введите токен доступа"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-accent transition-colors"
            >
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Админ-панель</h1>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Выйти
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Имя</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Телефон</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата и время</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Тип</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telegram</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Создана</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.length > 0 ? (
                  bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{booking.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{booking.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{formatDateTime(booking.date, booking.time)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{booking.type === 'sup' ? 'SUP' : 'Серфинг'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${booking.confirmed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {booking.confirmed ? 'Подтверждена' : 'Ожидает'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{booking.telegram || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{formatDateTime(booking.createdAt)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      Нет бронирований
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

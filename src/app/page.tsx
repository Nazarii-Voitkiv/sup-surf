"use client";

import { useState } from "react";
import Image from "next/image";

export default function Home() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    date: "",
    type: ""
  });
  const [formErrors, setFormErrors] = useState({
    name: false,
    contact: false,
    date: false,
    type: false
  });
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: false
      });
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = {
      name: !formData.name,
      contact: !formData.contact,
      date: !formData.date,
      type: !formData.type
    };
    
    setFormErrors(errors);
    
    // If no errors, submit form
    if (!Object.values(errors).some(Boolean)) {
      console.log(formData);
      setFormSubmitted(true);
      
      // Reset form
      setFormData({
        name: "",
        contact: "",
        date: "",
        type: ""
      });
      
      setTimeout(() => setFormSubmitted(false), 3000);
    }
  };

  return (
    <main>
      {/* Navigation */}
      <nav className="bg-white shadow py-4 sticky top-0 z-50">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <a href="#" className="text-xl font-bold text-primary">СапСерф</a>
          
          <div className="hidden md:flex space-x-6">
            <a href="#about" className="hover:text-primary">О нас</a>
            <a href="#tours" className="hover:text-primary">Маршруты</a>
            <a href="#booking" className="hover:text-primary">Бронирование</a>
            <a href="#contact" className="hover:text-primary">Контакты</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative h-[70vh] flex items-center">
        <div className="absolute inset-0">
          <Image 
            src="/hero-bg.jpg" 
            alt="Сап-серфинг в Калининграде" 
            fill 
            priority
            style={{ objectFit: 'cover' }}
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-white text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Сап-прогулки и серфинг в Калининграде
          </h1>
          <p className="text-xl mb-6">
            Откройте для себя красоту Балтийского моря
          </p>
          <a 
            href="#booking" 
            className="btn-primary"
          >
            Записаться на прогулку
          </a>
        </div>
      </section>

      {/* About Us */}
      <section id="about" className="py-16 bg-light-blue">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">О нас</h2>
          
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/2">
              <p className="mb-4">
                Мы команда опытных инструкторов по SUP и серфингу, которые уже более 5 лет 
                организуют морские прогулки в Калининграде и окрестных курортах.
              </p>
              <p>
                Наша миссия — показать вам уникальную красоту Балтийского побережья 
                и научить наслаждаться водными видами спорта.
              </p>
            </div>
            <div className="md:w-1/2">
              <div className="relative h-64 rounded-lg overflow-hidden">
                <Image
                  src="/team.jpg"
                  alt="Наша команда"
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tours */}
      <section id="tours" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Наши маршруты</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tour 1 */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="relative h-48">
                <Image
                  src="/tour-1.jpg"
                  alt="Вдоль побережья"
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-bold mb-2">Вдоль побережья</h3>
                <p className="text-sm mb-2">Пляж Светлогорска</p>
                <p className="text-sm mb-2">2 часа</p>
                <p className="text-sm mb-4">1500 ₽ / человек</p>
                <a href="#booking" className="btn-primary block text-center">Выбрать</a>
              </div>
            </div>
            
            {/* Tour 2 */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="relative h-48">
                <Image
                  src="/tour-2.jpg"
                  alt="Вокруг острова"
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-bold mb-2">Вокруг острова</h3>
                <p className="text-sm mb-2">Остров Канта</p>
                <p className="text-sm mb-2">3 часа</p>
                <p className="text-sm mb-4">2000 ₽ / человек</p>
                <a href="#booking" className="btn-primary block text-center">Выбрать</a>
              </div>
            </div>
            
            {/* Tour 3 */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="relative h-48">
                <Image
                  src="/tour-3.jpg"
                  alt="Серфинг для начинающих"
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-bold mb-2">Серфинг для начинающих</h3>
                <p className="text-sm mb-2">Зеленоградск</p>
                <p className="text-sm mb-2">4 часа</p>
                <p className="text-sm mb-4">3000 ₽ / человек</p>
                <a href="#booking" className="btn-primary block text-center">Выбрать</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking */}
      <section id="booking" className="py-16 bg-light-blue">
        <div className="container mx-auto px-4 max-w-md">
          <h2 className="text-3xl font-bold text-center mb-8">Забронировать прогулку</h2>
          
          {formSubmitted ? (
            <div className="bg-green-100 border border-green-400 text-green-700 p-4 rounded text-center">
              <p>Спасибо за заявку! Мы свяжемся с вами в ближайшее время.</p>
            </div>
          ) : (
            <form 
              onSubmit={handleSubmit}
              className="bg-white rounded-lg shadow p-6"
            >
              <div className="mb-4">
                <label className="block mb-1">Ваше имя</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                />
                {formErrors.name && <span className="text-red-500 text-sm">Обязательное поле</span>}
              </div>
              
              <div className="mb-4">
                <label className="block mb-1">Телефон или Telegram</label>
                <input
                  type="text"
                  name="contact"
                  value={formData.contact}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded ${formErrors.contact ? 'border-red-500' : 'border-gray-300'}`}
                />
                {formErrors.contact && <span className="text-red-500 text-sm">Обязательное поле</span>}
              </div>
              
              <div className="mb-4">
                <label className="block mb-1">Дата</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded ${formErrors.date ? 'border-red-500' : 'border-gray-300'}`}
                />
                {formErrors.date && <span className="text-red-500 text-sm">Обязательное поле</span>}
              </div>
              
              <div className="mb-6">
                <label className="block mb-1">Тип активности</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded ${formErrors.type ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Выберите тип...</option>
                  <option value="sup">SUP-прогулка</option>
                  <option value="surfing">Серфинг</option>
                </select>
                {formErrors.type && <span className="text-red-500 text-sm">Выберите тип активности</span>}
              </div>
              
              <button 
                type="submit"
                className="btn-primary w-full"
              >
                Отправить заявку
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-16 bg-light-blue">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Контакты</h2>
          
          <div className="flex flex-col md:flex-row justify-center gap-8">
            <div>
              <h3 className="font-bold mb-2">Телефон</h3>
              <p>+7 (123) 456-78-90</p>
            </div>
            <div>
              <h3 className="font-bold mb-2">Email</h3>
              <p>info@sapsurf.ru</p>
            </div>
            <div>
              <h3 className="font-bold mb-2">Социальные сети</h3>
              <div className="flex justify-center gap-4">
                <a href="#" className="text-primary">Instagram</a>
                <a href="#" className="text-primary">Telegram</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white py-4 text-center">
        <div className="container mx-auto px-4">
          <p>© {new Date().getFullYear()} СапСерф Калининград. Все права защищены.</p>
        </div>
      </footer>
    </main>
  );
}

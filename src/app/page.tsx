"use client";

import { useState, useEffect } from "react";
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
  
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: false
      });
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const errors = {
      name: !formData.name,
      contact: !formData.contact,
      date: !formData.date,
      type: !formData.type
    };
    
    setFormErrors(errors);
    
    if (!Object.values(errors).some(Boolean)) {
      console.log(formData);
      setFormSubmitted(true);
      
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
    <main className="overflow-hidden">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow py-2' : 'bg-transparent py-4'}`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          <a href="#" className={`text-2xl font-bold transition-colors ${isScrolled ? 'text-primary' : 'text-white'}`}>
            СапСерф
          </a>
          
          <div className="hidden md:flex space-x-6">
            <a href="#about" className={`transition-colors ${isScrolled ? 'text-gray-800 hover:text-primary' : 'text-white hover:text-white/80'}`}>О нас</a>
            <a href="#tours" className={`transition-colors ${isScrolled ? 'text-gray-800 hover:text-primary' : 'text-white hover:text-white/80'}`}>Маршруты</a>
            <a href="#booking" className={`transition-colors ${isScrolled ? 'text-gray-800 hover:text-primary' : 'text-white hover:text-white/80'}`}>Бронирование</a>
            <a href="#contact" className={`transition-colors ${isScrolled ? 'text-gray-800 hover:text-primary' : 'text-white hover:text-white/80'}`}>Контакты</a>
          </div>
          
          <div className="md:hidden">
            <button className={`${isScrolled ? 'text-gray-800' : 'text-white'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative h-screen flex items-center">
        <div className="absolute inset-0">
          <Image 
            src="/hero-bg.jpg" 
            alt="Сап-серфинг в Калининграде" 
            fill 
            priority
            style={{ objectFit: 'cover' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/30"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-white">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Сап-прогулки и серфинг в Калининграде
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Откройте для себя красоту Балтийского моря с профессиональными инструкторами
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="#booking" 
                className="btn-primary text-center text-lg"
              >
                Записаться на прогулку
              </a>
              <a 
                href="#tours" 
                className="border-2 border-white text-white rounded-full py-3 px-6 text-center hover:bg-white/20 transition-all"
              >
                Смотреть маршруты
              </a>
            </div>
          </div>
        </div>
        
        {/* Clear wave divider fixed at the very bottom of the hero image */}
        <div className="absolute bottom-0 left-0 w-full">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-[100px] text-white">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="currentColor"></path>
          </svg>
        </div>
      </section>

      {/* About Us */}
      <section id="about" className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="md:w-1/2 order-2 md:order-1">
              <h2 className="text-4xl font-bold mb-6 text-gray-800">О нас</h2>
              <div className="w-20 h-1 bg-primary mb-8"></div>
              
              <p className="text-lg mb-6 text-gray-700">
                Мы команда опытных инструкторов по SUP и серфингу, которые уже более 5 лет 
                организуют морские прогулки в Калининграде и окрестных курортах.
              </p>
              <p className="text-lg mb-8 text-gray-700">
                Наша миссия — показать вам уникальную красоту Балтийского побережья 
                и научить наслаждаться водными видами спорта.
              </p>
              
              <div className="flex gap-8">
                <div>
                  <div className="text-3xl font-bold text-primary">5+</div>
                  <div className="text-gray-600">Лет опыта</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">1000+</div>
                  <div className="text-gray-600">Довольных клиентов</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">3</div>
                  <div className="text-gray-600">Маршрута</div>
                </div>
              </div>
            </div>
            <div className="md:w-1/2 order-1 md:order-2">
              <div className="relative h-96 w-full rounded-lg overflow-hidden shadow-2xl">
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
      
      <div className="bg-light-blue relative">
        <div className="wave-divider wave-divider-top"></div>
        
        {/* Tours */}
        <section id="tours" className="py-20 bg-light-blue">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-4 text-gray-800">Наши маршруты</h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              Выберите один из наших уникальных маршрутов и отправляйтесь 
              в незабываемое путешествие по водам Балтики
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Tour 1 */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden tour-card">
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src="/tour-1.jpg"
                    alt="Вдоль побережья"
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                  <div className="absolute top-3 right-3 bg-primary text-white text-sm font-medium py-1 px-3 rounded-full">
                    Популярный
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-3">Вдоль побережья</h3>
                  
                  <div className="flex items-center text-gray-600 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span>Пляж Светлогорска</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span>2 часа</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                      <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                    </svg>
                    <span>1500 ₽ / человек</span>
                  </div>
                  
                  <p className="text-gray-600 mb-6">
                    Идеальный маршрут для начинающих с прекрасными видами вдоль побережья.
                  </p>
                  
                  <a href="#booking" className="btn-primary w-full block text-center">Выбрать</a>
                </div>
              </div>
              
              {/* Tour 2 */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden tour-card">
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src="/tour-2.jpg"
                    alt="Вокруг острова"
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-3">Вокруг острова</h3>
                  
                  <div className="flex items-center text-gray-600 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span>Остров Канта</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span>3 часа</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                      <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                    </svg>
                    <span>2000 ₽ / человек</span>
                  </div>
                  
                  <p className="text-gray-600 mb-6">
                    Захватывающий маршрут средней сложности с посещением исторических мест.
                  </p>
                  
                  <a href="#booking" className="btn-primary w-full block text-center">Выбрать</a>
                </div>
              </div>
              
              {/* Tour 3 */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden tour-card">
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src="/tour-3.jpg"
                    alt="Серфинг для начинающих"
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                  <div className="absolute top-3 right-3 bg-amber-500 text-white text-sm font-medium py-1 px-3 rounded-full">
                    Обучение
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-3">Серфинг для начинающих</h3>
                  
                  <div className="flex items-center text-gray-600 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span>Зеленоградск</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span>4 часа</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                      <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                    </svg>
                    <span>3000 ₽ / человек</span>
                  </div>
                  
                  <p className="text-gray-600 mb-6">
                    Полный курс для начинающих, включающий теорию и практику на волнах.
                  </p>
                  
                  <a href="#booking" className="btn-primary w-full block text-center">Выбрать</a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Booking */}
      <section id="booking" className="py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 lg:pr-20">
              <h2 className="text-4xl font-bold mb-6">Забронировать прогулку</h2>
              <div className="w-20 h-1 bg-primary mb-8"></div>
              <p className="text-lg text-gray-600 mb-8">
                Заполните форму, чтобы забронировать место на одном из наших маршрутов. 
                Мы свяжемся с вами для подтверждения деталей.
              </p>
              
              <div className="bg-light-blue rounded-lg p-6 mb-6">
                <h3 className="font-bold text-xl mb-3">Что включено:</h3>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <svg className="h-5 w-5 mr-2 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Все необходимое оборудование
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 mr-2 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Инструктаж и страховка
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 mr-2 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Фото на память
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="md:w-1/2 w-full max-w-md mx-auto md:max-w-none">
              {formSubmitted ? (
                <div className="bg-green-50 border border-green-200 text-green-800 p-8 rounded-lg text-center shadow-lg">
                  <svg className="h-16 w-16 text-green-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <h3 className="text-2xl font-bold mb-2">Спасибо за заявку!</h3>
                  <p className="text-lg">Мы свяжемся с вами в ближайшее время для подтверждения деталей.</p>
                </div>
              ) : (
                <form 
                  onSubmit={handleSubmit}
                  className="bg-white rounded-lg shadow-xl p-8"
                >
                  <div className="mb-5">
                    <label className="block text-gray-700 font-medium mb-2">Ваше имя</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none transition ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Иван Иванов"
                    />
                    {formErrors.name && <span className="text-red-500 text-sm mt-1 block">Обязательное поле</span>}
                  </div>
                  
                  <div className="mb-5">
                    <label className="block text-gray-700 font-medium mb-2">Телефон или Telegram</label>
                    <input
                      type="text"
                      name="contact"
                      value={formData.contact}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none transition ${formErrors.contact ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="+7 (XXX) XXX-XX-XX или @username"
                    />
                    {formErrors.contact && <span className="text-red-500 text-sm mt-1 block">Обязательное поле</span>}
                  </div>
                  
                  <div className="mb-5">
                    <label className="block text-gray-700 font-medium mb-2">Дата прогулки</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none transition ${formErrors.date ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {formErrors.date && <span className="text-red-500 text-sm mt-1 block">Обязательное поле</span>}
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-2">Тип активности</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none transition ${formErrors.type ? 'border-red-500' : 'border-gray-300'}`}
                    >
                      <option value="">Выберите тип...</option>
                      <option value="sup">SUP-прогулка</option>
                      <option value="surfing">Серфинг</option>
                    </select>
                    {formErrors.type && <span className="text-red-500 text-sm mt-1 block">Выберите тип активности</span>}
                  </div>
                  
                  <button 
                    type="submit"
                    className="btn-primary w-full text-lg py-3"
                  >
                    Отправить заявку
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-16 bg-light-blue">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">Контакты</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Телефон</h3>
              <p className="text-gray-600">+7 (123) 456-78-90</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Email</h3>
              <p className="text-gray-600">info@sapsurf.ru</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Соцсети</h3>
              <div className="flex justify-center gap-4">
                <a href="#" className="text-primary hover:text-accent transition-colors">Instagram</a>
                <a href="#" className="text-primary hover:text-accent transition-colors">Telegram</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white py-8 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-4">СапСерф</h2>
          <p className="mb-6 max-w-md mx-auto">Морские прогулки и серфинг в Калининграде. Отдых и приключения на воде для всей семьи.</p>
          <div className="h-px w-24 bg-white/30 mx-auto mb-6"></div>
          <p>© {new Date().getFullYear()} СапСерф Калининград. Все права защищены.</p>
        </div>
      </footer>
    </main>
  );
}

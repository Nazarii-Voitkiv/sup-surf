import { FormData } from "../types";

const TELEGRAM_BOT_TOKEN = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;
const API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

export async function sendTelegramNotification(data: FormData): Promise<boolean> {
  try {
    const formattedDate = new Date(data.date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    const activityType = data.type === 'sup' ? 'SUP-прогулку' : 'Серфинг';
    
    const message = `🔔 Новая заявка!\n\n👤 Имя: ${data.name}\n📞 Контакт: ${data.contact}\n📅 Дата: ${formattedDate}\n🏄‍♂️ Тип: ${activityType}`;
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      })
    });
    
    const result = await response.json();
    return result.ok;
  } catch (error) {
    console.error('Failed to send Telegram notification:', error);
    return false;
  }
}
```

### /Users/nazarii/IdeaProjects/sup-surf/src/app/page.tsx

````tsx
// filepath: /Users/nazarii/IdeaProjects/sup-surf/src/app/page.tsx
"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import Image from "next/image";

import { TourCard } from "../components/TourCard";
import { FormInput } from "../components/FormInput";
import { SectionHeader } from "../components/SectionHeader";
import { CheckIcon, MenuIcon } from "../components/Icons";
import { useScrollPosition } from "../hooks/useScrollPosition";
import { sendTelegramNotification } from "../services/telegram";
import { tours } from "../data/tours";
import { FormData, FormErrors } from "../types";

export default function Home() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    contact: "",
    date: "",
    type: ""
  });
  
  const [formErrors, setFormErrors] = useState<FormErrors>({
    name: false,
    contact: false,
    date: false,
    type: false
  });
  
  const isScrolled = useScrollPosition();
  
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: false
      }));
    }
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    const errors = {
      name: !formData.name,
      contact: !formData.contact,
      date: !formData.date,
      type: !formData.type
    };
    
    setFormErrors(errors);
    
    if (!Object.values(errors).some(Boolean)) {
      setIsSubmitting(true);
      
      try {
        await sendTelegramNotification(formData);
        setFormSubmitted(true);
        
        setFormData({
          name: "",
          contact: "",
          date: "",
          type: ""
        });
        
        setTimeout(() => setFormSubmitted(false), 3000);
      } catch (error) {
        console.error("Failed to process booking:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <main className="overflow-hidden">
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow py-2' : 'bg-transparent py-4'}`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          <a href="#" className={`text-2xl font-bold transition-colors ${isScrolled ? 'text-primary' : 'text-white'}`}>
            СапСерф
          </a>
          
          <div className="hidden md:flex space-x-6">
            {['О нас', 'Маршруты', 'Бронирование', 'Контакты'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                className={`transition-colors ${isScrolled ? 'text-gray-800 hover:text-primary' : 'text-white hover:text-white/80'}`}
              >
                {item}
              </a>
            ))}
          </div>
          
          <div className="md:hidden">
            <button className={`${isScrolled ? 'text-gray-800' : 'text-white'}`}>
              <MenuIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

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
        
        <div className="absolute bottom-0 left-0 w-full">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-[100px] text-white">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="currentColor"></path>
          </svg>
        </div>
      </section>

      <section id="about" className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="md:w-1/2 order-2 md:order-1">
              <SectionHeader 
                title="О нас"
                subtitle="Мы команда опытных инструкторов по SUP и серфингу, которые уже более 5 лет организуют морские прогулки в Калининграде и окрестных курортах."
              />
              
              <p className="text-lg mb-8 text-gray-700">
                Наша миссия — показать вам уникальную красоту Балтийского побережья 
                и научить наслаждаться водными видами спорта.
              </p>
              
              <div className="flex gap-8">
                {[
                  { value: '5+', label: 'Лет опыта' },
                  { value: '1000+', label: 'Довольных клиентов' },
                  { value: '3', label: 'Маршрута' }
                ].map(stat => (
                  <div key={stat.label}>
                    <div className="text-3xl font-bold text-primary">{stat.value}</div>
                    <div className="text-gray-600">{stat.label}</div>
                  </div>
                ))}
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
      
      <div className="section-divider"></div>
      
      <section id="tours" className="py-20 bg-light-blue">
        <div className="container mx-auto px-4">
          <SectionHeader 
            title="Наши маршруты"
            subtitle="Выберите один из наших уникальных маршрутов и отправляйтесь в незабываемое путешествие по водам Балтики"
            alignment="center"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tours.map(tour => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        </div>
      </section>
      
      <div className="section-divider"></div>

      <section id="booking" className="py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 lg:pr-20">
              <SectionHeader 
                title="Забронировать прогулку"
                subtitle="Заполните форму, чтобы забронировать место на одном из наших маршрутов. Мы свяжемся с вами для подтверждения деталей."
              />
              
              <div className="bg-light-blue rounded-lg p-6 mb-6">
                <h3 className="font-bold text-xl mb-3">Что включено:</h3>
                <ul className="space-y-2">
                  {['Все необходимое оборудование', 'Инструктаж и страховка', 'Фото на память'].map(item => (
                    <li key={item} className="flex items-center">
                      <CheckIcon className="h-5 w-5 mr-2 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="md:w-1/2 w-full max-w-md mx-auto md:max-w-none">
              {formSubmitted ? (
                <div className="bg-green-50 border border-green-200 text-green-800 p-8 rounded-lg text-center shadow-lg">
                  <CheckIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Спасибо за заявку!</h3>
                  <p className="text-lg">Мы свяжемся с вами в ближайшее время для подтверждения деталей.</p>
                </div>
              ) : (
                <form 
                  onSubmit={handleSubmit}
                  className="bg-white rounded-lg shadow-xl p-8"
                >
                  <FormInput
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    label="Ваше имя"
                    placeholder="Иван Иванов"
                    error={formErrors.name}
                  />
                  
                  <FormInput
                    type="text"
                    name="contact"
                    value={formData.contact}
                    onChange={handleInputChange}
                    label="Телефон или Telegram"
                    placeholder="+7 (XXX) XXX-XX-XX или @username"
                    error={formErrors.contact}
                  />
                  
                  <FormInput
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    label="Дата прогулки"
                    error={formErrors.date}
                  />
                  
                  <FormInput
                    type="select"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    label="Тип активности"
                    error={formErrors.type}
                    errorMessage="Выберите тип активности"
                    options={[
                      { value: '', label: 'Выберите тип...' },
                      { value: 'sup', label: 'SUP-прогулка' },
                      { value: 'surfing', label: 'Серфинг' }
                    ]}
                  />
                  
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary w-full text-lg py-3 relative"
                  >
                    {isSubmitting ? (
                      <span className="inline-flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Отправка...
                      </span>
                    ) : (
                      'Отправить заявку'
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider"></div>

      <section id="contact" className="py-16 bg-light-blue">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">Контакты</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center max-w-4xl mx-auto">
            {[
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                ),
                title: "Телефон",
                content: "+7 (123) 456-78-90"
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                ),
                title: "Email",
                content: "info@sapsurf.ru"
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                  </svg>
                ),
                title: "Соцсети",
                content: (
                  <div className="flex justify-center gap-4">
                    <a href="#" className="text-primary hover:text-accent transition-colors">Instagram</a>
                    <a href="#" className="text-primary hover:text-accent transition-colors">Telegram</a>
                  </div>
                )
              }
            ].map((contact, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-lg">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  {contact.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{contact.title}</h3>
                {typeof contact.content === 'string' ? (
                  <p className="text-gray-600">{contact.content}</p>
                ) : contact.content}
              </div>
            ))}
          </div>
        </div>
      </section>

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
````

### /Users/nazarii/IdeaProjects/sup-surf/src/app/.env.local (Create this file)


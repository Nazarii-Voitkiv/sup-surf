import { Route, Review, CompanyInfo } from '@/types';

export const ROUTES: Route[] = [
  {
    id: 'sunrise-route',
    title: 'Ранковий схід сонця',
    description: 'Незабутні враження від прогулянки на SUP-дошці на світанку з видами на вранішнє місто та затоку.',
    image: 'https://images.unsplash.com/photo-1626427327128-3e0972783b8c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    difficulty: 'easy',
    duration: '1.5 години',
    distance: '3 км',
    price: 450,
  },
  {
    id: 'bay-adventure',
    title: 'Пригода в затоці',
    description: 'Дослідіть приховані пляжі та мальовничі скелі затоки. Включає зупинку для пікніка та плавання.',
    image: 'https://images.unsplash.com/photo-1517176118179-65244903d13c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    difficulty: 'medium',
    duration: '2.5 години',
    distance: '5 км',
    price: 600,
  },
  {
    id: 'island-tour',
    title: 'Тур навколо острова',
    description: 'Повний обхід острова Канта з зупинками біля найцікавіших пам'яток. Ідеально для любителів історії.',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    difficulty: 'medium',
    duration: '3 години',
    distance: '6 км',
    price: 650,
  },
  {
    id: 'sunset-cruise',
    title: 'Вечірній круїз',
    description: 'Романтична прогулянка на заході сонця з приголомшливими видами на місто у вечірніх вогнях.',
    image: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    difficulty: 'easy',
    duration: '2 години',
    distance: '4 км',
    price: 550,
  },
];

export const REVIEWS: Review[] = [
  {
    id: '1',
    name: 'Олена К.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    text: 'Неймовірний досвід! Інструктори дуже уважні та професійні. Прогулянка на світанку залишила незабутні враження та чудові фото!',
    rating: 5,
    date: '2023-06-15',
  },
  {
    id: '2',
    name: 'Максим П.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    text: 'Вперше спробував серфінг і це було неймовірно! Дуже дякую тренеру за терпіння та підтримку.',
    rating: 5,
    date: '2023-06-10',
  },
  {
    id: '3',
    name: 'Ірина В.',
    avatar: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    text: 'Організували з друзями корпоративну сап-прогулянку. Все було чудово, всі залишились задоволені!',
    rating: 4,
    date: '2023-05-28',
  },
];

export const COMPANY_INFO = {
  name: 'SUP SURF Калінінград',
  phone: '+7 (999) 123-45-67',
  email: 'info@supsurfkaliningrad.ru',
  address: 'м. Калінінград, вул. Приморська, 15',
  location: {
    latitude: 54.7104,
    longitude: 20.5101,
  },
  socials: {
    telegram: 'https://t.me/supsurfkaliningrad',
    instagram: 'https://instagram.com/supsurfkaliningrad',
    vkontakte: 'https://vk.com/supsurfkaliningrad',
  },
};

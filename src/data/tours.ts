import { TourData } from '../types';

export const tours: TourData[] = [
  {
    id: 'coastal',
    title: 'Вдоль побережья',
    image: '/tour-1.jpg',
    location: 'Пляж Светлогорска',
    duration: '2 часа',
    price: 1500,
    description: 'Идеальный маршрут для начинающих с прекрасными видами вдоль побережья.',
    badge: {
      text: 'Популярный',
      color: 'primary'
    }
  },
  {
    id: 'island',
    title: 'Вокруг острова',
    image: '/tour-2.jpg',
    location: 'Остров Канта',
    duration: '3 часа',
    price: 2000,
    description: 'Захватывающий маршрут средней сложности с посещением исторических мест.'
  },
  {
    id: 'beginner-surfing',
    title: 'Серфинг для начинающих',
    image: '/tour-3.jpg',
    location: 'Зеленоградск',
    duration: '4 часа',
    price: 3000,
    description: 'Полный курс для начинающих, включающий теорию и практику на волнах.',
    badge: {
      text: 'Обучение',
      color: 'amber-500'
    }
  }
];

import Image from 'next/image';
import { TourData } from '../types';
import { LocationIcon, ClockIcon, PriceIcon } from './Icons';

interface TourCardProps {
  tour: TourData;
}

export const TourCard = ({ tour }: TourCardProps) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden tour-card">
      <div className="relative h-56 overflow-hidden">
        <Image
          src={tour.image}
          alt={tour.title}
          fill
          style={{ objectFit: 'cover' }}
        />
        {tour.badge && (
          <div className={`absolute top-3 right-3 bg-${tour.badge.color} text-white text-sm font-medium py-1 px-3 rounded-full`}>
            {tour.badge.text}
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-2xl font-bold mb-3">{tour.title}</h3>
        
        <div className="flex items-center text-gray-600 mb-2">
          <LocationIcon className="h-5 w-5 mr-2 text-primary" />
          <span>{tour.location}</span>
        </div>
        
        <div className="flex items-center text-gray-600 mb-2">
          <ClockIcon className="h-5 w-5 mr-2 text-primary" />
          <span>{tour.duration}</span>
        </div>
        
        <div className="flex items-center text-gray-600 mb-4">
          <PriceIcon className="h-5 w-5 mr-2 text-primary" />
          <span>{tour.price} ₽ / человек</span>
        </div>
        
        <p className="text-gray-600 mb-6">
          {tour.description}
        </p>
        
        <a href="#booking" className="btn-primary w-full block text-center">Выбрать</a>
      </div>
    </div>
  );
};

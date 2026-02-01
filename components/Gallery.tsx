
import React from 'react';
import { GALLERY_IMAGES } from '../constants';

const Gallery: React.FC = () => {
  return (
    <div className="py-16 px-4 max-w-6xl mx-auto">
      <h2 className="text-4xl font-serif font-bold text-center text-rose-800 mb-12">Stolen Moments</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {GALLERY_IMAGES.map((image) => (
          <div key={image.id} className="group relative overflow-hidden rounded-3xl shadow-xl aspect-square">
            <img 
              src={image.imageUrl} 
              alt={image.caption} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-rose-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
              <p className="text-white font-romantic text-2xl">{image.caption}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery;

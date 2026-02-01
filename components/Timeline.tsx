
import React from 'react';
import { MILESTONES } from '../constants';

const Timeline: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-16 px-4">
      <h2 className="text-4xl font-serif font-bold text-center text-rose-800 mb-16">Our Journey</h2>
      <div className="relative">
        {/* Central Line */}
        <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-rose-200 hidden md:block"></div>
        
        <div className="space-y-12">
          {MILESTONES.map((milestone, index) => (
            <div key={milestone.id} className={`flex flex-col md:flex-row items-center ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
              <div className="md:w-1/2 w-full px-4 md:px-8">
                <div className="bg-white p-6 rounded-3xl shadow-lg border border-rose-50 transform transition hover:scale-[1.02] duration-300">
                  <img 
                    src={milestone.image} 
                    alt={milestone.title} 
                    className="w-full h-48 object-cover rounded-2xl mb-4"
                  />
                  <span className="text-rose-500 font-bold text-sm tracking-widest">{milestone.date}</span>
                  <h3 className="text-xl font-bold text-rose-800 my-2">{milestone.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{milestone.description}</p>
                </div>
              </div>
              <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-10 h-10 bg-rose-500 rounded-full border-4 border-white shadow-md items-center justify-center z-10">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
              <div className="md:w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Timeline;

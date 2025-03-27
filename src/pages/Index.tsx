
import { useState } from 'react';
import Calendar from '@/components/Calendar';
import { events } from '@/data/events';
import { toast } from 'sonner';

const Index = () => {
  const [selectedEvent, setSelectedEvent] = useState(null);

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    toast.info(`Selected: ${event.title}`, {
      description: `Category: ${event.category || 'General'}`
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900">Calendar</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            A minimalist calendar with responsive event handling and elegant animations
          </p>
        </header>
        
        <main className="animate-fade-in">
          <Calendar 
            events={events} 
            onEventClick={handleEventClick} 
          />
        </main>
      </div>
    </div>
  );
};

export default Index;

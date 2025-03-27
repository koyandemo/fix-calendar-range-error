
import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Event {
  id: string;
  title: string;
  date: Date;
  category?: string;
}

interface CalendarProps {
  events?: Event[];
  onEventClick?: (event: Event) => void;
}

const DAYS_OF_WEEK = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const Calendar: React.FC<CalendarProps> = ({ 
  events = [], 
  onEventClick 
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [animationDirection, setAnimationDirection] = useState<'left' | 'right' | null>(null);

  const firstDayOfMonth = startOfMonth(currentMonth);
  const lastDayOfMonth = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: firstDayOfMonth, end: lastDayOfMonth });

  // Calculate days from previous month to fill the first row
  const startDay = firstDayOfMonth.getDay();
  
  // Calculate days from next month to fill the last row
  const endDay = lastDayOfMonth.getDay();
  const totalCells = Math.ceil((daysInMonth.length + startDay) / 7) * 7;
  
  const goToPreviousMonth = () => {
    setAnimationDirection('right');
    setTimeout(() => {
      setCurrentMonth(subMonths(currentMonth, 1));
      setAnimationDirection(null);
    }, 200);
  };

  const goToNextMonth = () => {
    setAnimationDirection('left');
    setTimeout(() => {
      setCurrentMonth(addMonths(currentMonth, 1));
      setAnimationDirection(null);
    }, 200);
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
    toast.success("Calendar set to current month");
  };

  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(new Date(event.date), day));
  };

  const handleEventClick = (event: Event) => {
    if (onEventClick) {
      onEventClick(event);
    } else {
      toast.info(`Event: ${event.title}`, {
        description: format(new Date(event.date), 'EEEE, MMMM do yyyy')
      });
    }
  };

  const animationClasses = {
    'left': 'animate-slide-left',
    'right': 'animate-slide-right',
    null: ''
  };

  return (
    <div className="calendar-container p-4">
      <div className="calendar-controls">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={goToPreviousMonth}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={goToNextMonth}
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={goToToday}
          className="text-sm"
        >
          Today
        </Button>
      </div>
      
      <div className={cn("calendar-grid transition-opacity duration-200", {
        'opacity-0': animationDirection !== null,
        'opacity-100': animationDirection === null
      })}>
        {DAYS_OF_WEEK.map((day) => (
          <div key={day} className="calendar-header">
            {day}
          </div>
        ))}
        
        {Array.from({ length: totalCells }).map((_, index) => {
          const dayIndex = index - startDay;
          const date = new Date(currentMonth);
          date.setDate(1 + dayIndex);
          
          // Check if it's current month
          const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
          
          // Check if it's today
          const isToday = isSameDay(date, new Date());
          
          const dayEvents = getEventsForDay(date);
          
          return (
            <div 
              key={index} 
              className={cn("calendar-cell", {
                "opacity-40": !isCurrentMonth,
                "calendar-today": isToday
              })}
            >
              <div className="calendar-day-number">
                {format(date, 'd')}
              </div>
              <div className="overflow-hidden">
                {dayEvents.map((event) => (
                  <div 
                    key={event.id} 
                    className="calendar-event"
                    onClick={() => handleEventClick(event)}
                  >
                    {event.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;

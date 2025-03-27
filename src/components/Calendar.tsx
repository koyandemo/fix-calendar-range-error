
import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isSameDay, isWithinInterval, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Event {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
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
    return events.filter(event => {
      // Handle the case where startDate and endDate might be strings (from API)
      const startDate = event.startDate instanceof Date ? event.startDate : new Date(event.startDate);
      const endDate = event.endDate instanceof Date ? event.endDate : new Date(event.endDate);
      
      // Check if the day is within the event's date range (inclusive)
      return isWithinInterval(day, { start: startDate, end: endDate });
    });
  };

  const handleEventClick = (event: Event) => {
    if (onEventClick) {
      onEventClick(event);
    } else {
      const startDateStr = format(new Date(event.startDate), 'MMM d');
      const endDateStr = format(new Date(event.endDate), 'MMM d');
      const dateRange = startDateStr === endDateStr 
        ? startDateStr 
        : `${startDateStr} - ${endDateStr}`;
        
      toast.info(`Event: ${event.title}`, {
        description: `${dateRange}, ${event.category || 'General'}`
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
      <div className="calendar-controls flex justify-between items-center mb-4">
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
      
      <div className={cn("calendar-grid grid grid-cols-7 gap-1", {
        'opacity-0': animationDirection !== null,
        'opacity-100': animationDirection === null
      })}>
        {DAYS_OF_WEEK.map((day) => (
          <div key={day} className="calendar-header text-center text-xs font-medium text-gray-500 py-2">
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
              className={cn("calendar-cell p-1 border border-gray-100 min-h-[80px] relative", {
                "opacity-40": !isCurrentMonth,
                "bg-blue-50": isToday
              })}
            >
              <div className={cn("calendar-day-number text-right text-xs p-1", {
                "font-bold text-blue-500": isToday
              })}>
                {format(date, 'd')}
              </div>
              <div className="overflow-hidden space-y-1">
                {dayEvents.map((event) => {
                  // Check if this is the first day of the event
                  const isFirstDay = isSameDay(date, new Date(event.startDate));
                  // Check if this is the last day of the event
                  const isLastDay = isSameDay(date, new Date(event.endDate));
                  
                  // Apply different styles based on position in the event
                  const eventStyle = cn(
                    "calendar-event text-xs p-1 truncate cursor-pointer text-white",
                    {
                      "rounded-l-md": isFirstDay,
                      "rounded-r-md": isLastDay,
                      "rounded-none": !isFirstDay && !isLastDay,
                      // Use different background colors for different categories
                      "bg-blue-500": event.category === 'Work',
                      "bg-green-500": event.category === 'Marketing',
                      "bg-purple-500": event.category === 'Client',
                      "bg-red-500": event.category === 'Subaru',
                      "bg-gray-500": !event.category,
                    }
                  );
                  
                  return (
                    <div 
                      key={event.id} 
                      className={eventStyle}
                      onClick={() => handleEventClick(event)}
                    >
                      {isFirstDay ? event.title : '•••'}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;

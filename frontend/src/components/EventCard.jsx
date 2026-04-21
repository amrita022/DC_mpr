import React from "react";
import { useNavigate } from "react-router-dom";

const getEventImage = (eventName) => {
  const nameLower = eventName.toLowerCase();

  if (nameLower.includes("music") || nameLower.includes("festival")) {
    return "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&q=80";
  } else if (nameLower.includes("tech") || nameLower.includes("conference")) {
    return "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80";
  } else if (nameLower.includes("comedy")) {
    return "https://images.unsplash.com/photo-1527224538127-2104bb71c51b?w=600&q=80";
  } else if (nameLower.includes("sport") || nameLower.includes("championship")) {
    return "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&q=80";
  } else if (nameLower.includes("art") || nameLower.includes("exhibition")) {
    return "https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=600&q=80";
  }
  return "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80";
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const dayName = days[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  
  return `${dayName}, ${day} ${month} ${year} · ${time}`;
};

export default function EventCard({ event }) {
  const navigate = useNavigate();
  const isSoldOut = event.availableSeats === 0;
  const imageUrl = getEventImage(event.name);

  return (
    <div
      className="bg-dark-card border border-dark-border rounded-card overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer"
      onClick={() => !isSoldOut && navigate(`/events/${event._id}`)}
    >
      {/* Image Banner with Overlay */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={imageUrl}
          alt={event.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-transparent to-transparent"></div>
      </div>

      {/* Card Content */}
      <div className="p-4">
        {/* Event Name */}
        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
          {event.name}
        </h3>

        {/* Venue */}
        <div className="flex items-center gap-2 mb-1 text-gray-400 text-sm">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="truncate text-xs">{event.venue}</span>
        </div>

        {/* Date */}
        <div className="flex items-center gap-2 text-gray-400 text-xs mb-3">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="truncate">{formatDate(event.date)}</span>
        </div>

        {/* Seats Info */}
        <div className="text-xs text-gray-500 mb-3">
          {event.availableSeats} of {event.totalSeats} seats available
        </div>

        {/* Price and Button */}
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-brand">
            ₹{event.price}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!isSoldOut) navigate(`/events/${event._id}`);
            }}
            disabled={isSoldOut}
            className={`px-4 py-2 rounded-btn font-medium text-sm transition ${
              isSoldOut
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-brand text-white hover:bg-red-500'
            }`}
          >
            {isSoldOut ? 'SOLD OUT' : 'BOOK'}
          </button>
        </div>
      </div>
    </div>
  );
}


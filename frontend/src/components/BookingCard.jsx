import React from "react";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const dayName = days[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${dayName}, ${day} ${month} ${year}`;
};

export default function BookingCard({ booking, onCancel }) {
  const isConfirmed = booking.status === "confirmed";
  const borderColorClass = isConfirmed ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-red-500';

  return (
    <div className={`bg-dark-card border border-dark-border ${borderColorClass} rounded-card p-6`}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Event Info */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-bold text-white mb-2">
            {booking.eventId?.name}
          </h3>
          
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{booking.eventId?.venue}</span>
          </div>

          <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formatDate(booking.eventId?.date)}</span>
          </div>

          {/* Confirmation Code */}
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">Booking Code:</span>
            <code className="font-mono text-brand font-bold">{booking.confirmationCode}</code>
          </div>
        </div>

        {/* Right Side - Amount & Status */}
        <div className="md:text-right">
          <div className="mb-4">
            <p className="text-gray-400 text-sm mb-1">Total Amount</p>
            <p className="text-2xl font-bold text-white">₹{booking.totalAmount}</p>
          </div>

          <div className="mb-4">
            <p className="text-gray-400 text-sm mb-1">Seats Booked</p>
            <p className="text-lg font-semibold text-white">{booking.seats}</p>
          </div>

          <span
            className={`inline-block px-3 py-1 rounded text-xs font-semibold ${
              isConfirmed
                ? 'bg-green-900 bg-opacity-30 text-green-400'
                : 'bg-red-900 bg-opacity-30 text-red-400'
            }`}
          >
            {booking.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Cancel Button */}
      {isConfirmed && (
        <div className="mt-6 pt-6 border-t border-dark-border">
          <button
            onClick={() => onCancel(booking._id)}
            className="w-full border border-brand text-brand hover:bg-brand hover:text-white px-4 py-2 rounded-btn font-medium transition"
          >
            CANCEL BOOKING
          </button>
        </div>
      )}
    </div>
  );
}


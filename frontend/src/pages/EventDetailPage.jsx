import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";

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
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [seats, setSeats] = useState(1);
  const [strategy, setStrategy] = useState("roundRobin");
  const [loading, setLoading] = useState(true);
  const [bookingResult, setBookingResult] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await api.get(`/api/events/${id}`);
        setEvent(response.data);
      } catch (error) {
        toast.error("Event not found");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, navigate]);

  const handleBooking = async (e) => {
    e.preventDefault();
    setBookingLoading(true);

    try {
      const response = await api.post("/api/distributed/book", {
        eventId: id,
        seats: parseInt(seats),
        strategy,
      });

      console.log("Booking Response:", response.data);
      setBookingResult(response.data);
      toast.success("Booking confirmed!");
    } catch (error) {
      console.error("Booking Error:", error);
      toast.error(error.response?.data?.message || "Booking failed");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-dark-border border-t-brand rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  const imageUrl = getEventImage(event.name);
  const seatPercentage = ((event.totalSeats - event.availableSeats) / event.totalSeats) * 100;
  const totalPrice = event.price * parseInt(seats || 1);

  return (
    <div className="w-full min-h-screen bg-dark">
      {/* Hero Banner */}
      <div className="relative h-72 w-full bg-cover bg-center overflow-hidden">
        <img
          src={imageUrl}
          alt={event.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/30 to-transparent"></div>

        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="absolute top-6 left-8 text-white hover:text-gray-200 flex items-center gap-2 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back</span>
        </button>

        {/* Title Overlay at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <h1 className="text-4xl font-black text-white leading-tight">{event.name}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="w-full px-8 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Event Details */}
            <div className="lg:col-span-2">
              <div className="bg-dark-card border border-dark-border rounded-card p-8">
                {/* Venue */}
                <div className="flex items-start gap-3 mb-6">
                  <svg className="w-5 h-5 text-brand mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="text-gray-400 text-sm">Venue</p>
                    <p className="text-xl text-white font-semibold">{event.venue}</p>
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-start gap-3 mb-8">
                  <svg className="w-5 h-5 text-brand mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-gray-400 text-sm">Date & Time</p>
                    <p className="text-lg text-white font-semibold">{formatDate(event.date)}</p>
                  </div>
                </div>

                {/* Description */}
                {event.description && (
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-white mb-3">About this event</h3>
                    <p className="text-gray-400 leading-relaxed">{event.description}</p>
                  </div>
                )}

                {/* Seat Status */}
                <div className="bg-dark border border-dark-border rounded-card p-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-400">Seats Available</span>
                    <span className="text-brand font-bold">{event.availableSeats} / {event.totalSeats}</span>
                  </div>
                  <div className="w-full bg-dark-secondary rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-brand h-full transition-all"
                      style={{ width: `${seatPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Booking Form */}
            <div>
              {bookingResult ? (
                <div className="bg-dark-card border border-green-500 border-opacity-50 rounded-card p-8 sticky top-24">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-500 bg-opacity-20 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <svg className="w-8 h-8 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-2">Booking Confirmed!</h3>
                    <p className="text-gray-400 mb-6">Your tickets are secured</p>

                    {/* Confirmation Code */}
                    <div className="bg-dark border-2 border-green-500 border-opacity-30 rounded-card p-6 mb-6 text-center">
                      <p className="text-gray-400 text-xs mb-3 tracking-widest">CONFIRMATION CODE</p>
                      <p className="font-mono text-4xl text-green-400 font-bold tracking-wider">
                        {bookingResult?.booking?.confirmationCode || "LOADING..."}
                      </p>
                    </div>

                    {/* Booking Details */}
                    <div className="space-y-3 mb-6 text-left text-sm bg-dark border border-dark-border rounded-card p-4">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Handled by</span>
                        <span className="text-white font-semibold">
                          {bookingResult?.selectedNode || "Node Loading..."}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Logical Clock Timestamp</span>
                        <span className="text-white font-semibold">
                          #{bookingResult?.logicalClockTimestamp ?? "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Processing Delay</span>
                        <span className="text-white font-semibold">
                          {bookingResult?.processingDelay ? `${bookingResult.processingDelay}ms` : "N/A"}
                        </span>
                      </div>
                      <div className="border-t border-dark-border pt-3 flex justify-between">
                        <span className="text-gray-400">Seats Booked</span>
                        <span className="text-white font-semibold">
                          {bookingResult?.booking?.seats || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300 font-semibold">Total Amount Paid</span>
                        <span className="text-brand text-lg font-bold">
                          ₹{bookingResult?.booking?.totalAmount || "0"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <button
                        onClick={() => navigate("/bookings")}
                        className="w-full bg-brand hover:bg-red-500 text-white font-semibold py-3 rounded-btn transition"
                      >
                        View My Bookings
                      </button>
                      <button
                        onClick={() => setBookingResult(null)}
                        className="w-full bg-dark border border-dark-border hover:border-brand text-white font-semibold py-3 rounded-btn transition"
                      >
                        Book Another
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-dark-card border border-dark-border rounded-card p-8 sticky top-24">
                  <h3 className="text-xl font-bold text-white mb-6">Select Tickets</h3>

                  <form onSubmit={handleBooking} className="space-y-6">
                    {/* Seat Selection */}
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-3">
                        Number of Seats
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setSeats(Math.max(1, seats - 1))}
                          className="w-10 h-10 border border-dark-border rounded-btn hover:bg-dark-border transition flex items-center justify-center text-white"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min="1"
                          max={event.availableSeats}
                          value={seats}
                          onChange={(e) => setSeats(Math.max(1, parseInt(e.target.value) || 1))}
                          className="flex-1 text-center bg-dark border border-dark-border rounded-btn text-white font-bold focus:border-brand outline-none transition"
                        />
                        <button
                          type="button"
                          onClick={() => setSeats(Math.min(event.availableSeats, seats + 1))}
                          className="w-10 h-10 border border-dark-border rounded-btn hover:bg-dark-border transition flex items-center justify-center text-white"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Strategy Selection */}
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Load Balancing Strategy
                      </label>
                      <select
                        value={strategy}
                        onChange={(e) => setStrategy(e.target.value)}
                        className="w-full bg-dark border border-dark-border rounded-btn text-white focus:border-brand outline-none transition px-4 py-3"
                      >
                        <option value="roundRobin">Round Robin</option>
                        <option value="leastConnections">Least Connections</option>
                        <option value="weightedRandom">Weighted Random</option>
                      </select>
                    </div>

                    {/* Price Summary */}
                    <div className="bg-dark border border-dark-border rounded-card p-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-400">Unit Price</span>
                        <span className="text-white">₹{event.price}</span>
                      </div>
                      <div className="flex justify-between mb-3 pb-3 border-b border-dark-border">
                        <span className="text-gray-400">Quantity</span>
                        <span className="text-white">{seats} seat(s)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white font-semibold">Total</span>
                        <span className="text-2xl text-brand font-bold">₹{totalPrice}</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={bookingLoading || event.availableSeats === 0}
                      className="w-full bg-brand hover:bg-red-500 disabled:bg-gray-700 text-white font-bold py-4 rounded-btn transition"
                    >
                      {bookingLoading ? "PROCESSING..." : "PROCEED TO BOOK"}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

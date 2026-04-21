import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";
import BookingCard from "../components/BookingCard";

export default function MyBookingsPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await api.get("/api/bookings");
        setBookings(response.data);
      } catch (error) {
        toast.error("Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    try {
      await api.put(`/api/bookings/${bookingId}/cancel`);
      setBookings(
        bookings.map((b) =>
          b._id === bookingId ? { ...b, status: "cancelled" } : b
        )
      );
      toast.success("Booking cancelled successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel booking");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-dark-border border-t-brand rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-dark py-12">
      <div className="max-w-3xl mx-auto px-6">
        <button
          onClick={() => navigate("/")}
          className="text-gray-400 hover:text-white mb-8 flex items-center gap-2 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back</span>
        </button>

        <div className="flex items-center gap-4 mb-12">
          <h1 className="text-4xl font-bold text-white">My Bookings</h1>
          <span className="inline-flex items-center justify-center w-8 h-8 bg-brand text-white rounded-full text-sm font-bold">
            {bookings.length}
          </span>
        </div>

        {bookings.length > 0 ? (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <BookingCard
                key={booking._id}
                booking={booking}
                onCancel={handleCancel}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <svg className="w-16 h-16 text-gray-600 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-400 text-lg mb-6">No bookings yet</p>
            <button
              onClick={() => navigate("/")}
              className="bg-brand hover:bg-red-500 text-white font-semibold py-3 px-8 rounded-btn transition"
            >
              Browse Events
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


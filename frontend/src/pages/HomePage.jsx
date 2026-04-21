import React, { useState, useEffect } from "react";
import api from "../api/axios";
import EventCard from "../components/EventCard";

const categories = ["All", "Music", "Sports", "Comedy", "Tech"];

export default function HomePage() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get("/api/events");
        setEvents(response.data);
        setFilteredEvents(response.data);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    filterEvents(query, selectedCategory);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    filterEvents(searchQuery, category);
  };

  const filterEvents = (query, category) => {
    let filtered = events;

    if (query) {
      filtered = filtered.filter(
        (event) =>
          event.name.toLowerCase().includes(query) ||
          event.venue.toLowerCase().includes(query)
      );
    }

    if (category !== "All") {
      filtered = filtered.filter((event) =>
        event.name.toLowerCase().includes(category.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
  };

  return (
    <div className="w-full min-h-screen bg-dark">
      {/* Hero Section - Full Bleed */}
      <div
        className="relative w-full min-h-[520px] bg-cover bg-center flex items-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=1600&q=80')",
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/70"></div>

        {/* Hero Content - Constrained Width */}
        <div className="relative w-full px-8">
          <div className="max-w-7xl mx-auto">
            <p className="text-gray-300 text-base mb-4 tracking-wide">DISCOVER & BOOK</p>
            <h1 className="text-6xl font-black text-white leading-tight mb-6">
              The world's largest<br />
              <span className="text-brand">ticketing platform.</span>
            </h1>
            <p className="text-xl text-gray-300 mb-10">
              Book tickets for concerts, sports, theatre and more.
            </p>

            {/* Search Bar */}
            <div className="flex gap-2 w-full max-w-2xl">
              <input
                type="text"
                placeholder="Search events, artists or venues..."
                value={searchQuery}
                onChange={handleSearch}
                className="flex-1 px-6 py-4 bg-dark-card border border-dark-border rounded-btn text-white placeholder-gray-500 focus:border-brand focus:outline-none transition"
              />
              <button className="bg-brand hover:bg-red-500 text-white px-8 py-4 rounded-btn font-semibold transition flex items-center gap-2 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Events Section */}
      <div className="w-full px-8 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-8">Featured Events</h2>

            {/* Category Filter */}
            <div className="flex gap-3 overflow-x-auto pb-4">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-6 py-2 rounded-btn font-medium whitespace-nowrap transition ${
                    selectedCategory === category
                      ? 'bg-brand text-white'
                      : 'bg-dark-card border border-dark-border text-gray-400 hover:text-white'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Events Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-dark-card border border-dark-border rounded-card overflow-hidden animate-pulse">
                  <div className="h-44 bg-dark-secondary" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-dark-secondary rounded w-3/4" />
                    <div className="h-3 bg-dark-secondary rounded w-full" />
                    <div className="h-3 bg-dark-secondary rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredEvents.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          )}

          {!loading && filteredEvents.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg">No events found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


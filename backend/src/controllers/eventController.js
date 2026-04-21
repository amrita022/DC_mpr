const Event = require("../models/Event");

const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: "active" }).sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createEvent = async (req, res) => {
  try {
    const { name, description, venue, date, totalSeats, price } = req.body;

    const event = new Event({
      name,
      description,
      venue,
      date,
      totalSeats,
      availableSeats: totalSeats,
      price,
    });

    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    const { name, description, venue, date, price, status } = req.body;

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (name) event.name = name;
    if (description) event.description = description;
    if (venue) event.venue = venue;
    if (date) event.date = date;
    if (price) event.price = price;
    if (status) event.status = status;

    await event.save();
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    event.status = "cancelled";
    await event.save();

    res.json({ message: "Event cancelled successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const searchEvents = async (req, res) => {
  try {
    const { venue, date, minPrice, maxPrice } = req.query;

    const filter = { status: "active" };

    if (venue) {
      filter.venue = { $regex: venue, $options: "i" };
    }

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      filter.date = { $gte: startDate, $lte: endDate };
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const events = await Event.find(filter).sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  searchEvents,
};

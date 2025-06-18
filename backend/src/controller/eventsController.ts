import { Request, Response } from "express";
import eventModel from "../models/events";

// Create a new event
export const createEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const event = req.body;
    const newEvent = await eventModel.createEvent(event);
    res.status(201).json(newEvent);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get all events for a user
export const getEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const userIdParam = req.query.id;
    const userId = typeof userIdParam === "string" ? parseInt(userIdParam, 10) : undefined;

    if (typeof userId !== "number" || isNaN(userId)) {
      res.status(400).json({ error: "Invalid or missing user id" });
      return;
    }

    const events = await eventModel.getEventsByUserId(userId);
    res.status(200).json(events);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single event by ID
export const getEventById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const event = await eventModel.getEventById(id);

    if (!event) {
      res.status(404).json({ error: "Event not found" });
      return; 
    }

    res.status(200).json(event);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Update an event

export const updateEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const updatedData = req.body;

    const success = await eventModel.updateEvent(id, updatedData);

    if (!success) {
      res.status(404).json({ error: "Event not found or no changes made" });
      return;
    }

    // Refetch the updated event to return to the frontend
    const updatedEvent = await eventModel.getEventById(id);

    res.status(200).json({
      message: "Event updated successfully",
      event: updatedEvent,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Delete an event
export const deleteEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const success = await eventModel.deleteEvent(id);

    if (!success) {
      res.status(404).json({ error: "Event not found" });
      return;
    }

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

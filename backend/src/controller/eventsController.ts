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
    const userId = parseInt(req.params.userId);
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
    const event = req.body;

    const success = await eventModel.updateEvent(id, event);
    if (!success) {
      res.status(404).json({ error: "Event not found or no changes made" });
      return;
    }

    res.status(200).json({ message: "Event updated successfully" });
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

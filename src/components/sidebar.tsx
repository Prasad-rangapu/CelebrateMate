import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import dayjs from "dayjs";

interface Event {
  id?: number;
  title: string;
  date: string;
  description: string;
}

const Sidebar = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [contactEvents, setContactEvents] = useState<Event[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<"Birthday" | "Anniversary" | null>(null);
  const [form, setForm] = useState({ title: "", date: "", description: "" });
  const [editEvent, setEditEvent] = useState<Event | null>(null);
  const { user } = useAuth();

  const fetchEvents = () => {
    const userId = user?.id;
    if (!userId) return;

    fetch(`http://localhost:5000/api/events?id=${userId}`)
      .then((res) => res.json())
      .then(setEvents)
      .catch(() => setEvents([]));
  };

  const fetchContactEvents = () => {
    const userId = user?.id;
    if (!userId) return;

    fetch(`http://localhost:5000/api/contacts/events/${userId}`)
      .then((res) => res.json())
      .then((data: Event[]) => {
        setContactEvents(data);
      })
      .catch(() => setContactEvents([]));
  };

  useEffect(() => {
    fetchEvents();
    fetchContactEvents();
  }, [user?.id]);

  const openForm = (type: "Birthday" | "Anniversary", event?: Event) => {
    setFormType(type);
    if (event) {
      setEditEvent(event);
      setForm({
        title: event.title.replace(/^Birthday: |^Anniversary: /, ""),
        date: event.date,
        description: event.description,
      });
    } else {
      setEditEvent(null);
      setForm({ title: "", date: "", description: "" });
    }
    setShowForm(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = user?.id;
    if (!userId) return;

    const formattedTitle =
      formType === "Birthday" ? `Birthday: ${form.title}` : `Anniversary: ${form.title}`;

    const eventPayload = {
      title: formattedTitle,
      date: form.date,
      description: form.description,
      userId,
    };

    const url = editEvent
      ? `http://localhost:5000/api/events/${editEvent.id}`
      : "http://localhost:5000/api/events";

    const method = editEvent ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventPayload),
    });

    setShowForm(false);
    setEditEvent(null);
    fetchEvents();
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("Are you sure you want to delete this event?");
    if (!confirmed) return;

    await fetch(`http://localhost:5000/api/events/${id}`, { method: "DELETE" });
    fetchEvents();
  };

  const today = dayjs();
  const allEvents = [...events, ...contactEvents].sort((a, b) => {
    const aDate = dayjs(a.date);
    const bDate = dayjs(b.date);

    const aMMDD = aDate.format("MM-DD");
    const bMMDD = bDate.format("MM-DD");
    const todayMMDD = today.format("MM-DD");

    const aIsPast = aMMDD < todayMMDD;
    const bIsPast = bMMDD < todayMMDD;

    if (aIsPast && !bIsPast) return 1;
    if (!aIsPast && bIsPast) return -1;

    return aMMDD.localeCompare(bMMDD);
  });

  return (
    <aside className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-xl p-6 w-full md:w-80 mt-8 border border-white/30">
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-3 text-indigo-700">Quick Actions</h3>
        <ul className="space-y-2">
          <li>
            <button
              className="w-full bg-pink-400 hover:bg-pink-500 text-white py-2 rounded-lg font-semibold transition"
              onClick={() => openForm("Birthday")}
            >
              Add Birthday
            </button>
          </li>
          <li>
            <button
              className="w-full bg-purple-400 hover:bg-purple-500 text-white py-2 rounded-lg font-semibold transition"
              onClick={() => openForm("Anniversary")}
            >
              Add Anniversary
            </button>
          </li>
        </ul>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form
            className="bg-white p-6 rounded-xl shadow-lg space-y-4 w-80"
            onSubmit={handleSubmit}
          >
            <h2 className="text-lg font-bold mb-2 text-indigo-700">
              {editEvent ? "Edit" : "Add"} {formType}
            </h2>
            <input
              name="title"
              type="text"
              placeholder={formType === "Birthday" ? "Name" : "Couple Name"}
              value={form.title}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
            <input
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
            <textarea
              name="description"
              placeholder="Description (optional)"
              value={form.description}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-lg font-semibold transition"
              >
                {editEvent ? "Update" : "Save"}
              </button>
              <button
                type="button"
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-lg font-semibold transition"
                onClick={() => {
                  setShowForm(false);
                  setEditEvent(null);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div>
        <h3 className="text-xl font-bold mb-3 text-indigo-700">Upcoming Events</h3>
        <ul className="space-y-2 text-indigo-900">
          {allEvents.length === 0 && (
            <li className="bg-white/60 rounded-lg px-3 py-2 text-gray-500">No events found.</li>
          )}
          {allEvents.map((event) => (
            <li key={`${event.title}-${event.date}`} className="bg-white/60 rounded-lg px-3 py-2">
              🎉 {event.title} - {dayjs(event.date).format("YYYY-MM-DD")}
              {event.id && (
                <div className="flex justify-end gap-2 mt-1">
                  <button
                    onClick={() =>
                      openForm(
                        event.title.startsWith("Birthday") ? "Birthday" : "Anniversary",
                        event
                      )
                    }
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(event.id!)}
                    className="text-red-600 hover:underline text-sm"
                  >
                    Delete
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;

import { useEffect, useState } from "react";

interface Event {
  id?: number;
  title: string;
  date: string;
  description: string;
}

const Sidebar = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<"Birthday" | "Anniversary" | null>(null);
  const [form, setForm] = useState({ title: "", date: "", description: "" });

  // Simulate login: store userId 1 in localStorage if not already there
  useEffect(() => {
    if (!localStorage.getItem("userId")) {
      localStorage.setItem("userId", "1");
    }
    fetchEvents();
  }, []);

  const fetchEvents = () => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    fetch(`http://localhost:5000/api/events?id=${userId}`)
      .then((res) => res.json())
      .then(setEvents)
      .catch(() => setEvents([]));
  };

  const openForm = (type: "Birthday" | "Anniversary") => {
    setFormType(type);
    setForm({ title: "", date: "", description: "" });
    setShowForm(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = Number(localStorage.getItem("userId") || "1");

    const eventToSend = {
      ...form,
      title: formType === "Birthday" ? `Birthday: ${form.title}` : `Anniversary: ${form.title}`,
      userId,
    };

    await fetch("http://localhost:5000/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventToSend),
    });

    setShowForm(false);
    fetchEvents();
  };

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
            <h2 className="text-lg font-bold mb-2 text-indigo-700">Add {formType}</h2>
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
                Save
              </button>
              <button
                type="button"
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-lg font-semibold transition"
                onClick={() => setShowForm(false)}
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
          {events.length === 0 && (
            <li className="bg-white/60 rounded-lg px-3 py-2 text-gray-500">No events found.</li>
          )}
          {events.map((event) => (
            <li key={event.id} className="bg-white/60 rounded-lg px-3 py-2">
              🎉 {event.title} - {new Date(event.date).toLocaleDateString()}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
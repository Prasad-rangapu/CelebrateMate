import { useEffect, useState } from "react";
import { FaBirthdayCake, FaGift } from "react-icons/fa";
import Header from "../components/header";
import Navbar from "../components/navbar";
import Sidebar from "../components/sidebar";
import Footer from "../components/footer";
import { useAuth } from "../auth/AuthContext";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
dayjs.extend(isSameOrAfter);

interface Event {
  id?: number;
  title: string;
  date: string;
  description?: string;
}

interface Contact {
  id?: number;
  name: string;
  email: string;
  phone: string;
  birthday?: string;
  anniversary?: string;
}

export default function DashBoard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [contactEvents, setContactEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState<Contact>({
    name: "",
    email: "",
    phone: "",
    birthday: "",
    anniversary: "",
  });
  const [contactSuccess, setContactSuccess] = useState<string | null>(null);
  const { user } = useAuth();

  const [reminderDays, setReminderDays] = useState("1 day");
  const [notificationType, setNotificationType] = useState("Email");

  const fetchEvents = async () => {
    const userId = user?.id;
    if (!userId) return;
    try {
      const [userEventsRes, contactEventsRes] = await Promise.all([
        fetch(`http://localhost:5000/api/events?id=${userId}`),
        fetch(`http://localhost:5000/api/contacts/events/${userId}`),
      ]);
      const userEvents = await userEventsRes.json();
      const contactEvents = await contactEventsRes.json();
      setEvents(userEvents || []);
      setContactEvents(contactEvents || []);
    } catch {
      setEvents([]);
      setContactEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [user?.id]);

  useEffect(() => {
    const userId = user?.id;
    if (!userId) return;
    fetch(`http://localhost:5000/api/users/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setReminderDays(data.user.reminder || "1 day");
        setNotificationType(data.user.notification_type || "Email");
      });
  }, [user?.id]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = user?.id;
    if (!userId) return;
    await fetch(`http://localhost:5000/api/users/${userId}/reminder`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reminder: reminderDays, notification_type: notificationType }),
    });
  };

  const allEvents = [...events, ...contactEvents].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const today = dayjs().startOf("day");
  const birthdays = allEvents.filter((e) => e.title.toLowerCase().startsWith("birthday")).length;
  const anniversaries = allEvents.filter((e) => e.title.toLowerCase().startsWith("anniversary")).length;
  const upcoming = allEvents.filter((e) => dayjs(e.date).isSameOrAfter(today, "day")).length;
  const missed = allEvents.filter((e) => dayjs(e.date).isBefore(today, "day")).length;

  const upcomingEvents = allEvents
    .filter((e) => dayjs(e.date).isSameOrAfter(today, "day"))
    .slice(0, 5);

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContactForm({ ...contactForm, [e.target.name]: e.target.value });
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactSuccess(null);
    const res = await fetch(`http://localhost:5000/api/contacts?user_id=${user?.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contactForm),
    });
    if (res.ok) {
      setContactSuccess("Contact added!");
      setContactForm({ name: "", email: "", phone: "", birthday: "", anniversary: "" });
      fetchEvents();
      setTimeout(() => setShowContactForm(false), 1000);
    } else {
      setContactSuccess("Failed to add contact.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-indigo-200 flex flex-col">
      <Header />
      <Navbar />
      <main className="flex flex-1 max-w-6xl mx-auto w-full gap-8 mt-8 px-4">
        <div className="hidden md:block w-80 flex-shrink-0">
          <Sidebar />
        </div>

        <section className="flex-1 bg-white/60 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/40">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
              <h2 className="text-2xl font-bold text-indigo-900 drop-shadow-lg">
                Welcome back, {user?.name || "User"}!
              </h2>
              <button
                className="flex items-center gap-2 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 text-white px-5 py-2 rounded-full font-semibold hover:scale-105 hover:shadow-xl transition-all duration-300"
                onClick={() => setShowContactForm(true)}
              >
                <FaGift /> Add New Contact
              </button>
            </div>

            {showContactForm && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <form className="bg-white p-6 rounded-xl shadow-lg space-y-4 w-80" onSubmit={handleContactSubmit}>
                  <h2 className="text-lg font-bold mb-2 text-indigo-700">Add New Contact</h2>
                  <input name="name" type="text" placeholder="Name" value={contactForm.name} onChange={handleContactChange} required className="w-full border rounded px-3 py-2" />
                  <input name="email" type="email" placeholder="Email" value={contactForm.email} onChange={handleContactChange} className="w-full border rounded px-3 py-2" />
                  <input name="phone" type="text" placeholder="Phone" value={contactForm.phone} onChange={handleContactChange} className="w-full border rounded px-3 py-2" />
                  <label htmlFor="birthday">Birthday</label>
                  <input name="birthday" type="date" value={contactForm.birthday} onChange={handleContactChange} className="w-full border rounded px-3 py-2" />
                  <label htmlFor="anniversary">Anniversary</label>
                  <input name="anniversary" type="date" value={contactForm.anniversary} onChange={handleContactChange} className="w-full border rounded px-3 py-2" />
                  {contactSuccess && <div className="text-green-600 text-sm">{contactSuccess}</div>}
                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-lg font-semibold transition">Save</button>
                    <button type="button" className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-lg font-semibold transition" onClick={() => setShowContactForm(false)}>Cancel</button>
                  </div>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              <div className="flex items-center gap-5 bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200/80 rounded-xl p-6 shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-300 border border-white/30 backdrop-blur">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl bg-gradient-to-br from-[#6a11cb] to-[#2575fc] text-white shadow-lg">
                  <FaBirthdayCake />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-indigo-800">{birthdays}</h3>
                  <p className="text-gray-600 text-sm">Birthdays Tracked</p>
                </div>
              </div>

              <div className="flex items-center gap-5 bg-gradient-to-br from-pink-200 via-orange-100 to-yellow-100/80 rounded-xl p-6 shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-300 border border-white/30 backdrop-blur">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl bg-gradient-to-br from-[#ff6b6b] to-[#ff8e53] text-white shadow-lg">
                  <FaGift />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-pink-700">{anniversaries}</h3>
                  <p className="text-gray-600 text-sm">Anniversaries Tracked</p>
                </div>
              </div>

              <div className="flex items-center gap-5 bg-gradient-to-br from-green-200 via-blue-100 to-purple-100/80 rounded-xl p-6 shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-300 border border-white/30 backdrop-blur">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl bg-gradient-to-br from-green-400 to-blue-400 text-white shadow-lg">
                  <FaGift />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-green-700">{upcoming}</h3>
                  <p className="text-gray-600 text-sm">Upcoming Events</p>
                </div>
              </div>

              <div className="flex items-center gap-5 bg-gradient-to-br from-yellow-200 via-pink-100 to-indigo-100/80 rounded-xl p-6 shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-300 border border-white/30 backdrop-blur">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl bg-gradient-to-br from-yellow-400 to-pink-400 text-white shadow-lg">
                  <FaGift />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-yellow-700">{missed}</h3>
                  <p className="text-gray-600 text-sm">Missed Events</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-indigo-100/80 via-pink-100/80 to-purple-100/80 rounded-xl p-6 shadow-lg border border-white/30 backdrop-blur">
              <h3 className="text-lg font-bold mb-4 text-indigo-800">Upcoming Events</h3>
              <ul className="space-y-2">
                {loading && <li>Loading...</li>}
                {!loading && upcomingEvents.length === 0 && (
                  <li className="text-gray-500">No upcoming events.</li>
                )}
                {upcomingEvents.map((event, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <span className="text-xl">{event.title.startsWith("Birthday") ? "🎂" : "💍"}</span>
                    <span className="font-semibold text-indigo-700">
                      {event.title.replace(/^Birthday: |^Anniversary: /, "")}
                    </span>
                    <span className="ml-auto text-gray-600 text-sm">
                      {dayjs(event.date).format("DD MMM YYYY")}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div id="reminder-settings" className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="bg-white/70 backdrop-blur rounded-xl p-6 shadow-lg border border-white/30">
                <h3 className="text-lg font-bold mb-4 text-indigo-800">Reminder Settings</h3>
                <form className="space-y-4" onSubmit={handleSaveSettings}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Remind me before</label>
                    <select value={reminderDays} onChange={(e) => setReminderDays(e.target.value)} className="w-full border rounded px-3 py-2 bg-white/80">
                      <option>1 day</option>
                      <option>3 days</option>
                      <option>1 week</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notification Type</label>
                    <select value={notificationType} onChange={(e) => setNotificationType(e.target.value)} className="w-full border rounded px-3 py-2 bg-white/80">
                      <option>Email</option>
                      <option>SMS</option>
                      <option>Both</option>
                    </select>
                  </div>
                  <button type="submit" className="bg-gradient-to-r from-indigo-400 to-pink-400 text-white px-4 py-2 rounded-lg font-semibold hover:scale-105 hover:shadow-xl transition-all duration-300">
                    Save Settings
                  </button>
                </form>
              </div>

              <div id="celebration-ideas" className="bg-white/70 backdrop-blur rounded-xl p-6 shadow-lg border border-white/30">
                <h3 className="text-lg font-bold mb-4 text-indigo-800">Celebration Ideas</h3>
                <ul className="list-disc pl-5 text-gray-700 space-y-1">
                  <li>Send a personalized gift</li>
                  <li>Organize a virtual party</li>
                  <li>Write a heartfelt message</li>
                  <li>Plan a surprise video call</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

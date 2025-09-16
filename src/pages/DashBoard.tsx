import { useEffect, useState } from "react";
import { FaBirthdayCake, FaGift } from "react-icons/fa";
import Header from "../components/header";
import Navbar from "../components/navbar";
import Sidebar from "../components/sidebar";
import Footer from "../components/footer";
import { useAuth } from "../auth/AuthContext";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import ContactForm from "../components/ContactForm";
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

interface Event {
  id?: number;
  title: string;
  date: string;
  description?: string;
}

// const HelpTooltip = ({ text }: { text: string }) => (
//   <div className="relative flex items-center group">
//     <FaQuestionCircle className="text-gray-400 cursor-help text-xs" />
//     <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-gray-800 text-white text-xs rounded py-1.5 px-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 shadow-lg text-center">
//       {text}
//       <svg className="absolute text-gray-800 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255">
//         <polygon className="fill-current" points="0,0 127.5,127.5 255,0"/>
//       </svg>
//     </div>
//   </div>
// );



export default function DashBoard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [contactEvents, setContactEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showContactForm, setShowContactForm] = useState(false);
  const { user, setUser } = useAuth();

  let isUserBirthdayToday = false;
  if (user?.birthday) {
    const today = dayjs().format("MM-DD");
    const birthdayThisYear = dayjs(user.birthday).format("MM-DD");
   isUserBirthdayToday = today === birthdayThisYear;
  }


  // Initialize state directly from the user object in AuthContext
  const [reminderDays, setReminderDays] = useState("1 day");
  const [reminderNotificationMethods, setReminderNotificationMethods] = useState<string[]>([]);
  const [autoNotificationMethods, setAutoNotificationMethods] = useState<string[]>(["SMS"]);

  // Panel toggling and auto-message state
  const [activePanel, setActivePanel] = useState<"settings" | "auto" | "message">("settings");
  const [autoSendAtMidnight, setAutoSendAtMidnight] = useState<boolean>(false);
  const [autoMessageText, setAutoMessageText] = useState<string>("Happy Birthday {name}!");
  const [showMessageTab, setShowMessageTab] = useState<boolean>(false);

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
  }, [user?.id]); // Added dependency

  // This effect synchronizes the local form state with the user object from the context.
  // It runs on initial mount and whenever the user object is updated (e.g., after saving).
  useEffect(() => {
    if (user) {
      const safeParse = (jsonString: unknown, fallback: string[]): string[] => {
        // Handles both stringified JSON and already-parsed arrays
        if (Array.isArray(jsonString)) return jsonString;
        if (typeof jsonString !== 'string') return fallback;
        try {
          const parsed = JSON.parse(jsonString);
          return Array.isArray(parsed) ? parsed : fallback;
        } catch {
          return fallback;
        }
      };

      setReminderDays(user.reminder || "1 day");
      setReminderNotificationMethods(safeParse(user.notification_type, []));
      setAutoNotificationMethods(safeParse(user.auto_notification_methods, ["SMS"]));
      const sendAtMidnight = user.auto_send_at_midnight === 1;
      setAutoSendAtMidnight(sendAtMidnight);
      setShowMessageTab(sendAtMidnight);
      setAutoMessageText(user.auto_message_text || "Happy Birthday {name}!");
    }
  }, [user]);

  const handleSaveAllSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = user?.id;
    if (!userId) return;

    await fetch(`http://localhost:5000/api/users/${userId}/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reminder: reminderDays, notification_type: reminderNotificationMethods, auto_send_at_midnight: autoSendAtMidnight, auto_message_text: autoMessageText, auto_notification_methods: autoNotificationMethods }),
    }).then(res => res.json()).then(data => {
      // Update the auth context with the latest user settings
      if (data.user) setUser(data.user);
    }).catch(err => console.error("Failed to save settings:", err));
  };

    const today = dayjs().startOf("day");

const getNextOccurrence = (dateStr: string) => {
  const original = dayjs(dateStr);
  const currentYear = today.year();
  let next = original.year(currentYear);

  if (next.isBefore(today, "day")) {
    next = next.add(1, "year");
  }

  return next;
};

const allEvents = [...events, ...contactEvents].sort((a, b) => {
  const aNext = getNextOccurrence(a.date);
  const bNext = getNextOccurrence(b.date);
  return aNext.diff(bNext);
});

const birthdays = allEvents.filter((e) => e.title.toLowerCase().startsWith("birthday")).length;
const anniversaries = allEvents.filter((e) => e.title.toLowerCase().startsWith("anniversary")).length;

const next7Days = today.add(7, "day");

const upcoming = allEvents.filter((e) => {
  const nextDate = getNextOccurrence(e.date);
  return nextDate.isSameOrAfter(today, "day") && nextDate.isSameOrBefore(next7Days, "day");
}).length;

const getLastOccurrence = (dateStr: string) => {
  const original = dayjs(dateStr);
  let last = original.year(today.year());
  if (last.isAfter(today, 'day')) {
    last = last.subtract(1, 'year');
  }
  return last;
};

const missedEvents = allEvents.filter(e => {
  const lastOccurrence = getLastOccurrence(e.date);
  return today.diff(lastOccurrence, 'day') > 0 && today.diff(lastOccurrence, 'day') <= 2;
});
const missed = missedEvents.length;


const upcomingEvents = allEvents
  .filter((e) => {
    const nextDate = getNextOccurrence(e.date);
    return nextDate.isSameOrAfter(today, "day") && nextDate.isSameOrBefore(next7Days, "day");
  })
  .slice(0, 5);

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
              {isUserBirthdayToday && (
                <div className="w-full bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
                  <p className="font-bold">🎉 Happy Birthday, {user?.name || "User"}! 🎉</p>
                  <p>We hope you have a fantastic day filled with joy and surprises!</p>
                </div>
              )}
            </div>
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

            <ContactForm
              show={showContactForm}
              onClose={() => setShowContactForm(false)}
              onSave={fetchEvents}
              userId={user?.id}
              initialData={null}
            />

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
            <div className="bg-gradient-to-r from-purple-100/80 via-pink-100/80 to-indigo-100/80 rounded-xl p-6 shadow-lg border border-white/30 backdrop-blur">
              <h3 className="text-lg font-bold mb-4 text-indigo-800">Missed Events</h3>
              <ul className="space-y-2">
                {missedEvents.length === 0 && (
                  <li className="text-gray-500">No missed events.</li>
                )}
                {missedEvents.map((event, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <span className="text-xl">{event.title.startsWith("Birthday") ? "🎂" : "💍"}</span>
                    <span className="font-semibold text-red-700">
                      {event.title.replace(/^Birthday: |^Anniversary: /, "")}
                    </span>
                    <span className="ml-auto text-gray-600 text-sm">
                      {dayjs(event.date).format("DD MMM YYYY")}
                    </span>
                  </li>
                ))}</ul></div>
              
              
              {/* Replaced reminder-settings with a single animated container that toggles between Reminder Settings and Auto Messages.
                  Celebration Ideas card remains in the same grid column to the right. */}
              <div id="reminder-settings" className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {/* LEFT: single container that slides between two panels */}
                <div className="relative bg-transparent">
                  <div className="relative rounded-xl shadow-lg border border-white/30 group overflow-hidden">
                    {/* Previous Button */}
                    {activePanel !== "settings" && (
                      <button
                        aria-label="Previous panel"
                        onClick={() => setActivePanel(p => p === "message" ? "auto" : "settings")}
                        className="absolute -left-3 top-1/2 transform -translate-y-1/2 bg-indigo-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Previous Settings"
                      >
                        &lt;
                      </button>
                    )}

                    {/* Next Button */}
                    {((activePanel === "settings") || (activePanel === "auto" && showMessageTab)) && (
                      <button
                        aria-label="Next panel"
                        onClick={() => setActivePanel(p => p === "settings" ? "auto" : "message")}
                        className="absolute -right-3 top-1/2 transform -translate-y-1/2 bg-indigo-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Next Settings"
                      >
                        &gt;
                      </button>
                    )}

                    {/* sliding wrapper: width 300% with three panels */}
                    <div
                      className="flex w-[300%] transition-transform duration-500 ease-in-out rounded-xl"
                      style={{ transform: activePanel === "settings" ? "translateX(0%)" : activePanel === "auto" ? "translateX(-33.33%)" : "translateX(-66.67%)" }}
                    >
                      {/* Panel 1: Reminder Settings */}
                      <div className="w-1/3 bg-white/70 backdrop-blur p-6">
                        <h3 className="text-lg font-bold mb-4 text-indigo-800">Reminder Settings</h3>
                        <form className="space-y-4" onSubmit={handleSaveAllSettings}>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Remind me before</label>
                            <select value={reminderDays} onChange={(e) => setReminderDays(e.target.value)} className="w-full border rounded px-3 py-2 bg-white/80">
                              <option value="1 day">1 day</option>
                              <option value="3 days">3 days</option>
                              <option value="1 week">1 week</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Notification Method(s)</label>
                            <div className="flex gap-4 mt-2">
                              {["Email", "SMS"].map((method) => (
                                <label key={method} className="inline-flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={reminderNotificationMethods.includes(method)}
                                    onChange={() => setReminderNotificationMethods((prev) => {
                                      if (prev.includes(method)) {
                                        return prev.filter((m) => m !== method);
                                      }
                                      return [...prev, method];
                                    })}
                                    className="form-checkbox"
                                  />
                                  <span className="text-sm">{method}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                          <button type="submit" className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-300">
                            Save Settings
                          </button>
                        </form>
                      </div>

                      {/* Panel 2: Auto Messages */}
                      <div className="w-1/3 bg-white/70 backdrop-blur p-6 border-l border-white/20">
                        <h3 className="text-lg font-bold mb-4 text-indigo-800">Auto Messages</h3>
                        <form className="space-y-6" onSubmit={handleSaveAllSettings}>
                          <div>
                            <div className="flex items-center gap-1 mb-2">
                              <label className="block text-sm font-medium text-gray-700">Send automated message at midnight?</label>
                              {/* <HelpTooltip text="Enable this to automatically send greetings to your contacts on their event date." /> */}
                            </div>
                            <div className="flex items-center gap-4">
                              <label className="inline-flex items-center gap-2">
                                <input type="radio" name="autoMid" checked={autoSendAtMidnight === true} onChange={() => {
                                  setAutoSendAtMidnight(true);
                                  setShowMessageTab(true);
                                }} className="form-radio" />
                                <span className="text-sm">Yes</span>
                              </label>
                              <label className="inline-flex items-center gap-2">
                                <input type="radio" name="autoMid" checked={autoSendAtMidnight === false} onChange={() => {
                                  setAutoSendAtMidnight(false);
                                  setShowMessageTab(false);
                                  // If user says "No", slide them away from the message panel if they are on it
                                  if (activePanel === "message") {
                                    setActivePanel("auto");
                                  }
                                }} className="form-radio" />
                                <span className="text-sm">No</span>
                              </label>
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center gap-1 mb-2">
                              <label className="block text-sm font-medium text-gray-700">Notification Methods</label>
                              {/* <HelpTooltip text="Select how the automated greetings will be sent to your contacts." /> */}
                            </div>
                            <div className="flex gap-4">
                              {["SMS", "Email"].map((method) => (
                                <label key={method} className="inline-flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={autoNotificationMethods.includes(method)}
                                    className="form-checkbox"
                                    onChange={() =>
                                      setAutoNotificationMethods((prevMethods) => {
                                        const isCurrentlyChecked = prevMethods.includes(method);
                                        if (isCurrentlyChecked) {
                                          // If it's the last one, don't allow unchecking
                                          if (prevMethods.length === 1) return prevMethods;
                                          // Otherwise, remove it
                                          return prevMethods.filter((m) => m !== method);
                                        }
                                        // If not checked, add it to the array
                                        return [...prevMethods, method];
                                      })
                                    }
                                  />
                                  <span className="text-sm">{method}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          <div className="flex gap-2 pt-6">
                            <button type="submit" className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:shadow-lg transition-all duration-300">
                              Save Auto Settings
                            </button>
                            <button type="button" onClick={() => { setAutoSendAtMidnight(false); setAutoMessageText("Happy Birthday!"); }} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-semibold transition">
                              Reset
                            </button>
                          </div>
                        </form>
                      </div>

                      {/* Panel 3: Message Editor */}
                      <div className="w-1/3 bg-white/70 backdrop-blur p-6 border-l border-white/20">
                        <div className="flex items-center gap-1 mb-4">
                          <h3 className="text-lg font-bold text-indigo-800">Edit Automated Message</h3>
                          {/* <HelpTooltip text="Customize the message sent to your contacts. Use {name} as a placeholder for their name." /> */}
                        </div>
                        <form className="space-y-4" onSubmit={handleSaveAllSettings}>
                           <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Message Text</label>
                            <textarea
                              value={autoMessageText}
                              onChange={(e) => setAutoMessageText(e.target.value)}
                              className="w-full border rounded px-3 py-2 bg-white/80 h-32"
                              placeholder="Happy Birthday {name}!"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Use <code className="bg-gray-200 px-1 rounded">{'{name}'}</code> to insert the contact's name.
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <button type="submit" className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-300">
                              Save Message
                            </button>
                             <button type="button" onClick={() => setActivePanel("auto")} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold transition">
                              Back
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT: Celebration Ideas (unchanged) */}
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

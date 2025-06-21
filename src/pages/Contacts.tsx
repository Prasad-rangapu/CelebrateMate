import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import Navbar from "../components/navbar";
import Header from "../components/header";
import dayjs from "dayjs";

interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  birthday: string | null;
  anniversary: string | null;
}

const Contact = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Contact>({
    id: 0,
    name: "",
    email: "",
    phone: "",
    birthday: "",
    anniversary: "",
  });

  const fetchContacts = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/contacts?id=${user?.id}`);
      const data = await res.json();
      setContacts(data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    if (user?.id) fetchContacts();
  }, [user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

   
    const method = isEditing ? "PUT" : "POST";

    try {
      await fetch(`http://localhost:5000/api/contacts?user_id=${user?.id}`, {
       method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, user_id: user?.id, birthday: dayjs(formData?.birthday).format("YYYY-MM-DD") || null, anniversary:dayjs(formData.anniversary).format("YYYY-MM-DD") }),
      });

      setShowForm(false);
      setFormData({ id: 0, name: "", email: "", phone: "", birthday: "", anniversary: "" });
      fetchContacts();
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this contact?")) return;

    try {
      await fetch(`http://localhost:5000/api/contacts/${id}`, {
        method: "DELETE",
      });
      fetchContacts();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleEdit = (contact: Contact) => {
    setFormData(contact);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleNew = () => {
    setFormData({ id: 0, name: "", email: "", phone: "", birthday: "", anniversary: "" });
    setIsEditing(false);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-blue-100 to-purple-100 text-gray-800">
      <Navbar />
      <Header />

      <div className="max-w-6xl mx-auto px-6 py-10 relative">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-purple-700">📇 Your Contacts</h1>
          <button
            className="bg-purple-600 text-white px-4 py-2 rounded-xl shadow-md hover:bg-purple-700 transition"
            onClick={handleNew}
          >
            ➕ New Contact
          </button>
        </div>

        {contacts.length === 0 ? (
          <p className="text-center text-lg text-gray-500">No contacts found.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="bg-white rounded-2xl shadow-lg p-5 border-l-4 border-purple-400 transition-transform hover:scale-105 duration-300 relative"
              >
                <h2 className="text-xl font-bold text-purple-600 mb-2">{contact.name}</h2>
                <p className="text-gray-600 text-sm">
                  📧 {contact.email || <span className="text-gray-400 italic">No email</span>}<br />
                  📞 {contact.phone || <span className="text-gray-400 italic">No phone</span>}<br />
                  🎂 {contact.birthday ? (
                    <span className="text-pink-500">{dayjs(contact.birthday).format("YYYY-MM-DD")}</span>
                  ) : (
                    <span className="text-gray-400 italic">No birthday</span>
                  )}<br />
                  💍 {contact.anniversary ? (
                    <span className="text-blue-500">{dayjs(contact.anniversary).format("YYYY-MM-DD")}</span>
                  ) : (
                    <span className="text-gray-400 italic">No anniversary</span>
                  )}
                </p>

                <div className="absolute top-4 right-4 space-x-2">
                  <button
                    onClick={() => handleEdit(contact)}
                    className="text-sm bg-yellow-400 px-2 py-1 rounded hover:bg-yellow-500"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(contact.id)}
                    className="text-sm bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Form - styled like Dashboard */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md px-8 py-6">
            <h2 className="text-2xl font-bold text-purple-600 mb-4 text-center">
              {isEditing ? "Edit Contact" : "New Contact"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full border border-gray-300 rounded-lg p-2"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <input
                type="text"
                placeholder="Phone"
                className="w-full border border-gray-300 rounded-lg p-2"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg p-2"
                value={dayjs(formData.birthday).format("YYYY-MM-DD") || ""}
                onChange={(e) => setFormData({...formData,birthday: e.target.value})}
              />
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg p-2"
                value={dayjs(formData.anniversary).format("YYYY-MM-DD") || ""}
                onChange={(e) => setFormData({ ...formData, anniversary: e.target.value })}
              />

              <div className="flex justify-between">
                <button
                  type="button"
                  className="text-gray-500 hover:text-gray-800"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                >
                  {isEditing ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contact;

import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import Navbar from "../components/navbar";
import dayjs from "dayjs";
import ContactForm from "../components/ContactForm";
import type { Contact } from "../components/ContactForm";


interface ContactData extends Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  birthday: string | null;
  anniversary: string | null;
}

const Contacts = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<ContactData[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactData | null>(null);

  const fetchContacts = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/contacts?user_id=${user?.id}`);
      const data = await res.json();
      setContacts(data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    if (user?.id) fetchContacts();
  }, [user?.id]);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this contact?")) return;

    try {
      await fetch(`http://localhost:5000/api/contacts/${id}?user_id=${user?.id}`, {
        method: "DELETE",
      });
      fetchContacts();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleEdit = (contact: ContactData) => {
    setEditingContact(contact);
    setShowForm(true);
  };

  const handleNew = () => {
    setEditingContact(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingContact(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-blue-100 to-purple-100 text-gray-800">
      <Navbar />

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

      <ContactForm
        show={showForm}
        onClose={handleCloseForm}
        onSave={fetchContacts}
        userId={user?.id}
        initialData={editingContact}
      />
    </div>
  );
};

export default Contacts;

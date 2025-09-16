import React, { useState, useEffect } from "react";
import dayjs from "dayjs";

export interface Contact {
  id?: number;
  name: string;
  email: string;
  phone: string;
  birthday: string | null;
  anniversary: string | null;
}

interface ContactFormProps {
  show: boolean;
  onClose: () => void;
  onSave: () => void;
  userId: string | undefined;
  initialData?: Contact | null;
}

const ContactForm: React.FC<ContactFormProps> = ({ show, onClose, onSave, userId, initialData }) => {
  const [formData, setFormData] = useState<Omit<Contact, "id">>({
    name: "",
    email: "",
    phone: "",
    birthday: "",
    anniversary: "",
  });

  const isEditing = !!initialData?.id;

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        birthday: initialData.birthday ? dayjs(initialData.birthday).format("YYYY-MM-DD") : "",
        anniversary: initialData.anniversary ? dayjs(initialData.anniversary).format("YYYY-MM-DD") : "",
      });
    } else {
      setFormData({ name: "", email: "", phone: "", birthday: "", anniversary: "" });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    const method = isEditing ? "PUT" : "POST";
    const url = isEditing
      ? `http://localhost:5000/api/contacts/${initialData?.id}?user_id=${userId}`
      : `http://localhost:5000/api/contacts?user_id=${userId}`;

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, id: initialData?.id }),
    });

    onSave();
    onClose();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md px-8 py-6">
        <h2 className="text-2xl font-bold text-purple-600 mb-4 text-center">
          {isEditing ? "Edit Contact" : "New Contact"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" name="name" placeholder="Name" className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-400" value={formData.name} onChange={handleChange} required />
          <input type="email" name="email" placeholder="Email" className="w-full border border-gray-300 rounded-lg p-2" value={formData.email} onChange={handleChange} />
          <input type="text" name="phone" placeholder="Phone" className="w-full border border-gray-300 rounded-lg p-2" value={formData.phone} onChange={handleChange} />
          <input type="date" name="birthday" className="w-full border border-gray-300 rounded-lg p-2" value={formData.birthday || ""} onChange={handleChange} />
          <input type="date" name="anniversary" className="w-full border border-gray-300 rounded-lg p-2" value={formData.anniversary || ""} onChange={handleChange} />
          <div className="flex justify-between pt-2">
            <button type="button" className="text-gray-500 hover:text-gray-800" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
              {isEditing ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;

import { useAuth } from "../auth/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import { useState } from "react";
 import { toast } from "react-toastify";

const Profile = () => {
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    birthday: user?.birthday || "",
  });

  if (!user) return <Navigate to="/login" replace />;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to update profile.");
      const data = await response.json();
      const updatedUser = data.user;

      setUser(updatedUser);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("An error occurred while updating your profile.");
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      birthday: user.birthday,
    });
    setIsEditing(false);
  };

 // If you're using it

const handleLogout = () => {
  setUser(null);
  localStorage.removeItem("user");
  sessionStorage.removeItem("user");
toast.success("Logged out successfully!");
navigate("/");
window.location.reload();

};

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-200">
      <Navbar />
      <div className="flex justify-center items-start pt-16 px-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl w-full max-w-2xl p-8 border border-indigo-200">
          <h1 className="text-4xl font-extrabold text-indigo-700 mb-6 text-center drop-shadow-md">Your Profile</h1>

          {isEditing ? (
            <>
              {["name", "email", "phone", "birthday"].map((field) => (
                <div className="mb-5" key={field}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1 capitalize">
                    {field}
                  </label>
                  <input
                    type={field === "birthday" ? "date" : field === "email" ? "email" : "text"}
                    name={field}
                    value={formData[field as keyof typeof formData]}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-indigo-300 focus:ring-2 focus:ring-indigo-400 outline-none bg-white"
                  />
                </div>
              ))}
              <div className="flex justify-between mt-6">
                <button
                  onClick={handleSave}
                  className="bg-green-500 hover:bg-green-600 transition px-5 py-2 rounded-xl text-white font-semibold shadow-md"
                >
                  💾 Save
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-gray-400 hover:bg-gray-500 transition px-5 py-2 rounded-xl text-white font-semibold shadow-md"
                >
                  ❌ Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-4 text-lg text-gray-800 font-medium">
                <p><span className="font-semibold text-indigo-600">Name:</span> {user.name}</p>
                <p><span className="font-semibold text-indigo-600">Email:</span> {user.email}</p>
                <p><span className="font-semibold text-indigo-600">Phone:</span> {user.phone}</p>
                <p><span className="font-semibold text-indigo-600">Birthday:</span> {user.birthday.split("T")[0]}</p>
              </div>
              <div className="mt-6 text-center space-x-4">
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-500 hover:bg-blue-600 transition px-6 py-2 rounded-xl text-white font-semibold shadow-lg"
                >
                  ✏️ Edit Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 transition px-6 py-2 rounded-xl text-white font-semibold shadow-lg"
                >
                  🚪 Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

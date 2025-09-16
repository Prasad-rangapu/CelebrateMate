import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

// Define the form fields and types
type FormField = "name" | "email" | "birthday" | "phone" | "password";

interface FormData {
  name: string;
  email: string;
  birthday: string;
  phone: string;
  password: string;
}

export default function Signup() {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    birthday: "",
    phone: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const field = e.target.name as FormField;
    setFormData({ ...formData, [field]: e.target.value });
  };
    
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/users/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("Signup failed");
      }

      const data = await res.json();
      setUser(data.user);
      navigate("/dashboard");
    } catch (err) {
      alert("Signup failed. Please try again.");
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-pink-200 via-blue-200 to-green-200 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white/60 backdrop-blur-xl shadow-2xl rounded-2xl p-8 w-full max-w-md space-y-4 border border-white/30"
      >
        <h2 className="text-3xl font-bold text-center text-pink-700">Create Your Account</h2>

        {(["name", "email", "birthday", "phone", "password"] as FormField[]).map((field) => (
          <input
            key={field}
            type={field === "birthday" ? "date" : field === "password" ? "password" : "text"}
            name={field}
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            value={formData[field]}
            onChange={handleChange}
            required
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
        ))}

        <button className="w-full bg-gradient-to-r from-pink-500 to-indigo-500 text-white py-3 rounded-lg font-semibold hover:scale-105 transition duration-200">
          Sign Up
        </button>
        <p className="text-center text-gray-600">
          Already have an account?{" "}
          <span
            className="text-pink-600 cursor-pointer hover:underline"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>  
      </form>
    </div>
  );
}

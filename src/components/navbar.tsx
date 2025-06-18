import { FaHome, FaUser, FaAddressBook, FaBell, FaGift } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";

export default function Navbar() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const target = document.querySelector(location.hash);
      if (target) {
        setTimeout(() => {
          target.scrollIntoView({ behavior: "smooth" });
        }, 100); // Ensure DOM is ready
      }
    }
  }, [location]);

  return (
    <nav className="bg-white/40 backdrop-blur-lg text-indigo-700 rounded-xl shadow-md px-6 py-3 mt-4 mx-auto max-w-4xl border border-white/30">
      <ul className="flex justify-between items-center gap-6">
        <li>
          <Link
            to="/dashboard"
            className="flex items-center gap-2 font-semibold hover:text-pink-500 transition hover:scale-110"
          >
            <FaHome /> Dashboard
          </Link>
        </li>
        <li>
          <Link
            to="/profile"
            className="flex items-center gap-2 font-semibold hover:text-purple-500 transition hover:scale-110"
          >
            <FaUser /> Profile
          </Link>
        </li>
        <li>
          <Link
            to="/contacts"
            className="flex items-center gap-2 font-semibold hover:text-indigo-500 transition hover:scale-110"
          >
            <FaAddressBook /> Contacts
          </Link>
        </li>
        <li>
          <Link
            to="/dashboard#reminder-settings"
            className="flex items-center gap-2 font-semibold hover:text-yellow-500 transition hover:scale-110"
          >
            <FaBell /> Notifications
          </Link>
        </li>
        <li>
          <Link
            to="/dashboard#celebration-ideas"
            className="flex items-center gap-2 font-semibold hover:text-pink-500 transition hover:scale-110"
          >
            <FaGift /> Ideas
          </Link>
        </li>
      </ul>
    </nav>
  );
}

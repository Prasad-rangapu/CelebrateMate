import { FaHome, FaUser, FaAddressBook, FaBell, FaGift } from "react-icons/fa";

export default function Navbar() {
  return (
    <nav className="bg-white/40 backdrop-blur-lg text-indigo-700 rounded-xl shadow-md px-6 py-3 mt-4 mx-auto max-w-4xl border border-white/30">
      <ul className="flex justify-between items-center gap-6">
        <li>
          <a href="#" className="flex items-center gap-2 font-semibold hover:text-pink-500 transition hover:scale-110">
            <FaHome /> Dashboard
          </a>
        </li>
        <li>
          <a href="#" className="flex items-center gap-2 font-semibold hover:text-purple-500 transition hover:scale-110">
            <FaUser /> Profile
          </a>
        </li>
        <li>
          <a href="#" className="flex items-center gap-2 font-semibold hover:text-indigo-500 transition hover:scale-110">
            <FaAddressBook /> Contacts
          </a>
        </li>
        <li>
          <a href="#" className="flex items-center gap-2 font-semibold hover:text-yellow-500 transition hover:scale-110">
            <FaBell /> Notifications
          </a>
        </li>
        <li>
          <a href="#" className="flex items-center gap-2 font-semibold hover:text-pink-500 transition hover:scale-110">
            <FaGift /> Ideas
          </a>
        </li>
      </ul>
    </nav>
  );
}
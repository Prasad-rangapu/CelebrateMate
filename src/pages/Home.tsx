import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 px-4 text-center">
      <div className="bg-white shadow-2xl rounded-2xl p-10 max-w-xl w-full animate-fade-in">
        <h1 className="text-5xl font-extrabold text-purple-700 mb-6 tracking-tight">
          🎉 Welcome to CelebrateMate
        </h1>
        <p className="mb-8 text-lg text-gray-700">
          Effortlessly track and celebrate birthdays and anniversaries with joy!
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/login"
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold shadow-md hover:scale-105 transition-transform duration-300"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-green-400 to-teal-500 text-white font-semibold shadow-md hover:scale-105 transition-transform duration-300"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;

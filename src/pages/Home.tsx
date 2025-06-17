import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center">
      <h1 className="text-4xl font-bold mb-6">Welcome to CelebrateMate 🎉</h1>
      <p className="mb-4 text-lg">Track and celebrate birthdays and anniversaries effortlessly!</p>
      <div className="space-x-4">
        <Link
          to="/login"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Login
        </Link>
        <Link
          to="/signup"
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Sign Up
        </Link>
      </div>
    </div>
  );
};

export default Home;

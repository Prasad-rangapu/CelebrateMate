import { useAuth } from "../auth/AuthContext";

const Main = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-center">
      <h1 className="text-3xl font-bold mb-4">Hello, {user?.name}! 🎈</h1>
      <p className="text-lg mb-6">Welcome to your CelebrateMate dashboard.</p>
      <button
        onClick={logout}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
};

export default Main;


const Profile = () => {
  // Placeholder user data
  const user = {
    name: "John Doe",
    email: "john@example.com",
    phone: "+1234567890",
  };

  return (
    <div className="bg-white/70 rounded-xl p-6 shadow-lg border border-white/30 max-w-md mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4 text-indigo-800">My Profile</h2>
      <div className="space-y-2">
        <div>
          <span className="font-semibold">Name:</span> {user.name}
        </div>
        <div>
          <span className="font-semibold">Email:</span> {user.email}
        </div>
        <div>
          <span className="font-semibold">Phone:</span> {user.phone}
        </div>
      </div>
      {/* Add edit functionality as needed */}
    </div>
  );
};

export default Profile;
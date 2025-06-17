import React, { useState } from "react";

const RemainderSettings = () => {
  const [remindBefore, setRemindBefore] = useState("1 day");
  const [notificationType, setNotificationType] = useState("Email");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save settings to backend here
    alert("Reminder settings saved!");
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Remind me before
        </label>
        <select
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          value={remindBefore}
          onChange={(e) => setRemindBefore(e.target.value)}
        >
          <option>1 day</option>
          <option>3 days</option>
          <option>1 week</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notification Type
        </label>
        <select
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          value={notificationType}
          onChange={(e) => setNotificationType(e.target.value)}
        >
          <option>Email</option>
          <option>SMS</option>
          <option>Push Notification</option>
        </select>
      </div>
      <button
        type="submit"
        className="bg-gradient-to-r from-indigo-400 to-pink-400 text-white px-4 py-2 rounded-lg font-semibold hover:scale-105 hover:shadow-xl transition-all duration-300"
      >
        Save Settings
      </button>
    </form>
  );
};

export default RemainderSettings;
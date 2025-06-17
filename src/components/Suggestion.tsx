

const suggestions = [
  "Send a personalized gift",
  "Organize a virtual party",
  "Write a heartfelt message",
  "Plan a surprise video call",
  "Create a photo collage",
  "Arrange a group greeting card",
];

const Suggestion = () => (
  <div className="bg-white/70 rounded-xl p-6 shadow-lg border border-white/30">
    <h3 className="text-lg font-bold mb-4 text-indigo-800">
      Celebration Ideas
    </h3>
    <ul className="list-disc pl-5 text-gray-700 space-y-1">
      {suggestions.map((idea, idx) => (
        <li key={idx}>{idea}</li>
      ))}
    </ul>
  </div>
);

export default Suggestion;
import { FaBirthdayCake } from "react-icons/fa";

export default function Header() {
  return (
   <header className="bg- ">
    <div className="flex items-center justify-center bg-blue-500 p-4">
      <FaBirthdayCake className="text-white text-3xl mr-2" />
      <h1 className="text-white text-2xl font-bold">CelebrateMate</h1>
    </div>
   
   </header>
  );
}

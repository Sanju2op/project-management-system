import React from "react";

function Button({ children, type = "button", onClick }) {
  return (
    <button
      type={type}
      onClick={onClick}
      // New styling for a modern, sleek look with a gradient background
      className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 
                 text-white py-3 px-6 rounded-full font-bold text-lg
                 transition duration-300 ease-in-out transform hover:-translate-y-1
                 shadow-lg hover:shadow-2xl 
                 focus:outline-none focus:ring-4 focus:ring-purple-400 focus:ring-opacity-75
                 tracking-wide border-2 border-transparent hover:border-white"
    >
      {children}
    </button>
  );
}

export default Button;

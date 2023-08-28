import React, { useState } from 'react';

export default function Switch({autoCrop, setAutoCrop}) {

  const handleToggle = () => {
    setAutoCrop(!autoCrop)
  };

  return (
    <div className="flex items-center space-x-2">
      <input
        type="checkbox"
        id="toggleSwitch"
        className="hidden"
        checked={autoCrop}
        onChange={handleToggle}
      />
      <label
        htmlFor="toggleSwitch"
        className={`${autoCrop ? 'bg-green-500' : 'bg-gray-300'} w-12 h-6 rounded-full p-1 flex cursor-pointer transition duration-300 ease-in-out`}
      >
        <span
          className={`${
            autoCrop ? 'translate-x-6' : 'translate-x-0'
          } bg-white w-4 h-4 rounded-full shadow-md transform transition duration-300 ease-in-out`}
        ></span>
      </label>
    </div>
  );
};

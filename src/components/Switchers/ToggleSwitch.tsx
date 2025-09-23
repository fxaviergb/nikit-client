"use client";

import React from "react";

interface ToggleSwitchProps {
  label: string; // Texto al lado del toggle
  checked: boolean; // Estado ON/OFF
  onToggle: () => void; // Función a ejecutar cuando cambia
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  label,
  checked,
  onToggle,
}) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
      <label
        className={`relative m-0 block h-7.5 w-14 rounded-full transition-colors duration-300 ${
          checked ? "bg-purple-600" : "bg-stroke"
        }`}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          className="absolute top-0 z-50 m-0 h-full w-full cursor-pointer opacity-0"
        />
        <span
          className={`absolute left-[3px] top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-switcher duration-300 ease-in-out ${
            checked ? "translate-x-7" : "translate-x-0"
          }`}
        />
      </label>
    </div>
  );
};

export default ToggleSwitch;

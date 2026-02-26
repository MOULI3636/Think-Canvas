import React, { useState } from 'react';
import { ChromePicker } from 'react-color';

const presetColors = [
  '#000000', '#ffffff', '#f44336', '#e91e63', '#9c27b0', '#673ab7',
  '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50',
  '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'
];

const ColorPicker = ({ color, onChange, onClose }) => {
  const [customColor, setCustomColor] = useState(color);

  const handleChange = (newColor) => {
    setCustomColor(newColor.hex);
    onChange(newColor.hex);
  };

  return (
    <div className="absolute top-10 left-0 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 p-4 border dark:border-gray-700">
      <ChromePicker
        color={customColor}
        onChange={handleChange}
        disableAlpha
      />
      
      <div className="mt-4">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Preset Colors</p>
        <div className="grid grid-cols-6 gap-2">
          {presetColors.map((presetColor) => (
            <button
              key={presetColor}
              onClick={() => onChange(presetColor)}
              className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600"
              style={{ backgroundColor: presetColor }}
              title={presetColor}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ColorPicker;
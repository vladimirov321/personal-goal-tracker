import React from 'react';

interface ProgressControlProps {
  value: number;
  onChange: (value: number) => void;
}

const ProgressControl: React.FC<ProgressControlProps> = ({ value, onChange }) => {
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    onChange(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Math.min(100, Math.max(0, parseInt(e.target.value || '0')));
    onChange(newValue);
  };

  return (
    <div className="mt-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">Progress:</span>
        <div className="flex items-center">
          <input
            type="number"
            min="0"
            max="100"
            value={value || 0}
            onChange={handleInputChange}
            className="w-16 px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <span className="ml-1 text-sm text-gray-700">%</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min="0"
          max="100"
          value={value || 0}
          onChange={handleSliderChange}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default ProgressControl;

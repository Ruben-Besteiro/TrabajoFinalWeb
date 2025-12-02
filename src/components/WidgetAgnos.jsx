'use client';

export default function WidgetAgnos({ selectedYears, onYearsChange }) {
  // Los eventos de cuando cambiamos el min y el max en el slider
  const handleMinChange = (e) => {
    const newMin = parseInt(e.target.value);
    if (newMin <= selectedYears[1]) {
      onYearsChange([newMin, selectedYears[1]]);
    }
  };
  const handleMaxChange = (e) => {
    const newMax = parseInt(e.target.value);
    if (newMax >= selectedYears[0]) {
      onYearsChange([selectedYears[0], newMax]);
    }
  };

  return (
    <div className="mb-4 p-3 border border-gray-300 rounded-sm">
      <h3 className="font-bold">Años</h3>
      
      <div className="mb-3">
         {/* Hay 2 sliders: uno para el min y otro para el max */}

        <label className="text-sm block mb-1">Desde: {selectedYears[0]}</label>
        <input
          type="range"
          min={1950}
          max={2025}
          value={selectedYears[0]}
          onChange={handleMinChange}
          className="w-full"
        />
      </div>

      <div>
        <label className="text-sm block mb-1">Hasta: {selectedYears[1]}</label>
        <input
          type="range"
          min={1950}
          max={2025}
          value={selectedYears[1]}
          onChange={handleMaxChange}
          className="w-full"
        />
      </div>
    </div>
  );
}
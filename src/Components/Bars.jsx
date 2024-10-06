// src/components/BarChart.js

import React, { useEffect, useState } from 'react';
import '../Model.css'; // Assuming you have a separate CSS file for styles

const BarChart = () => {
  const [bars, setBars] = useState([]);

  // Function to generate bars
  const generateBars = () => {
    const newBars = [];
    for (let i = 0; i < 90; i++) {
      const left = (i * 2) + 1; // Spacing each bar 2px apart
      const anim = Math.floor(Math.random() * 75 + 400); // Animation duration between 400ms and 475ms
      const height = Math.floor(Math.random() * 25 + 3); // Random height between 3px and 25px

      newBars.push({ left, anim, height });
    }
    setBars(newBars);
  };

  useEffect(() => {
    generateBars();
  }, []);

  return (
    <div id="bars">
      {bars.map((bar, index) => (
        <div
          key={index}
          className="bar"
          style={{
            left: `${bar.left}px`,
            animationDuration: `${bar.anim}ms`,
            height: `${bar.height}px`,
          }}
        />
      ))}
    </div>
  );
};

export default BarChart;

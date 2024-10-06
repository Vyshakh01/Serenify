// src/Home.js
import React, { useEffect, useState } from 'react';
import ModelViewer from './ModelViewer';
function Home() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ModelViewer />
    </div>
  );
}

export default Home;
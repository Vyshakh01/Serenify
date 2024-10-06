import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stage } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { useLoader } from '@react-three/fiber';
import { AnimationMixer } from 'three';
import './Model.css'; // Import CSS file for styling
import Emotion from './Emotion'; // Import the Emotion component
import Bars from './Components/Bars';
import MusicPlayer from './Components/MusicPlayer';

function Model({ url, mouseSpeed }) {
  const gltf = useLoader(GLTFLoader, url);
  const mixer = useRef(new AnimationMixer(gltf.scene));
  const actions = useRef({});

  useEffect(() => {
    // Load animations from GLTF
    gltf.animations.forEach((clip) => {
      actions.current[clip.name] = mixer.current.clipAction(clip);
    });

    // Play the first animation found
    const firstAction = Object.values(actions.current)[0];
    if (firstAction) firstAction.play();

    return () => {
      actions.current = {};
    };
  }, [gltf]);

  // Update the mixer in the render loop
  useFrame((state, delta) => {
    // Update the animation mixer only if mouse speed is above a threshold
    if (mouseSpeed > 0) {
      mixer.current.update(delta * mouseSpeed);
    }
  });

  return <primitive object={gltf.scene} />;
}

const ThreeScene = () => {
  const modelUrl = '/scene.gltf'; // Update with your GLTF file path
  const [mouseSpeed, setMouseSpeed] = React.useState(0);
  const [emotion, setEmotion] = useState('Neutral'); // State for storing the emotion

  const previousMousePosition = useRef(0); // Only track X position

  const handleMouseMove = (event) => {
    const currentMouseX = event.clientX;
    const deltaX = currentMouseX - previousMousePosition.current;

    // Sensitivity factor to reduce speed responsiveness
    const sensitivity = 0.1; // Adjust this value to control sensitivity
    const speed = Math.abs(deltaX) * sensitivity; // Only consider X movement

    // Set mouse speed based on the distance moved
    setMouseSpeed(speed);

    // Update previous mouse position
    previousMousePosition.current = currentMouseX;
  };

  // Callback function to update emotion from Emotion component
  const updateEmotion = (newEmotion) => {
    setEmotion(newEmotion);

  };

  // Reset mouse speed to 0 when the mouse is not moving
  useEffect(() => {
    const resetMouseSpeed = () => setMouseSpeed(0);
    window.addEventListener('mousemove', handleMouseMove);
    const handleMouseUp = () => setMouseSpeed(0); // Optional: Reset on mouse up

    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <>
      <div className="text">
        {/* Pass updateEmotion as a prop to the Emotion component */}
        <Emotion onEmotionChange={updateEmotion} />
      </div>
      <div className="song">
        <MusicPlayer emotion={emotion} />
      </div>
      <div className="model">
        <Canvas camera={{ position: [0, 1, 5], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <Stage>
            <Model url={modelUrl} mouseSpeed={mouseSpeed} />
          </Stage>
          <OrbitControls
            minPolarAngle={Math.PI / 4} // Limit minimum vertical rotation
            maxPolarAngle={Math.PI / 2} // Limit maximum vertical rotation
            minAzimuthAngle={-Math.PI / 4} // Limit minimum horizontal rotation
            maxAzimuthAngle={Math.PI / 4} // Limit maximum horizontal rotation
            enableZoom={false} // Disable zoom with scroll
          />
        </Canvas>
      </div>
    </>
  );
};

export default ThreeScene;

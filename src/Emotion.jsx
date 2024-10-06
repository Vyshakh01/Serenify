import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';

const Emotion = ({ onEmotionChange }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const emotionList = useRef([]); // Array to keep track of detected emotions
  const [dominantEmotion, setDominantEmotion] = useState("happy"); // State for the most repeated emotion
  let emotionChart = null;

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Access the camera
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        video.srcObject = stream;
        // Automatically capture the photo every 3 seconds
        const intervalId = setInterval(captureAndSendPhoto, 3000);
        // Set interval to reset emotionList every minute (60000 ms)
        const resetIntervalId = setInterval(() => {
          const mostRepeatedEmotion = getMostFrequentEmotion(emotionList.current);
          setDominantEmotion(mostRepeatedEmotion);
          onEmotionChange(mostRepeatedEmotion); // Send the most frequent emotion
          emotionList.current = []; // Reset the emotion array every minute
        }, 30000);

        // Clean up the intervals when the component unmounts
        return () => {
          clearInterval(intervalId);
          clearInterval(resetIntervalId);
        };
      })
      .catch(err => {
        console.error("Error accessing camera: ", err);
      });

    // Capture the photo and send it to the backend
    function captureAndSendPhoto() {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert the image to a Blob and send to the backend
      canvas.toBlob(async (blob) => {
        const formData = new FormData();
        formData.append('image', blob, 'photo.png'); // Append Blob to formData as 'image'
        await sendImage(formData);
      }, 'image/png');
    }

    // Function to send the image to the backend
    async function sendImage(data) {
      try {
        const response = await fetch('http://127.0.0.1:5000/emotion', {
          method: 'POST',
          body: data
        });
        const result = await response.json();

        if (result && result.length > 0 && result[0].dominant_emotion) {
          // Add detected dominant emotion to emotionList
          emotionList.current.push(result[0].dominant_emotion);
         
          
          // Display the emotion percentages graphically
          displayEmotionChart(result[0].emotion_percentages);
        } else {
          console.error("Unexpected response structure: ", result);
        }

      } catch (error) {
        console.error("Error sending image to backend: ", error);
      }
    }

    // Function to display the emotion percentages as a bar chart
    function displayEmotionChart(emotions) {
      const emotionLabels = Object.keys(emotions);
      const emotionValues = Object.values(emotions);

      // If chart already exists, update it; otherwise, create a new one
      if (emotionChart) {
        emotionChart.data.datasets[0].data = emotionValues;
        emotionChart.update();
      } else {
        const ctx = document.getElementById('emotionChart').getContext('2d');
        emotionChart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: emotionLabels,
            datasets: [{
              label: 'Emotion Percentages',
              data: emotionValues,
              backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)',
                'rgba(255, 205, 86, 0.2)'
              ],
              borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
                'rgba(255, 205, 86, 1)'
              ],
              borderWidth: 1
            }]
          },
          options: {
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });
      }
    }

    // Helper function to get the most frequent emotion from the array
    function getMostFrequentEmotion(emotionsArray) {
      if (emotionsArray.length === 0) {
        return "neutral"; // Return a default value when the array is empty
      }
      const emotionCounts = emotionsArray.reduce((acc, emotion) => {
        acc[emotion] = (acc[emotion] || 0) + 1;
        return acc;
      }, {});

      // Find the emotion with the maximum count
      return Object.keys(emotionCounts).reduce((a, b) => (emotionCounts[a] > emotionCounts[b] ? a : b));
    }

  }, [onEmotionChange]);

  return (
    <div style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
      <h2>Serenify</h2>

      {/* Display the most dominant emotion */}
      <div>
        <h3>Most Dominant Emotion: {dominantEmotion}</h3>
      </div>

      {/* Graph container filling the left half of the screen */}
      <div
        id="chartContainer"
        style={{
          position: 'absolute',
          left: 0,
          bottom: 0,
          width: '40%',
          height: '70%',
          zIndex: 0
        }}
      >
        <canvas ref={canvasRef} id="emotionChart" style={{ width: '100%', height: '100%' }}></canvas>
      </div>

      {/* Video feed positioned in the right half of the screen */}
      <video
        ref={videoRef}
        id="video"
        autoPlay
        style={{
          position: 'absolute',
          bottom: 10,
          right: 10,
          width: '100px',
          border: '1px solid #ccc',
          zIndex: 1
        }}
      />

      <canvas ref={canvasRef} id="canvas" width="640" height="480" style={{ display: 'none' }} />
    </div>
  );
};

export default Emotion;

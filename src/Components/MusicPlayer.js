// src/components/MusicPlayer.js

import React, { useEffect, useState } from "react";
import { storage } from "../firebase";
import { ref, listAll, getDownloadURL } from "firebase/storage";

const MusicPlayer = ({emotion="Happy"}) => {
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const fetchSongs = async () => {
      const songsListRef = ref(storage, `songs/${emotion}`); // Path to your songs folder in Firebase Storage
      const songRefs = await listAll(songsListRef);
      const songUrls = await Promise.all(
        songRefs.items.map((songRef) => getDownloadURL(songRef))
      );
    
      console.log(songUrls);
      
      setSongs(songUrls);
    };

    fetchSongs();
  }, []);

  const playRandomSong = () => {
    console.log("called");
    
    if (songs.length === 0) return; // Do nothing if no songs are available

    const randomIndex = Math.floor(Math.random() * songs.length);
    const songUrl = songs[randomIndex];
    const audio = document.getElementById("audio");

    if (currentSong === songUrl) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
    } else {
      setCurrentSong(songUrl);
      setIsPlaying(true);
      audio.src = songUrl;
      audio.play();
    }
  };

  return (
    <div >
     
      <button onClick={playRandomSong}>Play Random Song</button>
      <audio id="audio" />
    </div>
  );
};

export default MusicPlayer;

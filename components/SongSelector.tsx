//added this file for the spotify player component so that users can send songs as well along with hearts

import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface SongSelectorProps {
  onConfirm: (selectedSongId: string | null) => void;
}

const SongSelector: React.FC<SongSelectorProps> = ({ onConfirm }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [songs, setSongs] = useState<any[]>([]);
  const [accessToken, setAccessToken] = useState('');
  const [selectedSong, setSelectedSong] = useState<any | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchSongs = async () => {
      setIsLoading(true);
  
      if (!searchQuery) {
        setSongs([]);
        setIsLoading(false);
        return;
      }
  
      const accessToken = localStorage.getItem("access_token");
  
      if (!accessToken) {
        console.error("Access token not found in localStorage");
        setErrorMessage("Spotify not connected");
        setIsLoading(false);
        return;
      }
  
      try {
        const response = await axios.get('https://api.spotify.com/v1/search', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            q: searchQuery,
            type: 'track',
            limit: 10,
          },
        });
  
        setSongs(response.data.tracks.items);
        setErrorMessage(""); // Clear any previous error messages
      } catch (error) {
        console.error("Error fetching songs from Spotify:", error);
        setErrorMessage("Spotify not connected");
      } finally {
        setIsLoading(false);
      }
    };
  
    const debounceTimeout = setTimeout(fetchSongs, 200); 
    return () => clearTimeout(debounceTimeout);
  }, [searchQuery]);
  

  const handleSongSelection = (song: any) => {
    setSelectedSong(song);
  };

  const handleConfirm = () => {
    setIsConfirmed(true);
    onConfirm(selectedSong ? selectedSong.id : null);
    setSearchQuery(''); 
    setSongs([]); 
  };

  const handleEdit = () => {
    setIsConfirmed(false);
  };
  const handleRemove = () => {
    setSelectedSong(null);
    setIsConfirmed(false);
    onConfirm(null);
  };
  return (
    <div style={{ width: '100%', padding: '4px', boxSizing: 'border-box' }}>
  
      <input
        type="text"
        placeholder="Type a song name..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{
          width: '100%',
          padding: '10px 15px',
          boxSizing: 'border-box',
          backgroundColor: '#f9f9f9',
          border: '2px solid #ff69b4',
          borderRadius: '20px',
          outline: 'none',
          fontSize: '16px',
          color: '#333',
          transition: 'border-color 0.3s ease',
        }}
        onFocus={(e) => (e.target.style.borderColor = '#ff1493')}
        onBlur={(e) => (e.target.style.borderColor = '#ff69b4')}
      />

      {isLoading && (
        <div style={{ textAlign: 'center', marginTop: '5px' }}>
          <span>Loading...</span>
        </div>
      )}
  {errorMessage && <p className="error-message">{errorMessage}</p>}
      {/* {selectedSong && (
        <div style={{ marginTop: '10px', padding: '10px', borderRadius: '5px' }}>
          <div style={{ position: 'relative', marginBottom: '5px' }}>
            <iframe
              src={`https://open.spotify.com/embed/track/${selectedSong.id}`}
              allow="encrypted-media"
              title={selectedSong.name}
              style={{
                width: '100%',
                height: '80px',
                border: 'none',
                borderRadius: '12px',
              }}
            ></iframe>
          </div>
        </div>
      )} */}

      {!isConfirmed && (
        <button
          onClick={handleConfirm}
          style={{
            marginTop: '10px',
            padding: '10px 15px',
            backgroundColor: selectedSong ? '#ff69b4' : '#d3d3d3',
            border: 'none',
            borderRadius: '20px',
            color: '#fff',
            fontSize: '16px',
            cursor: selectedSong ? 'pointer' : 'not-allowed',
            width: '100%',
          }}
          disabled={!selectedSong}
        >
          Confirm My Choice
        </button>
      )}
{isConfirmed && (
         <button
            onClick={handleRemove}
            style={{
              marginTop: '10px',
              padding: '10px 15px',
              backgroundColor: 'red',
              border: 'none',
              borderRadius: '20px',
              color: '#fff',
              fontSize: '16px',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            Remove Selection
          </button>
)}

      <div style={{ marginTop: '10px' }}>
        {songs.map((song) => (
          <div key={song.id} style={{ marginBottom: '3px', display: 'flex', alignItems: 'center' }}>
            <input
              type="radio"
              name="songSelection"
              checked={selectedSong?.id === song.id}
              onChange={() => handleSongSelection(song)}
              disabled={isConfirmed}
              style={{ marginRight: '10px' }}
            />
            <iframe
              src={`https://open.spotify.com/embed/track/${song.id}`}
              width="90%"
              height="80"
              allow="encrypted-media"
              title={song.name}
              style={{  borderRadius: '12px' }}
            ></iframe>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SongSelector;

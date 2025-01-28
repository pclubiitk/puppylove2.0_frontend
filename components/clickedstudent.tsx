import React, { useEffect, useState } from 'react';
import Card from './card';
import '../styles/selectcard.css';
import { Student } from '../utils/API_Calls/search';

interface ClickedStudentsProps {
  clickedStudents: Student[];
  onUnselectStudent: (studentRoll: string) => void;
  hearts_submitted: boolean;
  selectedSongIds: { [key: string]: string | null };
  setSelectedSongIds:Function; 
}

const ClickedStudents: React.FC<ClickedStudentsProps> = ({
  clickedStudents,
  onUnselectStudent,
  hearts_submitted,
  selectedSongIds,
  setSelectedSongIds,
  
}) => {

  return (
    <div className="clicked-students-container">
      {clickedStudents.map((student) => (
         <div key={student.i} className="clicked-student-card">
        <Card
          key={student.i}
          student={student}
          onClick={() => onUnselectStudent(student.i)}
          isActive={() => true}
          clickedCheck={true}
          inSelectSection={true}
          hearts_submitted={hearts_submitted}
         setSelectedSongId={setSelectedSongIds}
          selectedSongId={selectedSongIds[student.i]}
        />
        {/* <div className="selected-song">
    {selectedSongIds[student.i] ? (
     <iframe
      src={`https://open.spotify.com/embed/track/${selectedSongIds[student.i]}`}
      width="300"
      height="80"
      allow="autoplay; encrypted-media"
      style={{
        borderRadius: '12px',
      }}
    ></iframe>
  ) : (
    'No song selected'
  )}
         </div> */}
</div>
      ))}
    </div>
  );
};

export default ClickedStudents;

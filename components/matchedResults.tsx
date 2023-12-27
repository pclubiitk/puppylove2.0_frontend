"use client"

import {useEffect, useState} from "react"
import {Student, search_students} from "../utils/API_Calls/search"
import { get_result } from '@/utils/API_Calls/get_results';
import { Matches } from '@/utils/UserData';
import MatchedCard from './matched_card';
import '../styles/result-card.css'

const Results = () => {

  return (
    <div className="matched-div">
      {Matches.map((student) => (
        <MatchedCard
          key={student.i}
          student={student}
          matched
        />
      ))}
    </div>    
  );
};

export default Results;

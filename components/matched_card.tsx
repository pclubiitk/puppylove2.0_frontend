import React, { useState } from "react";
import "../styles/result-card.css";

const MatchedCard = ({ student }: any) => {
  const userName = student.u;
  const roll = student.i;

  const stylesss = {
    backgroundImage: `url("https://home.iitk.ac.in/~${userName}/dp"), url("https://oa.cc.iitk.ac.in/Oa/Jsp/Photo/${roll}_0.jpg"), url("/dummy.png")`,
  };


  return (
    <div className= "cardr">
      <div className="image-boxr">
        <div className="profiler" style={stylesss}></div>
      </div>
      <p className="card-detailsr">{student.n}</p>
      <p className="card-detailsr">{student.i}</p>
    </div>
  );
};

export default MatchedCard;
import React from "react";
import "./About.css";

const About = ({ onClose }) => {
  return (
    <div className="about-overlay">
      <div className="about-popup">
        <div className="about-header">
          <h2><b>ABOUT THIS PROJECT</b></h2>
          <button onClick={onClose}>X</button>
        </div>
        <div className="about-content">
          <p>
            A standard deck has 52 cards, and the number of ways you can arrange them is 52 factorial (52!) or 8×10⁶⁷.
          </p>
          <p id='fullnumber'>That's <b>80,658,175,170,943,878,571,660,636,856,403,766,975,289,505,440,883,277,824,000,000,000,000</b><br/>possible combinations.</p>
          <p>
            To put it simply, every time you shuffle the deck, you are almost certainly creating an arrangement 
            of cards that has never existed before in the history of the universe.
          </p>
          <p>
            If your sequence matches partially or completely with someone else's, it shows up on the leaderboard.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;

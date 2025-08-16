import { useState } from 'react';
import './App.css';
import Leaderboard from './pages/Leaderboard';
import About from './pages/About';
import { FaGithub, FaReddit, FaInstagram } from "react-icons/fa";
import logo from './assets/card-logo.svg';


const cardCodes = [
  "AS", "2S", "3S", "4S", "5S", "6S", "7S", "8S", "9S", "0S", "JS", "QS", "KS",
  "AH", "2H", "3H", "4H", "5H", "6H", "7H", "8H", "9H", "0H", "JH", "QH", "KH",
  "AD", "2D", "3D", "4D", "5D", "6D", "7D", "8D", "9D", "0D", "JD", "QD", "KD",
  "AC", "2C", "3C", "4C", "5C", "6C", "7C", "8C", "9C", "0C", "JC", "QC", "KC"
];

const generateDeck = () => {
  return cardCodes.map(code => ({
    code,
    image: `https://deckofcardsapi.com/static/img/${code}.png`
  }));
};

const fisherYatesShuffle = (deck) => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

function App() {
  const [cards, setCards] = useState(generateDeck());
  const [revealed, setRevealed] = useState(false);
  const [hasShuffled, setHasShuffled] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragCount, setDragCount] = useState(0);
  const dragLimit = 5;
  const [isShuffling, setIsShuffling] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [touchDragIndex, setTouchDragIndex] = useState(null);
  const [touchCurrentIndex, setTouchCurrentIndex] = useState(null);



  
  const shuffleCards = () => {
    setIsShuffling(true);
    setRevealed(false);
    setTimeout(() => {
      setCards(fisherYatesShuffle(cards));
      setHasShuffled(true);
      setDragCount(0);
      setDraggedIndex(null);
      setIsShuffling(false);
    }, 500);
  }
  const toggleReveal = () => {
    setRevealed(prev => !prev);
  };

//   const handleSave = () => {
//     if (!hasShuffled) {
//       alert("Shuffle the cards first before saving");
//       return;
//     }
//     console.log("Permutation Saved:", cards.map(c => c.code));
//   };

  const handleDragStart = (index, event) => {
    setDraggedIndex(index);
    const dragGhost = event.target.cloneNode(true);
    dragGhost.style.opacity = "1";
    dragGhost.style.position = "absolute";
    dragGhost.style.top = "-9999px";
    document.body.appendChild(dragGhost);
    // event.dataTransfer.setDragImage(dragGhost);
    
    // dragGhost.style.width = `${event.target.offsetWidth}px`;
    // dragGhost.style.height = `${event.target.offsetHeight}px`;
    setTimeout(() => document.body.removeChild(dragGhost), 0);
};

  const handleTouchStart = (e, index) => {
    setTouchDragIndex(index);
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e, index) => {
    if (touchDragIndex === null) return;

    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - touchStart.x);
    const dy = Math.abs(touch.clientY - touchStart.y);

    if (dx > dy) {
      e.preventDefault();
      setTouchCurrentIndex(index);
    }
  };

  const handleTouchEnd = () => {
    if (touchDragIndex === null || touchCurrentIndex === null) {
      setTouchDragIndex(null);
      setTouchCurrentIndex(null);
      return;
    }

    if (dragCount >= dragLimit || touchDragIndex === touchCurrentIndex) {
      setTouchDragIndex(null);
      setTouchCurrentIndex(null);
      return;
    }

    // Swap cards
    const newCards = [...cards];
    [newCards[touchDragIndex], newCards[touchCurrentIndex]] =
      [newCards[touchCurrentIndex], newCards[touchDragIndex]];

    setCards(newCards);
    setDragCount(prev => prev + 1);

    setTouchDragIndex(null);
    setTouchCurrentIndex(null);
  };

  const handleSave = async () => {
    const saveBtn = document.getElementById("savebtn");
    const emailInput = document.querySelector('.email-section input[type="email"]').value;
    const usernameInput = document.querySelector('.email-section input[type="text"]').value;
      
    saveBtn.disabled = true;

    if (!hasShuffled) {
      alert("Shuffle the cards first before saving");
      saveBtn.disabled = false;
      return;
    } 
    if (!emailInput) {
      alert("Please enter your email");
      saveBtn.disabled = false;
      return;
    }

    try {
      const response = await fetch("https://random-deck-permutation.onrender.com/save-combination", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: emailInput,
          combination: cards.map(c => c.code), //.join(", ")
          username: usernameInput || undefined
        })
      });

      const data = await response.json();
      if (response.ok) {
        alert("Combination Saved and E-mail sent! \n\nNote: Saving a new combination with the same e-mail will overwrite the previous entry.");

        setHasShuffled(false);
        setDragCount(0);
        setDraggedIndex(null);
        setCards(generateDeck());
        
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error saving combination:", error);
      alert("Failed to save combination.");
    } finally {
    saveBtn.disabled = false;
    }
  };


  const handleDrop = (index) => {
    if (dragCount >= dragLimit || draggedIndex === null || draggedIndex === index) return;

    const newCards = [...cards];
    [newCards[draggedIndex], newCards[index]] = [newCards[index], newCards[draggedIndex]];

    setCards(newCards);
    setDragCount(prev => prev + 1);
    setDraggedIndex(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragEnd = () => {
    const ghost = document.getElementById("drag-ghost");
    if (ghost) ghost.remove();
    setDraggedIndex(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <a href="https://random-deck-permutation.vercel.app/" className="logo"><img src={logo} alt="logo" /></a>
          <button>RANDOMDECK</button>
        </div>
        <div className="header-right">
          <button onClick={() => setShowAbout(true)}>About</button>
          <button style={{ marginLeft: '5px' }} onClick={() => setShowLeaderboard(true)}>Leaderboard</button>
          <button style={{ marginRight: '5px' }}><a href='https://buymeacoffee.com/vince_tn'>Buy Me Coffee ☕︎</a></button>
        </div>
      </header>

      <div className="body">

        <div className="header-center">
          <button id="shufflebtn" onClick={shuffleCards}>SHUFFLE</button>
          <button id="flipbtn" onClick={toggleReveal} style={{ marginLeft: '10px' }}>
            {revealed ? 'Hide' : 'Reveal'}
          </button>
        </div>

        {isShuffling && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>Shuffling...</p>
          </div>
        )}

        <div className="card-grid">
          {cards.map((card, index) => (
            <div
              key={index}
              className={`card-container ${draggedIndex === index && dragCount < dragLimit ? 'dragging-out' : ''}`}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(index)}
              onDragEnd={handleDragEnd}
            >
          <div
            className={`card ${revealed ? 'revealed' : ''}`}
            draggable={dragCount < dragLimit} // desktop only
            onDragStart={(e) => handleDragStart(index, e)} // desktop
            onDragOver={handleDragOver} // desktop
            onDrop={() => handleDrop(index)} // desktop
            onDragEnd={handleDragEnd} // desktop
            onTouchStart={(e) => handleTouchStart(e, index)} // mobile
            onTouchMove={(e) => handleTouchMove(e, index)} // mobile
            onTouchEnd={handleTouchEnd} // mobile
          >

                <div className="card-inner">
                  <div className="card-front">
                    <img src={card.image} alt={card.code} />
                  </div>
                  <div className="card-back">
                    <img src="https://deckofcardsapi.com/static/img/back.png" alt="Back of card" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p id="text-under">
          Drag & Drop to swap cards. (Swaps used: {dragCount} / {dragLimit})<br/>Note: Mobile version doesn't support drag & drop...yet
        </p>

        <div className="email-section">
          <input id="username" type="text" placeholder="Username (optional)" />
          <input id="email" type="email" placeholder="Enter your email" />        
          <button id="savebtn" onClick={handleSave}>Save</button>
        </div>
      {showLeaderboard && (
        <Leaderboard onClose={() => setShowLeaderboard(false)} />
      )}
      {showAbout && (
        <About onClose={() => setShowAbout(false)} />
      )}
      </div>
        <footer className="app-footer">
          <div className="icons">
            <a
              id='github-icon'
              href="https://github.com/vince-tn"
              target="_blank"
              rel="noopener noreferrer"
              className="github-icon"
            >
              <FaGithub size={30}/>
            </a>
            <a
              id='reddit-icon'
              href="https://www.reddit.com/user/vince_tn/"
              target="_blank"
              rel="noopener noreferrer"
              className="reddit-icon"
            >
              <FaReddit size={30}/>
            </a>
            <a
              id='instagram-icon'
              href="https://www.instagram.com/vince_tn/"
              target="_blank"
              rel="noopener noreferrer"
              className="instagram-icon"
            >
              <FaInstagram size={30}/>
            </a>
          </div>
        </footer>
        <div><p className='notgamblingsite'>Not a gambling site.</p></div>

    </div>
  );

}

export default App;

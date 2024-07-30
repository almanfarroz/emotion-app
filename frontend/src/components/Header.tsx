import React, { useState, useEffect } from 'react';
import './Header.css';

interface HeaderProps {
  handleScanClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ handleScanClick }) => {
  const [isModel1, setIsModel1] = useState(true);
  const [quantity, setQuantity] = useState(7);
  const [itemSize, setItemSize] = useState({ width: 170, height: 250 });

  const handleModelChange = () => {
    setIsModel1(!isModel1);
  };

  const updateSliderSettings = () => {
    const width = window.innerWidth;
    if (width <= 767) {
      setQuantity(7);
      setItemSize({ width: 100, height: 150 });
    } else if (width <= 1023) {
      setQuantity(7);
      setItemSize({ width: 160, height: 200 });
    } else {
      setQuantity(7);
      setItemSize({ width: 170, height: 250 });
    }
  };

  useEffect(() => {
    updateSliderSettings();
    window.addEventListener('resize', updateSliderSettings);
    return () => {
      window.removeEventListener('resize', updateSliderSettings);
    };
  }, []);

  return (
    <div className="banner">
      <div className="slider" style={{ '--quantity': quantity, '--item-width': `${itemSize.width}px`, '--item-height': `${itemSize.height}px` } as React.CSSProperties}>
        <div className="item" style={{ '--position': 1 } as React.CSSProperties}><img src="images/disgusted_face.jpg" alt="" /></div>
        <div className="item" style={{ '--position': 2 } as React.CSSProperties}><img src="images/sad_face.jpg" alt="" /></div>
        <div className="item" style={{ '--position': 3 } as React.CSSProperties}><img src="images/happy_face.jpg" alt="" /></div>
        <div className="item" style={{ '--position': 4 } as React.CSSProperties}><img src="images/angry_face.jpg" alt="" /></div>
        <div className="item" style={{ '--position': 5 } as React.CSSProperties}><img src="images/neutral_face.jpg" alt="" /></div>
        <div className="item" style={{ '--position': 6 } as React.CSSProperties}><img src="images/surprised_face.jpg" alt="" /></div>
        <div className="item" style={{ '--position': 7 } as React.CSSProperties}><img src="images/fearful_face.jpg" alt="" /></div>
      </div>
      <div className="content">
        <h1 data-content="EMOTION DETECTION">
          EMOTION DETECTION
        </h1>
        <div className="tagline">
          <h2>Understand Your Emotion</h2>
          <h2>Take Control of Your Well-Being</h2>
        </div>
        <div className="author">
          <h2>Project PK</h2>
          <p><b>D4 Teknik Informatika</b></p>
          <p className="team">
            Alman Farost
            <br />
            Harits Taqiy
            <br />
            Ronaldo Nasanius
            <br />
            Muhammad Ihsan
          </p>
        </div>
        <div className="model" id="model" style={{ backgroundImage: `url(images/${isModel1 ? 'model' : 'model2'}.png)` }}></div>
      </div>
      <button className="btn" id="changeModelBtn" onClick={handleScanClick}>Scan Yours</button>
    </div>
  );
};

export default Header;

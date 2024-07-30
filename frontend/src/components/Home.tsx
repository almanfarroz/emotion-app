import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from './Header';
import Navbar from './Navbar';

const Home: React.FC = () => {
  const [chartUrl, setChartUrl] = useState<string>('');
  const [username, setUsername] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const navigate = useNavigate();

  // Uncomment and use this useEffect to fetch user details if needed
  useEffect(() => {
    const fetchUserDetails = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('http://localhost:8000/users/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          setUsername(response.data.username);
        } catch (error) {
          console.error("Error fetching user details", error);
          navigate('/');
        }
      } else {
        navigate('/');
      }
    };

    fetchUserDetails();
  }, [navigate]);

  const handleScanClick = () => {
    window.location.href = '/scan';
  };

  const handleQAClick = () => {
    window.location.href = '/qa';
  };

  const handleHomeClick = () => {
    window.location.href = '/home';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  useEffect(() => {
    setChartUrl('http://localhost:8000/emotion_chart/');
  }, []);

  const openModal = (emotion: string) => {
    setSelectedEmotion(emotion);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEmotion(null);
  };

  // Modal overlay click handler
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  const emotionData: { [key: string]: { img: string, description: string } } = {
    Angry: { img: 'images/angry_face.jpg', description: 'This emotion involves strong feelings of anger or dissatisfaction towards something or someone.' },
    Disgusted: { img: 'images/disgusted_face.jpg', description: 'This emotion involves feelings of dislike or revulsion towards something perceived as disgusting or unpleasant.' },
    Fearful: { img: 'images/fearful_face.jpg', description: 'This emotion arises when someone feels afraid or anxious about something potentially dangerous or frightening.' },
    Happy: { img: 'images/happy_face.jpg', description: 'A positive emotion that occurs when someone feels joyful, pleased, or satisfied with a situation or event.' },
    Neutral: { img: 'images/neutral_face.jpg', description: 'This emotion reflects calmness or impartiality towards a specific situation or event, without strong positive or negative feelings.' },
    Sad: { img: 'images/sad_face.jpg', description: 'This emotion occurs when someone feels sorrowful, disappointed, or downcast due to disappointing or saddening events.' },
    Surprised: { img: 'images/surprised_face.jpg', description: 'This emotion occurs when someone feels astonished or shocked by unexpected or surprising events.' },
  };

  return (
    <div className="Home">
      <Navbar 
        handleScanClick={handleScanClick}
        handleQAClick={handleQAClick}
        handleHomeClick={handleHomeClick}
        handleLogout={handleLogout}
      />
      <Header 
        handleScanClick={handleScanClick}
      />
      
      <main className="section-bg1 px-4 md:px-8 py-12 text-white">
        <section className="bg-[#fff5] py-12 px-4 md:px-8 rounded-lg text-black md:flex md:items-center md:space-x-8">
          <div className="md:w-1/3 flex justify-center items-center mb-4 md:mb-0">
            <div
              style={{
                maxWidth: '450px',
                maxHeight: '450px',
                width: '100%',
                height: '100%',
              }}
            >
              {chartUrl ? (
                <img
                  src={chartUrl}
                  alt="Emotion Chart"
                  className="rounded-lg"
                  style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '12px', objectFit: 'cover' }}
                />
              ) : (
                <p>Loading chart...</p>
              )}
            </div>
          </div>

          <div className="md:w-2/3">
            <h2 className="text-2xl md:text-3xl font-semibold mb-4">
              The Power of Emotions: Understanding and Managing Your Feelings
            </h2>
            <p>
              Emotions are a powerful force in our lives. They can motivate us,
              inspire us, and connect us to others. But they can also be
              overwhelming and destructive if we don't understand and manage
              them effectively.
            </p>
          </div>
        </section>

        <section className="bg-[#fff5] py-12 px-4 md:px-8 rounded-lg text-black mt-8 md:flex md:items-center md:space-x-8">
          <div className="md:w-1/3 text-left mb-4 md:mb-0">
            <h3 className="text-lg md:text-xl font-semibold">
              What are emotions?
            </h3>
            <p className="mt-4">
              Emotions are complex states of feeling that are often accompanied
              by physiological changes, such as changes in heart rate,
              breathing, and facial expressions. They are influenced by a
              variety of factors, including our thoughts, experiences, and
              environment.
            </p>
          </div>
          <div className="md:w-1/3 text-left mb-4 md:mb-0">
            <h3 className="text-lg md:text-xl font-semibold">
              Why are emotions important?
            </h3>
            <ul className="mt-4 list-disc list-inside">
              <li>
                Make decisions: Emotions can provide us with valuable
                information about our needs and desires.
              </li>
              <li>
                Motivate us to take action: Emotions can give us the drive to
                pursue our goals.
              </li>
              <li>
                Connect with others: Emotions can help us build relationships
                and form bonds with others.
              </li>
              <li>
                Understand the world around us: Emotions can help us to interpret
                the behavior of others and make sense of our experiences.
              </li>
            </ul>
          </div>
          <div className="md:w-1/3 text-left">
            <h3 className="text-lg md:text-xl font-semibold">
              How can we manage our emotions?
            </h3>
            <ul className="mt-4 list-disc list-inside">
              <li>Become aware of your emotions</li>
              <li>Accept your emotions</li>
              <li>Express your emotions in a healthy way</li>
              <li>Learn from your emotions</li>
            </ul>
          </div>
        </section>

        <section className="bg-[#fff5] py-12 px-4 md:px-8 rounded-lg text-black mt-8 flex flex-col md:flex-row justify-around space-y-4 md:space-y-0 md:space-x-4">
          {Object.keys(emotionData).map((emotion) => (
            <div
              key={emotion}
              className="relative bg-gray-200 w-full md:w-1/3 rounded-lg cursor-pointer hover:bg-gray-300 transition-colors"
              onClick={() => openModal(emotion)}
              style={{ borderRadius: '12px', overflow: 'hidden' }}
            >
              <img src={emotionData[emotion].img} alt={emotion} className="w-full h-full object-cover" style={{ borderRadius: '12px', objectFit: 'cover' }} /> {/* Updated styles */}
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <p className="text-white font-bold text-lg">{emotion}</p>
              </div>
            </div>
          ))}
        </section>
      </main>

      <footer className="bg-[#3C3956] text-white py-12 text-center">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li className="hover:text-gray-400 cursor-pointer">Pricing</li>
                <li className="hover:text-gray-400 cursor-pointer">Solutions</li>
                <li className="hover:text-gray-400 cursor-pointer">Education</li>
                <li className="hover:text-gray-400 cursor-pointer">Team plans</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">About us</h4>
              <ul className="space-y-2">
                <li className="hover:text-gray-400 cursor-pointer">About</li>
                <li className="hover:text-gray-400 cursor-pointer">Branding</li>
                <li className="hover:text-gray-400 cursor-pointer">Newsroom</li>
                <li className="hover:text-gray-400 cursor-pointer">Partnerships</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li className="hover:text-gray-400 cursor-pointer">Careers</li>
                <li className="hover:text-gray-400 cursor-pointer">Blog</li>
                <li className="hover:text-gray-400 cursor-pointer">Developers</li>
                <li className="hover:text-gray-400 cursor-pointer">Support</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Social Media</h4>
              <ul className="space-y-2">
                <li className="hover:text-gray-400 cursor-pointer">Instagram</li>
                <li className="hover:text-gray-400 cursor-pointer">Facebook</li>
                <li className="hover:text-gray-400 cursor-pointer">Twitter</li>
                <li className="hover:text-gray-400 cursor-pointer">LinkedIn</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

      {isModalOpen && selectedEmotion && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
          onClick={handleOverlayClick} // Added overlay click handler
        >
          <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-lg mx-auto relative" style={{ borderRadius: '12px' }}>
            <h3 className="text-xl font-semibold mb-4">{selectedEmotion}</h3>
            <img
              src={emotionData[selectedEmotion].img}
              alt={selectedEmotion}
              className="w-full max-w-md mx-auto mb-4"
              style={{ borderRadius: '12px', objectFit: 'cover', width: '100%', height: 'auto' }} // Updated styles
            />
            <p className="mb-4">{emotionData[selectedEmotion].description}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;

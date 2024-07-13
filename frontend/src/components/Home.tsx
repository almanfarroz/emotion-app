import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Home: React.FC = () => {
  const [chartUrl, setChartUrl] = useState<string>('');
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

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
    // Fetch the emotion chart image
    setChartUrl('http://localhost:8000/emotion_chart/');
  }, []);

  return (
    <div className="Home">
      <header
        className="bg-cover bg-center bg-no-repeat py-4 text-white"
        style={{
          backgroundImage: `url(${process.env.PUBLIC_URL}/images/bg.jpeg)`,
          minHeight: '100vh',
        }}
      >
        <nav className="flex flex-col md:flex-row justify-center items-center px-8 w-full text-white py-4 absolute top-0">
        <div className="flex space-x-4">
          <div className="text-lg cursor-pointer" onClick={handleHomeClick}>
            Home
          </div>
          <div className="text-lg cursor-pointer" onClick={handleScanClick}>
            Scan
          </div>
          <div className="text-lg cursor-pointer" onClick={handleQAClick}>
            QA
          </div>
          <div className="text-lg cursor-pointer" onClick={handleLogout}>
                Logout
            </div>
            <div className="text-lg cursor-pointer">
            {username}
            </div>
        </div>
      </nav>
        <div className="flex flex-col items-center justify-center min-h-screen px-4 md:px-0">
          <h1 className="text-3xl md:text-4xl font-bold text-center">
            Understand Your Emotions
          </h1>
          <h2 className="text-xl md:text-2xl mt-4 text-center">
            Take Control of Your Well-being.
          </h2>
          <button
            className="bg-[#3C3956] text-white mt-8 py-3 px-6 rounded"
            onClick={handleScanClick}
          >
            Scan Yours
          </button>
        </div>
      </header>

      <main className="px-4 md:px-8 py-12 bg-[#3C3956] text-white">
        <section className="bg-indigo-200 py-12 px-4 md:px-8 rounded-lg text-black md:flex md:items-center md:space-x-8">
          <div className="md:w-1/3 flex justify-center items-center mb-4 md:mb-0">
            <div
              style={{
                maxWidth: '450px',
                maxHeight: '450px',
                width: '100%',
                height: '100%',
                border: '1px solid #ccc',
              }}
            >
              {chartUrl ? (
                <img
                  src={chartUrl}
                  alt="Emotion Chart"
                  className="rounded-lg"
                  style={{ maxWidth: '100%', maxHeight: '100%' }}
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

        <section className="flex flex-col md:flex-row justify-around space-y-8 md:space-y-0 md:space-x-4 mb-8 py-12">
          <div className="w-full md:w-1/3 text-left">
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
          <div className="w-full md:w-1/3 text-left">
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
          <div className="w-full md:w-1/3 text-left">
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

        <section className="flex flex-col md:flex-row justify-around space-y-4 md:space-y-0 md:space-x-4">
          <div className="bg-purple-300 py-8 px-4 w-full md:w-1/3 rounded-lg">
            <p><strong>Angry</strong></p>
            <p>This emotion involves strong feelings of anger or dissatisfaction towards something or someone.</p>
          </div>
          <div className="bg-purple-300 py-8 px-4 w-full md:w-1/3 rounded-lg">
            <p><strong>Disgusted</strong></p>
            <p>This emotion involves feelings of dislike or revulsion towards something perceived as disgusting or unpleasant.</p>
          </div>
          <div className="bg-purple-300 py-8 px-4 w-full md:w-1/3 rounded-lg">
            <p><strong>Fearful</strong></p>
            <p>This emotion arises when someone feels afraid or anxious about something potentially dangerous or frightening.</p>
          </div>
          <div className="bg-purple-300 py-8 px-4 w-full md:w-1/3 rounded-lg">
            <p><strong>Happy</strong></p>
            <p>A positive emotion that occurs when someone feels joyful, pleased, or satisfied with a situation or event.</p>
          </div>
          <div className="bg-purple-300 py-8 px-4 w-full md:w-1/3 rounded-lg">
            <p><strong>Neutral</strong></p>
            <p>This emotion reflects calmness or impartiality towards a specific situation or event, without strong positive or negative feelings.</p>
          </div>
          <div className="bg-purple-300 py-8 px-4 w-full md:w-1/3 rounded-lg">
            <p><strong>Sad</strong></p>
            <p>This emotion occurs when someone feels sorrowful, disappointed, or downcast due to disappointing or saddening events.</p>
          </div>
          <div className="bg-purple-300 py-8 px-4 w-full md:w-1/3 rounded-lg">
            <p><strong>Surprised</strong></p>
            <p>This emotion occurs when someone feels astonished or shocked by unexpected or surprising events.</p>
          </div>
        </section>

      </main>

      <footer className="bg-white text-black py-12 bg-[#3C3956]">
        <div className="flex flex-col md:flex-row justify-around">
          <div className="mb-8 md:mb-0">
            <h4 className="font-semibold text-center md:text-left">Product</h4>
            <ul className="mt-4 space-y-2 text-center md:text-left">
              <li>Pricing</li>
              <li>Solutions</li>
              <li>Education</li>
              <li>Team plans</li>
            </ul>
          </div>
          <div className="mb-8 md:mb-0">
            <h4 className="font-semibold text-center md:text-left">About us</h4>
            <ul className="mt-4 space-y-2 text-center md:text-left">
              <li>About</li>
              <li>Branding</li>
              <li>Newsroom</li>
              <li>Partnerships</li>
              <li>Affiliates</li>
              <li>Careers</li>
            </ul>
          </div>
          <div className="mb-8 md:mb-0">
            <h4 className="font-semibold text-center md:text-left">Help and support</h4>
            <ul className="mt-4 space-y-2 text-center md:text-left">
              <li>Help center</li>
              <li>Contact us</li>
              <li>Privacy & Terms</li>
              <li>Safety information</li>
              <li>Sitemap</li>
            </ul>
          </div>
          <div className="text-center md:text-left">
            <h4 className="font-semibold">Community</h4>
            <ul className="mt-4 space-y-2 text-center md:text-left">
              <li>Agencies</li>
              <li>Freelancers</li>
              <li>Engineers</li>
            </ul>
          </div>
        </div>
        <div className="flex justify-center md:justify-start mt-8 space-x-4">
          <a href="#" className="text-white">App Store</a>
          <a href="#" className="text-white">Google Play</a>
        </div>
        <div className="text-center mt-8">
          <p>&copy; 2024 Help Privacy Terms</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;

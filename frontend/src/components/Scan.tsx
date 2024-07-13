import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const emotionMessages: { [key: string]: string } = {
    'angry': 'Take a deep breath, anger is not good for health',
    'disgusted': 'What disgusts you, mate?',
    'fearful': 'Stay calm, don\'t be afraid, everything will be fine',
    'happy': 'You look happy today!',
    'neutral': 'You look fine today',
    'sad': 'Don\'t be sad, everything will be fine eventually',
    'surprised': 'Why are you surprised, did you see a ghost?'
};

const Scan: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [emotion, setEmotion] = useState<string>('');
  const [message, setMessage] = useState<string>('');
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

    useEffect(() => {
        const getMedia = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => {
                        videoRef.current?.play();
                    };
                }
            } catch (err) {
                console.error("Error accessing the camera: ", err);
            }
        };
        getMedia();
    }, []);

    const captureFrame = () => {
        if (!canvasRef.current || !videoRef.current) return;

        const context = canvasRef.current.getContext('2d');
        if (context) {
            context.drawImage(videoRef.current, 0, 0, 640, 480);
            canvasRef.current.toBlob(blob => {
                if (!blob) return;

                const formData = new FormData();
                formData.append('file', blob, 'frame.png');
                axios.post('http://localhost:8000/predict/', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                })
                .then(response => {
                    const predictedEmotion = response.data.emotion;
                    setEmotion(predictedEmotion);
                    setMessage(emotionMessages[predictedEmotion]);
                })
                .catch(error => {
                    console.error("Error predicting emotion: ", error);
                });
            });
        }
    };

    useEffect(() => {
        const intervalId = setInterval(captureFrame, 1000); // Capture a frame every second
        return () => clearInterval(intervalId);
    }, []);

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

    const handleSaveEmotion = () => {
        // Check if emotion is one of the predefined emotions
        if (emotion && emotion in emotionMessages) {
            axios.post('http://localhost:8000/predictions/', { prediction: emotion })
                .then(response => {
                    console.log("Prediction saved:", response.data);
                    alert('Terimakasih telah berkontribusi untuk penambahan data statistik');
                })
                .catch(error => {
                    console.error("Error saving prediction:", error);
                });
        } else {
            alert('Turn your face towards the camera');
        }
    };

    return (
      <div
  className="flex flex-col min-h-screen bg-cover bg-center bg-no-repeat text-white"
  style={{
    backgroundImage: `url(${process.env.PUBLIC_URL}/images/bg.jpeg)`,
    backgroundAttachment: "fixed",
  }}
>
  {/* Navbar */}
  <nav className="flex flex-col md:flex-row justify-center items-center px-4 md:px-8 w-full text-white py-4 absolute top-0">
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

  <div className="flex flex-col items-center justify-center flex-grow px-4 mt-16 md:mt-24">
    <div className="bg-[#726E94] rounded-lg p-6 md:p-8 shadow-lg w-full max-w-2xl">
      <h1 className="bg-white text-black p-4 rounded-lg shadow-lg text-3xl font-bold mb-4 text-center">
        Real-Time Emotion Detection
      </h1>
      <div className="flex flex-col items-center">
        <div>
          <video ref={videoRef} width="640" height="480" className="mb-4 rounded-lg"></video>
          <canvas ref={canvasRef} width="640" height="480" className="hidden"></canvas>
          <div className="text-2xl font-semibold">Detected Emotion: {emotion}</div>
          <div className="text-xl font-semibold">{message}</div>
          <div>
            <button
              className="mt-4 bg-[#3C3956] text-white px-4 py-2 rounded-lg shadow"
              onClick={handleSaveEmotion}
            >
              Save Emotion
            </button>
          </div>
        </div>
        <div>
        </div>
      </div>
    </div>
  </div>
</div>
    );
};

export default Scan;

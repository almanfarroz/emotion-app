import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

const emotionMessages: { [key: string]: string } = {
    'Angry': 'Take a deep breath, anger is not good for health',
    'Disgust': 'What disgusts you, mate?',
    'Fear': 'Stay calm, don\'t be afraid, everything will be fine',
    'Happy': 'You look happy today!',
    'Neutral': 'You look fine today',
    'Sad': 'Don\'t be sad, everything will be fine eventually',
    'Surprise': 'Why are you surprised, did you see a ghost?'
};

const Scan: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [emotion, setEmotion] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [userId, setUserId] = useState<number | null>(null);
    const [recommendedSongs, setRecommendedSongs] = useState<any[]>([]);
    const [lastSelectedEmotion, setLastSelectedEmotion] = useState<string>(''); // State to store last selected emotion
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
                    setUserId(response.data.id);
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

    const handleSaveEmotion = async () => {
        if (emotion && emotion in emotionMessages && userId) {
            const token = localStorage.getItem('token');
            try {
                await axios.post('http://localhost:8000/predictions/', { prediction: emotion, user_id: userId }, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                alert('Thank you for contributing to the addition of statistical data.');
                setLastSelectedEmotion(emotion); // Set the last selected emotion here

                // Fetch song recommendations
                const response = await axios.post('http://localhost:8000/recommend', {
                    emotion: emotion,
                    popularity: 50  // Assuming an average popularity value; adjust as needed
                });
                setRecommendedSongs(response.data.recommendations);
            } catch (error) {
                console.error("Error saving prediction:", error);
            }
        } else {
            alert('Turn your face towards the camera');
        }
    };

    return (
        <div className="relative flex flex-col min-h-screen text-white">
            <div
                className="absolute inset-0 bg-cover bg-no-repeat filter blur-sm"
                style={{
                    backgroundImage: `url(${process.env.PUBLIC_URL}/images/bg-scan.png)`,
                    backgroundAttachment: "fixed"
                }}
            ></div>
            <div className="relative flex flex-col min-h-screen">
                <Navbar 
                    handleScanClick={handleScanClick}
                    handleQAClick={handleQAClick}
                    handleHomeClick={handleHomeClick}
                    handleLogout={handleLogout}
                />
                <div className="flex flex-col items-center justify-center flex-grow px-4 mt-16 md:mt-24">
                    <div className="bg-[#fff] rounded-lg p-6 md:p-8 shadow-lg w-full max-w-2xl">
                        <h1 className="bg-white text-black p-4 rounded-lg text-3xl font-bold mb-4 text-center">
                            Real-Time Emotion Detection
                        </h1>
                        <div className="flex flex-col items-center">
                            <div>
                                <video ref={videoRef} width="640" height="480" className="mb-4 rounded-lg"></video>
                                <canvas ref={canvasRef} width="640" height="480" className="hidden"></canvas>
                                {emotion && (
                                    <div className="text-2xl font-semibold text-black">Detected Emotion: {emotion}</div>
                                )}
                                {message && (
                                    <div className="text-xl font-semibold text-black">{message}</div>
                                )}
                                <div className="flex justify-center mt-8">
                                    <button
                                        className="bg-[#3C3956] text-white px-4 py-2 rounded-lg font-semibold text-lg hover:bg-gray-700 mr-4"
                                        onClick={handleSaveEmotion}
                                    >
                                        Save Emotion
                                    </button>
                                    <button
                                        className="bg-[#3C3956] text-white px-4 py-2 rounded-lg font-semibold text-lg hover:bg-gray-700"
                                        onClick={() => {
                                            setEmotion('');
                                            setMessage('');
                                            setRecommendedSongs([]);
                                        }}
                                    >
                                        Reset Emotion
                                    </button>
                                </div>
                                {recommendedSongs.length > 0 && (
                                    <div className="mt-8">
                                        <h2 className="text-2xl font-bold mb-4 text-[#3C3956]">Recommended Songs for {lastSelectedEmotion} Emotion</h2>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {recommendedSongs.map((song, index) => (
                                                <a
                                                    href={song.link_url}
                                                    key={index}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="block bg-[#fff5] border-black border-opacity-30 border-2 p-4 rounded-lg text-center"
                                                >
                                                    <h3 className="text-lg font-bold mb-2 text-[#3C3956]">{song.name}</h3>
                                                    <p className="text-md mb-1 text-[#3C3956]">{song.artist}</p>
                                                    <p className="text-sm mb-1 text-[#3C3956]">{song.album}</p>
                                                    <p className="text-sm mb-1 text-[#3C3956]">{song.release_date}</p>
                                                    {song.cover_url && (
                                                        <img src={song.cover_url} alt={song.name} className="w-full h-auto mt-2 rounded-lg" />
                                                    )}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div><br />
                </div>
            </div>
        </div>
    );
};

export default Scan;

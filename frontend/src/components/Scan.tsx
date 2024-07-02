import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios';

const emotionMessages: { [key: string]: string } = {
    'angry': 'Tarik nafas, marah tidak baik untuk kesehatan',
    'disgusted': 'Apa yang membuatmu jijik kawan',
    'fearful': 'Tenang jangan takut, semua akan baik-baik saja',
    'happy': 'Kamu terlihat senang hari ini!',
    'neutral': 'Kamu terlihat baik-baik saja hari ini',
    'sad': 'Jangan sedih, pada akhirnya semua akan baik-baik saja',
    'surprised': 'Kok kamu kaget, apakah ada hantu?'
};

const Scan: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [emotion, setEmotion] = useState<string>('');
    const [message, setMessage] = useState<string>('');

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

    return (
        <div
            className="flex flex-col h-screen bg-cover bg-center bg-no-repeat py-4 text-white"
            style={{
                backgroundImage: `url(${process.env.PUBLIC_URL}/images/bg.jpeg)`,
                height: "100vh",
            }}>
            {/* Navbar */}
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
                </div>
            </nav>
            <div className="flex flex-col items-center justify-center flex-grow">
                <div className="bg-[#726E94] rounded-lg p-4 shadow-lg">
                    <h1 className="bg-white text-black p-4 rounded-lg shadow-lg text-3xl font-bold mb-4 text-center">
                        Real-Time Emotion Detection
                    </h1>
                    <div className="flex">
                        <div>
                            <video ref={videoRef} width="640" height="480" className="mb-4 rounded-lg"></video>
                            <canvas ref={canvasRef} width="640" height="480" className="hidden"></canvas>
                            <div className="text-2xl font-semibold">Detected Emotion: {emotion}</div>
                            <div className="text-xl font-semibold">{message}</div>
                            <div>
                                <button
                                    className="mt-4 bg-[#3C3956] text-white px-4 py-2 rounded-lg shadow"
                                    onClick={() => {
                                        axios.post('http://localhost:8000/predictions/', { prediction: emotion })
                                            .then(response => {
                                                console.log("Prediction saved:", response.data);
                                            })
                                            .catch(error => {
                                                console.error("Error saving prediction:", error);
                                            });
                                    }}>
                                    Save Emotion
                                </button>
                            </div>
                        </div>
                        <div>
                            {/* Additional UI elements if needed */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Scan;

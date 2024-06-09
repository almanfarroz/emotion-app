import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faInfoCircle, faEnvelope } from '@fortawesome/free-solid-svg-icons';

const Home = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [emotion, setEmotion] = useState('');

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            })
            .catch(err => {
                console.error("Error accessing the camera: ", err);
            });
    }, []);

    const captureFrame = () => {
        const context = canvasRef.current.getContext('2d');
        context.drawImage(videoRef.current, 0, 0, 640, 480);
        canvasRef.current.toBlob(blob => {
            const formData = new FormData();
            formData.append('file', blob, 'frame.png');
            axios.post('http://localhost:8000/predict/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            .then(response => {
                setEmotion(response.data.emotion);
            })
            .catch(error => {
                console.error("Error predicting emotion: ", error);
            });
        });
    };

    useEffect(() => {
        const intervalId = setInterval(captureFrame, 1000); // Capture a frame every second
        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="flex flex-col h-screen">
            {/* Navbar */}
            <nav className="bg-gray-800 p-4">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="text-white font-bold text-lg">Emotion Detection App</div>
                    <div className="flex space-x-4">
                        <a href="#" className="text-white hover:text-gray-300">
                            <FontAwesomeIcon icon={faHome} />
                        </a>
                        <a href="#" className="text-white hover:text-gray-300">
                            <FontAwesomeIcon icon={faInfoCircle} />
                        </a>
                        <a href="#" className="text-white hover:text-gray-300">
                            <FontAwesomeIcon icon={faEnvelope} />
                        </a>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="flex flex-col items-center justify-center flex-grow">
                <h1 className="text-3xl font-bold mb-4">Real-Time Emotion Detection</h1>
                <video ref={videoRef} width="640" height="480" className="mb-4"></video>
                <canvas ref={canvasRef} width="640" height="480" className="hidden"></canvas>
                <div className="text-2xl font-semibold">Detected Emotion: {emotion}</div>
            </div>
        </div>
    );
};

export default Home;

import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios';

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
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <h1 className="text-3xl font-bold mb-4">Real-Time Emotion Detection</h1>
            <video ref={videoRef} width="640" height="480" className="mb-4"></video>
            <canvas ref={canvasRef} width="640" height="480" className="hidden"></canvas>
            <div className="text-2xl font-semibold">Detected Emotion: {emotion}</div>
        </div>
    );
};

export default Home;

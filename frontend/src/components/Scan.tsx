// Scan.tsx
import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faInfoCircle, faEnvelope } from '@fortawesome/free-solid-svg-icons';

const Scan: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [emotion, setEmotion] = useState<string>('');

    useEffect(() => {
        const getMedia = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    // Wait for the video metadata to load, then play the video
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
                    setEmotion(response.data.emotion);
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

    return (
        <div
      className="flex flex-col h-screen bg-cover bg-center bg-no-repeat py-4 text-white"
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL}/images/bg.jpeg)`,
        height: "100vh",
      }}>
      {/* Main Content */}
      <div className="flex flex-col items-center justify-center flex-grow">
      <div className="bg-[#726E94] rounded-lg p-4 shadow-lg">
        <h1 className="bg-white text-black p-4 rounded-lg shadow-lg text-3xl font-bold mb-4 text-center">Real-Time Emotion Detection</h1>
          <video ref={videoRef} width="640" height="480" className="mb-4 rounded-lg"></video>
          <canvas ref={canvasRef} width="640" height="480" className="hidden"></canvas>
          <div className="text-2xl font-semibold">Detected Emotion: {emotion}</div>
        </div>
      </div>
    </div>
    );
};

export default Scan;

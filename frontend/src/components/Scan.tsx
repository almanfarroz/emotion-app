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

    const handleSaveEmotion = () => {
        if (emotion && emotion in emotionMessages && userId) {
            const token = localStorage.getItem('token');
            axios.post('http://localhost:8000/predictions/', { prediction: emotion, user_id: userId }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(response => {
                console.log("Prediction saved:", response.data);
                alert('Thank you for contributing to the addition of statistical data.');
                setLastSelectedEmotion(emotion); // Set the last selected emotion here
                recommendSongs(emotion);
            })
            .catch(error => {
                console.error("Error saving prediction:", error);
            });
        } else {
            alert('Turn your face towards the camera');
        }
    };

    const recommendSongs = (emotion: string) => {
        const songData = [
            { Name: "Levitating (feat. DaBaby)", Album: "Future Nostalgia", Artist: "Dua Lipa", "Release Date": "2020-03-27", Emotion: "happy", Stream: "https://open.spotify.com/track/5nujrmhLynf4yMoMtj8AQF?si=bacadd2fbd424d1e" },
            { Name: "Nobody Gets Me", Album: "SOS", Artist: "SZA", "Release Date": "2022-12-09", Emotion: "neutral", Stream: "https://open.spotify.com/track/5Y35SjAfXjjG0sFQ3KOxmm?si=05f24b4cc1744c1a" },
            { Name: "End of Beginning", Album: "DECIDE", Artist: "Djo", "Release Date": "2022-09-16", Emotion: "neutral", Stream: "https://open.spotify.com/track/3qhlB30KknSejmIvZZLjOD?si=1ac46e802d194797" },
            { Name: "Love Me Like There's No Tomorrow - Special Edition", Album: "Mr Bad Guy (Special Edition)", Artist: "Freddie Mercury", "Release Date": "2019-10-10", Emotion: "neutral", Stream: "https://open.spotify.com/track/0otmxJEwq9JI1CidrcYEq4?si=368bcbd6e94349bd" },
            { Name: "Too Sweet", Album: "Unreal Unearth: Unheard", Artist: "Hozier", "Release Date": "2024-03-22", Emotion: "happy", Stream: "https://open.spotify.com/track/5Z0UnEtpLDQyYlWwgi8m9C?si=9f22a84fc50942b5" },
            { Name: "Don't Stop Believin' (2022 Remaster)", Album: "Escape (2022 Remaster)", Artist: "Journey", "Release Date": "1981-07-17", Emotion: "sad", Stream: "https://open.spotify.com/track/5RKQ5NdjSh2QzD4MaunT91?si=6aabd0837c1f4ab4" },
            { Name: "Shake It Off", Album: "1989 (Deluxe)", Artist: "Taylor Swift", "Release Date": "2014-01-01", Emotion: "happy", Stream: "https://open.spotify.com/track/0cqRj7pUJDkTCEsJkx8snD?si=e96888d765474bbc" },
            { Name: "I See Love - From Hotel Transylvania 3", Album: "I See Love (From Hotel Transylvania 3)", Artist: "Jonas Blue", "Release Date": "2018-06-29", Emotion: "happy", Stream: "https://open.spotify.com/track/32UJH1F38AMSjZilQyBzOE?si=ace556dab0e54793" },
            { Name: "Take Me Home, Country Roads - Original Version", Album: "Poems, Prayers and Promises", Artist: "John Denver", "Release Date": "1971-04-12", Emotion: "angry", Stream: "https://open.spotify.com/track/1YYhDizHx7PnDhAhko6cDS?si=e3012ce622b74839" },
            { Name: "AMAZING", Album: "AMAZING", Artist: "Rex Orange County", "Release Date": "2022-02-14", Emotion: "neutral", Stream: "https://open.spotify.com/track/6FtIK0IkmG33lKbc1pyAlZ?si=7e12e7d1fa974c48" },
            { Name: "I'd Love You to Want Me", Album: "Of A Simple Man", Artist: "Lobo", "Release Date": "1972-09-01", Emotion: "neutral", Stream: "https://open.spotify.com/track/71CXzHYYOyNqgtVFpNdeCS?si=88696591dae94fd6" },
            { Name: "Stick Season", Album: "Stick Season", Artist: "Noah Kahan", "Release Date": "2022-10-14", Emotion: "neutral", Stream: "https://open.spotify.com/track/0mflMxspEfB0VbI1kyLiAv?si=5b1664443bf2472a" },
            { Name: "Without You", Album: "The Earth Is...", Artist: "Air Supply", "Release Date": "1991-07-19", Emotion: "neutral", Stream: "https://open.spotify.com/track/0aW5JH6RnfTv5cGvPS3cca?si=a0dbb32618634d9d" },
            { Name: "You're Gonna Live Forever in Me", Album: "The Search for Everything", Artist: "John Mayer", "Release Date": "2017-04-14", Emotion: "disgusted", Stream: "https://open.spotify.com/track/51lPx6ZCSalL2kvSrDUyJc?si=dc1db15a30d64e56" },
            { Name: "American Pie", Album: "American Pie", Artist: "Don McLean", "Release Date": "1971-10-24", Emotion: "happy", Stream: "https://open.spotify.com/track/1fDsrQ23eTAVFElUMaf38X?si=dc584eea4add4ed1" },
            { Name: "Heal the World", Album: "Dangerous", Artist: "Michael Jackson", "Release Date": "1991-11-13", Emotion: "angry", Stream: "https://open.spotify.com/track/7woW97CfcWaKtuC6W5BP2K?si=9210c4216883479f" },
            { Name: "You Are Not Alone", Album: "HIStory - PAST, PRESENT AND FUTURE - BOOK I", Artist: "Michael Jackson", "Release Date": "1995-06-16", Emotion: "sad", Stream: "https://open.spotify.com/track/3AoeaZs8dFemFJr3JdzOL0?si=b5bd854f18664868" },
            { Name: "Love Never Felt So Good (Original Version)", Album: "XSCAPE", Artist: "Michael Jackson", "Release Date": "2014-05-09", Emotion: "happy", Stream: "https://open.spotify.com/track/7DciyLZWipMv860LBeupmK?si=4f3e34f039394f58" },
            { Name: "High Hopes", Album: "Pray for the Wicked", Artist: "Panic! At The Disco", "Release Date": "2018-06-22", Emotion: "happy", Stream: "https://open.spotify.com/track/1rqqCSm0Qe4I9rUvWncaom?si=a8b7bcd469f74f11" },
            { Name: "Over the Rainbow", Album: "Alone In Iz World", Artist: "Israel Kamakawiwo'ole", "Release Date": "2001-09-25", Emotion: "angry", Stream: "https://open.spotify.com/track/3oQomOPRNQ5NVFUmLJHbAV?si=f34143eb725f442a" },
            { Name: "Don't Stop Me Now - Remastered 2011", Album: "Jazz (2011 Remaster)", Artist: "Queen", "Release Date": "1978-11-10", Emotion: "happy", Stream: "https://open.spotify.com/track/5T8EDUDqKcs6OSOwEsfqG7?si=1294fa5b85e948f1" },
            { Name: "Ob-La-Di, Ob-La-Da - Remastered 2009", Album: "The Beatles (Remastered)", Artist: "The Beatles", "Release Date": "1968-11-22", Emotion: "sad", Stream: "https://open.spotify.com/track/1gFNm7cXfG1vSMcxPpSxec?si=f7fb69257a114ce5" },
            { Name: "I Ain't Worried", Album: "I Ain't Worried (Music From The Motion Picture 'Top Gun: Maverick')", Artist: "OneRepublic", "Release Date": "2022-05-13", Emotion: "fearful", Stream: "https://open.spotify.com/track/4h9wh7iOZ0GGn8QVp4RAOB?si=02316a36e68f4803" },
            { Name: "Hey Jude", Album: "Love", Artist: "The Beatles", "Release Date": "2006-11-17", Emotion: "sad", Stream: "https://open.spotify.com/track/1eT2CjXwFXNx6oY5ydvzKU?si=a6587c01c0ee4922" },
            { Name: "December", Album: "Life's Not Out To Get You", Artist: "Neck Deep", "Release Date": "2015-08-14", Emotion: "neutral", Stream: "https://open.spotify.com/track/4oVdhvxZrKQTM9ZsUIZa3S?si=75b32c543d7a4fe5" },
            { Name: "Cupid - Twin Ver.", Album: "The Beginning: Cupid", Artist: "FIFTY FIFTY", "Release Date": "2023-02-24", Emotion: "happy", Stream: "https://open.spotify.com/track/7FbrGaHYVDmfr7KoLIZnQ7?si=5fd2c1555df74b36" },
            { Name: "Lemon Tree", Album: "Dish of the Day", Artist: "Fools Garden", "Release Date": "1995-01-01", Emotion: "neutral", Stream: "https://open.spotify.com/track/2epbL7s3RFV81K5UhTgZje?si=438f25d38d244c78" },
            { Name: "Still into You", Album: "Paramore", Artist: "Paramore", "Release Date": "2013-04-05", Emotion: "happy", Stream: "https://open.spotify.com/track/1yjY7rpaAQvKwpdUliHx0d?si=7f39aafeeda84506" },
            { Name: "Let It Be - Remastered 2009", Album: "Let It Be (Remastered)", Artist: "The Beatles", "Release Date": "1970-05-08", Emotion: "angry", Stream: "https://open.spotify.com/track/7iN1s7xHE4ifF5povM6A48?si=bcda9f5d49904576" },
            { Name: "Move On", Album: "Move On", Artist: "Mike Posner", "Release Date": "2019-01-04", Emotion: "sad", Stream: "https://open.spotify.com/track/3KTVQGLS2np8dWe5s4F9EN?si=5daf473a80e94b8d" },
            { Name: "Be Alright", Album: "Be Alright", Artist: "Dean Lewis", "Release Date": "2018-06-29", Emotion: "sad", Stream: "https://open.spotify.com/track/3EPXxR3ImUwfayaurPi3cm?si=d718730394034ccc" },
            { Name: "Here Comes The Sun - Remastered 2009", Album: "Abbey Road (Remastered)", Artist: "The Beatles", "Release Date": "1969-09-26", Emotion: "sad", Stream: "https://open.spotify.com/track/6dGnYIeXmHdcikdzNNDMm2?si=b4ad0396dabc496a" },
            { Name: "Fix You", Album: "X&Y", Artist: "Coldplay", "Release Date": "2005-06-07", Emotion: "sad", Stream: "https://open.spotify.com/track/7LVHVU3tWfcxj5aiPFEW4Q?si=4534989579c64b9d" },
            { Name: "Count on Me", Album: "Doo-Wops & Hooligans", Artist: "Bruno Mars", "Release Date": "2010-05-11", Emotion: "sad", Stream: "https://open.spotify.com/track/7l1qvxWjxcKpB9PCtBuTbU?si=2552927ae7f34eab" },
            { Name: "Carry On", Album: "Some Nights", Artist: "fun.", "Release Date": "2012-02-14", Emotion: "sad", Stream: "https://open.spotify.com/track/7l1qvxWjxcKpB9PCtBuTbU?si=7fc829c7c0f44dd8" },
            { Name: "Imagine - Remastered 2010", Album: "Imagine", Artist: "John Lennon", "Release Date": "1971-09-09", Emotion: "angry", Stream: "https://open.spotify.com/track/7pKfPomDEeI4TPT6EOYjn9?si=9fe179cfa68d41cb" },
            { Name: "Don't Panic", Album: "Parachutes", Artist: "Coldplay", "Release Date": "2000-07-10", Emotion: "fearful", Stream: "https://open.spotify.com/track/2QhURnm7mQDxBb5jWkbDug?si=e6ff5e032fb94d51" },
            { Name: "Let It Go", Album: "Chaos And The Calm", Artist: "James Bay", "Release Date": "2015-03-20", Emotion: "angry", Stream: "https://open.spotify.com/track/3nnG7AM9QopHVPEuLX3Khk?si=c0e744cd71944675" },
            { Name: "What A Wonderful World", Album: "What A Wonderful World", Artist: "Louis Armstrong", "Release Date": "1968-01-01", Emotion: "angry", Stream: "https://open.spotify.com/track/29U7stRjqHU6rMiS8BfaI9?si=76120160563042bb" },
            { Name: "Don't Look Back in Anger", Album: "Stop The Clocks", Artist: "Oasis", "Release Date": "2006-11-13", Emotion: "angry", Stream: "https://open.spotify.com/track/6qZoQsBTQW2tix6KViDC7F?si=26f7a03bfa8b4c4f" },
            { Name: "Open Arms (feat. Travis Scott)", Album: "SOS", Artist: "SZA", "Release Date": "2022-12-08", Emotion: "angry", Stream: "https://open.spotify.com/track/6koKhrBBcExADvWuOgceNZ?si=781a974abfda4bb8" },
            { Name: "death bed (coffee for your head)", Album: "death bed (coffee for your head)", Artist: "Powfu", "Release Date": "2020-02-08", Emotion: "angry", Stream: "https://open.spotify.com/track/7eJMfftS33KTjuF7lTsMCx?si=bf8f6674848b41e1" },
            { Name: "Turn Up the Music", Album: "Fortune (Expanded Edition)", Artist: "Chris Brown", "Release Date": "2012-07-03", Emotion: "fearful", Stream: "https://open.spotify.com/track/1RMRkCn07y2xtBip9DzwmC?si=429f66120c344967" },
            { Name: "Believer", Album: "Evolve", Artist: "Imagine Dragons", "Release Date": "2017-06-23", Emotion: "fearful", Stream: "https://open.spotify.com/track/0pqnGHJpmpxLKifKRmU6WP?si=d27d25c507ea44cc" },
            { Name: "The Phoenix", Album: "Save Rock And Roll", Artist: "Fall Out Boy", "Release Date": "2013-04-12", Emotion: "fearful", Stream: "https://open.spotify.com/track/7jwDuO7UZvWs77KNj9HbvF?si=b34f3b6dbfce4746" },
            { Name: "Hall of Fame", Album: "#3 Deluxe Version", Artist: "The Script", "Release Date": "2012-09-10", Emotion: "fearful", Stream: "https://open.spotify.com/track/0FB5ILDICqwK6xj7W1RP9u?si=b949a7ac71fb4393" },
            { Name: "Renegades", Album: "Renegades", Artist: "ONE OK ROCK", "Release Date": "2021-04-16", Emotion: "fearful", Stream: "https://open.spotify.com/track/29VVYrV5TVpGu0IfoTXlcw?si=6b9d6ed9208f4c89" },
            { Name: "E.T.", Album: "Teenage Dream", Artist: "Katy Perry", "Release Date": "2010-08-24", Emotion: "fearful", Stream: "https://open.spotify.com/track/50r1EUDpmSZRPo5aIZpmWi?si=ab3778a9b4824ffb" },
            { Name: "Pump It", Album: "Monkey Business", Artist: "Black Eyed Peas", "Release Date": "2005-01-01", Emotion: "fearful", Stream: "https://open.spotify.com/track/2ygMBIctKIAfbEBcT9065L?si=627cb2a69d5d484c" },
            { Name: "Calm Down (with Selena Gomez)", Album: "Calm Down (with Selena Gomez)", Artist: "Rema", "Release Date": "2022-08-25", Emotion: "disgusted", Stream: "https://open.spotify.com/track/0WtM2NBVQNNJLh6scP13H8?si=d3b823776ef54a76" },
            { Name: "My Love Mine All Mine", Album: "The Land Is Inhospitable and So Are We", Artist: "Mitski", "Release Date": "2023-09-15", Emotion: "surprised", Stream: "https://open.spotify.com/track/3vkCueOmm7xQDoJ17W1Pm3?si=7688d2d3d98943bb" },
            { Name: "Melting", Album: "Por Vida", Artist: "Kali Uchis", "Release Date": "2015-02-04", Emotion: "surprised", Stream: "https://open.spotify.com/track/2kSb3wYSOV996xA2NSmpck?si=a4996d2ee28440f4" },
            { Name: "Slipping Through My Fingers", Album: "The Visitors (Deluxe Edition)", Artist: "ABBA", "Release Date": "1981-04-21", Emotion: "surprised", Stream: "https://open.spotify.com/track/6TvxPS4fj4LUdjw2es4g21?si=3b252af84a344745" },
            { Name: "Apocalypse", Album: "Cigarettes After Sex", Artist: "Cigarettes After Sex", "Release Date": "2017-06-09", Emotion: "surprised", Stream: "https://open.spotify.com/track/3AVrVz5rK8Hrqo9YGiVGN5?si=fc591ace3a1643d3" },
            { Name: "Pluto Projector", Album: "Pony", Artist: "Rex Orange County", "Release Date": "2019-10-25", Emotion: "surprised", Stream: "https://open.spotify.com/track/4EWBhKf1fOFnyMtUzACXEc?si=2670b28f77fc4506" },
            { Name: "I Love You So", Album: "I Love You So", Artist: "The Walters", "Release Date": "2014-11-28", Emotion: "surprised", Stream: "https://open.spotify.com/track/4SqWKzw0CbA05TGszDgMlc?si=bdd4546b66544134" },
            { Name: "love nwantiti (ah ah ah)", Album: "CKay The First", Artist: "CKay", "Release Date": "2019-08-30", Emotion: "surprised", Stream: "https://open.spotify.com/track/2Xr1dTzJee307rmrkt8c0g?si=15ac7950ea804189" },
            { Name: "Yellow", Album: "Parachutes", Artist: "Coldplay", "Release Date": "2000-07-10", Emotion: "surprised", Stream: "https://open.spotify.com/track/3AJwUDP919kvQ9QcozQPxg?si=e96fb42b37b14b47" },
            { Name: "Always", Album: "NEVER ENOUGH", Artist: "Daniel Caesar", "Release Date": "2023-04-07", Emotion: "surprised", Stream: "https://open.spotify.com/track/2LlOeW5rVcvl3QcPNPcDus?si=e7d8010e54c94bc8" },
            { Name: "Perfect", Album: "� (Deluxe)", Artist: "Ed Sheeran", "Release Date": "2017-03-03", Emotion: "surprised", Stream: "https://open.spotify.com/track/0tgVpDi06FyKpA1z0VMD4v?si=d2d39d8390344bda" },
            { Name: "I Don't Care (with Justin Bieber)", Album: "I Don't Care (with Justin Bieber)", Artist: "Ed Sheeran", "Release Date": "2019-05-10", Emotion: "disgusted", Stream: "https://open.spotify.com/track/3HVWdVOQ0ZA45FuZGSfvns?si=167df504e42949fd" },
            { Name: "Don't Care", Album: "1999", Artist: "Rich Brian", "Release Date": "2020-08-25", Emotion: "disgusted", Stream: "https://open.spotify.com/track/5716oW4TPVKyMrzzQCDelK?si=4642b4e699254cce" },
            { Name: "IDGAF", Album: "Dua Lipa (Deluxe)", Artist: "Dua Lipa", "Release Date": "2017-06-02", Emotion: "disgusted", Stream: "https://open.spotify.com/track/76cy1WJvNGJTj78UqeA5zr?si=bb43dedbd73247a4" },
            { Name: "Judas", Album: "Born This Way", Artist: "Lady Gaga", "Release Date": "2011-01-01", Emotion: "fearful", Stream: "https://open.spotify.com/track/0QkWikH5Z3U0f79T9iuF6c?si=a241479a07bd4d88" },
            { Name: "Bad Romance", Album: "ReAniMate: The CoVeRs eP", Artist: "Halestorm", "Release Date": "2011-03-22", Emotion: "neutral", Stream: "https://open.spotify.com/track/0n3sHHfdOq6Awix3JPe3xl?si=f41a002ba1c4407a" },
            { Name: "Midsummer Madness", Album: "Midsummer Madness", Artist: "88rising", "Release Date": "2018-06-07", Emotion: "disgusted", Stream: "https://open.spotify.com/track/0wFmawqundY8rOn9sZUqA6?si=321223edb09d4912" },
            { Name: "Peach Jam", Album: "Head In The Clouds", Artist: "88rising", "Release Date": "2018-07-20", Emotion: "disgusted", Stream: "https://open.spotify.com/track/6dktyiCWz2JYGmcPQ5D5dY?si=61d5e95f7693414f" },
            { Name: "Earth", Album: "Earth", Artist: "Lil Dicky", "Release Date": "2019-04-18", Emotion: "disgusted", Stream: "https://open.spotify.com/track/2S1LebN6AXXQqJolBxlWgO?si=c5c6d1d0993343b1" },
            { Name: "A Whole New World (End Title) - From Aladdin", Album: "A Whole New World (End Title) [From Aladdin]", Artist: "ZAYN", "Release Date": "2019-05-09", Emotion: "disgusted", Stream: "https://open.spotify.com/track/1iWHabUgUuuKLBa0TzTHfk?si=8b770da3e7ef4ed5" },
            { Name: "sharing", Album: "Blue For You", Artist: "blue for you", "Release Date": "2019-03-22", Emotion: "disgusted", Stream: "https://open.spotify.com/track/3lFGbTCTFEQxuLrFYVQoju?si=929941012abb486d" }
        ];

        const filteredSongs = songData.filter(song => song.Emotion === emotion.toLowerCase());
        console.log(`Recommended songs for ${emotion}:`, filteredSongs);
        setRecommendedSongs(filteredSongs);
    };

    return (
        <div
            className="flex flex-col min-h-screen bg-cover bg-center bg-no-repeat text-white"
            style={{
                backgroundImage: `url(${process.env.PUBLIC_URL}/images/bg.jpeg)`,
                backgroundAttachment: "fixed",
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
            <div className="flex flex-col items-center justify-center flex-grow px-4 mt-16 md:mt-24">
                <div className="bg-[#726E94] rounded-lg p-6 md:p-8 shadow-lg w-full max-w-2xl">
                    <h1 className="bg-white text-black p-4 rounded-lg shadow-lg text-3xl font-bold mb-4 text-center">
                        Real-Time Emotion Detection
                    </h1>
                    <div className="flex flex-col items-center">
                        <div>
                            <video ref={videoRef} width="640" height="480" className="mb-4 rounded-lg"></video>
                            <canvas ref={canvasRef} width="640" height="480" className="hidden"></canvas>
                            {emotion && (
                                <div className="text-2xl font-semibold">Detected Emotion: {emotion}</div>
                            )}
                            {message && (
                                <div className="text-xl font-semibold">{message}</div>
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
                                <div className="mt-4 w-full">
                                    <h2 className="text-2xl font-bold mb-2">Recommended Songs for {lastSelectedEmotion} Emotion</h2>
                                    <div className="overflow-x-auto">
                                        <table className="w-full table-auto border-collapse border border-[#3C3956]">
                                            <thead className="bg-[#3C3956] text-white">
                                                <tr>
                                                    <th className="border border-[#3C3956] p-2">Name</th>
                                                    {/* <th className="border border-[#3C3956] p-2">Album</th> */}
                                                    <th className="border border-[#3C3956] p-2">Artist</th>
                                                    {/* <th className="border border-[#3C3956] p-2">Release Date</th> */}
                                                    <th className="border border-[#3C3956] p-2">Stream on Spotify</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {recommendedSongs.map((song, index) => (
                                                    <tr key={index}>
                                                        <td className="border border-[#3C3956] p-2">{song.Name}</td>
                                                        {/* <td className="border border-[#3C3956] p-2">{song.Album}</td> */}
                                                        <td className="border border-[#3C3956] p-2">{song.Artist}</td>
                                                        {/* <td className="border border-[#3C3956] p-2">{song['Release Date']}</td> */}
                                                        <td className="border border-[#3C3956] p-2">
                                                        <a
                                                            href={song.Stream}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-500 underline"
                                                        >
                                                            Listen
                                                        </a>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Scan;

import pandas as pd
import numpy as np
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import OneHotEncoder, StandardScaler
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
from pydantic import BaseModel

# Load the dataset
file_path = 'data/data_lagu_baru.csv'
data = pd.read_csv(file_path)

# Preprocess the Data
data_cleaned = data.dropna()
encoder = OneHotEncoder(categories=[['Angry', 'Disgust', 'Fear', 'Happy', 'Neutral', 'Sad', 'Surprise']])
emotion_encoded = encoder.fit_transform(data_cleaned[['Emotion']]).toarray()
scaler = StandardScaler()
popularity_scaled = scaler.fit_transform(data_cleaned[['Popularity']])
features = np.hstack([emotion_encoded, popularity_scaled])
target = data_cleaned[['Name', 'Artist', 'Album', 'Release Date']].values

# Train the Nearest Neighbors model
model = NearestNeighbors(n_neighbors=6)
model.fit(features)

# Set up Spotify API credentials
sp = spotipy.Spotify(auth_manager=SpotifyClientCredentials(
    client_id='ce0abf674e2748cab17e27c590cde4e5', 
    client_secret='cd56dc3ae283425f9f5368a1ee261bee'))

class RecommendationRequest(BaseModel):
    emotion: str
    popularity: float

# Function to get song recommendations
def get_recommendations(emotion, popularity, model=model, encoder=encoder, scaler=scaler):
    emotion_encoded = encoder.transform([[emotion]]).toarray()
    popularity_scaled = scaler.transform([[popularity]])
    input_features = np.hstack([emotion_encoded, popularity_scaled])
    distances, indices = model.kneighbors(input_features)
    recommendations = target[indices[0]]
    return recommendations

# Function to fetch cover art from Spotify
def fetch_spotify_cover(song_name, artist_name):
    query = f"track:{song_name} artist:{artist_name}"
    results = sp.search(q=query, limit=1)
    if results['tracks']['items']:
        track = results['tracks']['items'][0]
        cover_url = results['tracks']['items'][0]['album']['images'][0]['url']
        track_url = track['external_urls']['spotify']
        return cover_url, track_url
    return None, None
import sys
import json
import librosa
import torch
from transformers import pipeline

def transcribe_audio(audio_path):
    try:
        # Load the audio file
        audio, sr = librosa.load(audio_path, sr=16000)
        
        # Initialize the transcription pipeline
        transcriber = pipeline("automatic-speech-recognition", model="openai/whisper-base")
        
        # Transcribe the audio
        result = transcriber(audio)
        
        # Extract the transcription text
        transcription = result["text"]
        
        # Generate a simple summary
        summary = {
            "overview": "This lecture covers " + transcription[:100] + "...",
            "keyPoints": [
                "Key point 1: " + transcription[:50],
                "Key point 2: " + transcription[50:100],
                "Key point 3: " + transcription[100:150]
            ],
            "detailedExplanation": transcription
        }
        
        # Return the results as JSON
        output = {
            "transcription": transcription,
            "summary": summary
        }
        
        print(json.dumps(output))
        return 0
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        return 1

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Please provide the audio file path"}))
        sys.exit(1)
        
    audio_path = sys.argv[1]
    sys.exit(transcribe_audio(audio_path)) 
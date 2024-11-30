import speech_recognition as sr
import os
from gtts import gTTS
from chat import load_pairs, find_response

pairs = load_pairs('pairs.txt')

# Initialize the recognizer
recognizer = sr.Recognizer()

# Specify the path to the audio file
audio_file = "Voice.wav"

# Open the audio file and recognize the speech
with sr.AudioFile(audio_file) as source:
    recognizer.adjust_for_ambient_noise(source, duration=0.5)  # Adjust for ambient noise
    audio_data = recognizer.record(source)

# Use Google's speech recognition to transcribe the audio
try:
    text = recognizer.recognize_google(audio_data)
    print("Transcription: " + text)
    
    # Save the transcribed text to a file
    with open("messages.txt", 'w') as text_file:
        text_file.write(text)

except sr.UnknownValueError:
    print("Google Speech Recognition could not understand the audio")
    text = None
except sr.RequestError as e:
    print(f"Could not request results from Google Speech Recognition service; {e}")
    text = None

if text and os.path.isfile("messages.txt"):
    with open("messages.txt", "r") as file:
        read_file = file.readlines()
        if read_file:
            user_input = read_file[0].strip()
            print(f"User input: {user_input}")
            response = find_response(user_input, pairs)
            print(f"Response: {response}")

            # Check if a valid response was found
            if response:
                try:
                    # Convert the response to speech
                    tts = gTTS(response)
                    tts.save("response.wav")
                    print("Response saved as response.wav")
                except Exception as e:
                    print(f"Error converting response to speech: {e}")
            else:
                print("No valid response found.")
        else:
            print("Output file is empty.")
else:
    print("No transcription available or messages file does not exist.")
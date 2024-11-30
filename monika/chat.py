import random
import speech_recognition as sr
import pyttsx3
import webbrowser
import time

# Initialize recognizer and text-to-speech engine
listener = sr.Recognizer()
engine = pyttsx3.init()
voices = engine.getProperty('voices')
engine.setProperty('voice', voices[1].id)
engine.setProperty('volume', 1.0)  # Set volume to maximum
engine.setProperty('rate', 196)    # Set speaking rate

chat = False
chatTime = 0

def talk(text):
    """Make the text-to-speech engine speak the given text."""
    engine.say(text)
    engine.runAndWait()

def take_command():
    """Listen for a command and return it as a lowercase string."""
    
    try:
        with sr.Microphone() as source:
            if chatTime >= 1:
                talk('listening...')
            print('listening...')
            listener.adjust_for_ambient_noise(source, duration=1)  # Adjust for ambient noise
            listener.pause_threshold = 0.8  # Pause threshold to help detect end of speech
            voice = listener.listen(source, timeout=5, phrase_time_limit=5)
            command = listener.recognize_google(voice).lower()
            return command
    except sr.RequestError as e:
        print(f"Could not request results; {e}")
    except Exception as e:
        print(f"An error occurred: {e}")
    return ""

def load_pairs(filename):
    """Load question-response pairs from a file."""
    pairs = []
    try:
        with open(filename, 'r', encoding='utf-8') as file:
            lines = [line.strip() for line in file.readlines()]
            if len(lines) % 2 != 0:
                raise ValueError("The file should contain an even number of lines.")
            pairs = [(lines[i], lines[i + 1]) for i in range(0, len(lines), 2)]
    except FileNotFoundError:
        talk(f"Error: The file '{filename}' was not found.")
    except ValueError as e:
        talk(f"Error: {e}")
    return pairs

def find_response(question, pairs):
    """Find a response to the given question from the loaded pairs."""
    responses = [a for q, a in pairs if q.lower() == question.lower()]
    return random.choice(responses) if responses else ""

def run_bot(command):
    """Run the bot to process specific commands."""
    if command.startswith('play music'):
        song = command.replace('play music', '').strip()
        webbrowser.open(f"https://open.spotify.com/search/{song}")

def off(command):
    global chatTime
    """Turn off the bot if a shutdown command is recognized."""
    if any(phrase in command for phrase in ["stop", "shut off", "shut down", "shut up", "quit"]):
        talk("Turning off")
        chatTime = 0

def main():
    global chat
    global chatTime
    """Main function to run the chatbot."""
    filename = 'pairs.txt'
    pairs = load_pairs(filename)

    if not pairs:
        talk("Chatbot cannot start without a valid pairs file.")
        return

    while True:
        command = take_command()

        if command.startswith('alice'):
            chat = True
            chatTime = 5

        if command and chat == True:
            off(command)  # Turn off command should be checked first
            run_bot(command)
            response = find_response(command, pairs)
            talk(response)
            print(response)
        
        if chat == True and chatTime >= 1:
            chatTime = chatTime - 1
            if chatTime == 0:
                talk("no more words")
                chat = False

if __name__ == "__main__":
    main()

import speech_recognition as sr
import webbrowser
import pyttsx3
import os
import musicLibrary
import subprocess
import platform
import requests  # Add this import to send requests to your backend API

recognizer = sr.Recognizer()
engine = pyttsx3.init()

def get_engine():
    global engine
    if engine is None:
        engine = pyttsx3.init()
    return engine

def speak(text):
    engine = get_engine()
    engine.say(text)
    engine.runAndWait()

def get_desktop_path():
    user = os.environ["USERPROFILE"]
    one_drive = os.path.join(user, "OneDrive")
    if os.path.exists(one_drive):
        return os.path.join(one_drive, "Desktop")
    return os.path.join(user, "Desktop")

def open_item(path):
    if os.path.isdir(path):  # Open folder
        open_folder(path)
    elif os.path.isfile(path):  # Open file
        try:
            system_name = platform.system()
            if system_name == "Windows":
                os.startfile(path)  # for windows default opener
            elif system_name == "Darwin":  # for macOS
                subprocess.Popen(["open", path])
            elif system_name == "Linux":  # for linux
                subprocess.Popen(["xdg-open", path])
            else:
                speak("Can not support this Operating System.")
                return
            speak(f"Opening {os.path.basename(path)}")
        except Exception as e:
            print(f"Error in opening file: {e}")
            speak("Unable to open this file.")
    else:
        speak("Sorry! This specified item does not exist.")

def open_folder(folder_name):
    desktop_path = get_desktop_path()
    folder_path = os.path.join(desktop_path, folder_name)
    print(f"Checking path: {folder_path}")

    if os.path.exists(folder_path):
        try:
            system_name = platform.system()

            if system_name == "Windows":
                subprocess.Popen(["explorer", folder_path], shell=True)
            elif system_name == "Darwin":  # macOS
                subprocess.Popen(["open", folder_path])
            elif system_name == "Linux":
                subprocess.Popen(["xdg-open", folder_path])
            else:
                speak("Unsupported operating system.")
                return
            folder_name = os.path.basename(folder_path)  # Extract only the folder name
            speak(f"Opening folder {folder_name}")

        except Exception as e:
            print(f"Error opening folder: {e}")
    else:
        speak("No such folder exists.")

def processCommand(command):
    # Send recognized command to the backend API for processing
    try:
        response = requests.post(
            'https://bluecode-jeds.onrender.com/process-audio',  # Update with your backend URL
            json={"text": command}  # Send the command as JSON data
        )
        if response.status_code == 200:
            result = response.json()
            if "output" in result:
                speak(result["output"])  # Speak the response from the backend
            else:
                speak("I couldn't understand the response.")
        else:
            speak("There was an issue with processing your request.")
    except requests.exceptions.RequestException as e:
        print(f"Error communicating with backend: {e}")
        speak("Sorry, I couldn't reach the server.")

def listen():
    try:
        with sr.Microphone() as source:
            print("Listening...")
            audio = recognizer.listen(source, timeout=5, phrase_time_limit=5)
            return recognizer.recognize_google(audio)
    except sr.UnknownValueError:
        speak("Sorry, I didn't catch that.")
        return None
    except Exception as e:
        print(f"Error: {e}")
        return None

def jarvis_main():
    is_active = False
    speak("Say 'beta' to activate me... and 'deactivate' to exit.")
    
    while True:
        r = sr.Recognizer()
        print("Recognizing....")  
        try:
            if not is_active:
                with sr.Microphone() as source:
                    print("Listening....")
                    audio = r.listen(source, timeout=5, phrase_time_limit=5)
                word = r.recognize_google(audio)
                print(word)
                if word.lower() == "beta":
                    is_active = True
                    speak("Yes! How can I help you?")
                elif word.lower() == "deactivate":
                    is_active = False
                    speak("See you soon!")
                    break
            else:
                # Listen for command
                with sr.Microphone() as source:
                    print("Java active...")
                    audio = r.listen(source)
                    command = r.recognize_google(audio)
                    if command.lower() == "deactivate":
                        is_active = False
                        speak("See you soon!")
                    else:
                        processCommand(command)

        except sr.UnknownValueError:
            print("Sorry! I didn't understand.")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    jarvis_main()

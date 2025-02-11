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

# The speak function has been replaced by text output
def speak(text):
    # In this updated code, we no longer speak out loud, instead we return the text.
    return text

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
                return "Cannot support this Operating System."  # Changed from speak() to return
            return f"Opening {os.path.basename(path)}"
        except Exception as e:
            print(f"Error in opening file: {e}")
            return "Unable to open this file."  # Changed from speak() to return
    else:
        return "Sorry! This specified item does not exist."  # Changed from speak() to return

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
                return "Unsupported operating system."  # Changed from speak() to return
            folder_name = os.path.basename(folder_path)  # Extract only the folder name
            return f"Opening folder {folder_name}"  # Changed from speak() to return

        except Exception as e:
            print(f"Error opening folder: {e}")
            return "Error opening folder."  # Changed from speak() to return
    else:
        return "No such folder exists."  # Changed from speak() to return

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
                return result["output"]  # Return the response from the backend as text
            else:
                return "I couldn't understand the response."  # Changed from speak() to return
        else:
            return "There was an issue with processing your request."  # Changed from speak() to return
    except requests.exceptions.RequestException as e:
        print(f"Error communicating with backend: {e}")
        return "Sorry, I couldn't reach the server."  # Changed from speak() to return

def listen():
    try:
        with sr.Microphone() as source:
            print("Listening...")
            audio = recognizer.listen(source, timeout=5, phrase_time_limit=5)
            return recognizer.recognize_google(audio)
    except sr.UnknownValueError:
        return "Sorry, I didn't catch that."  # Changed from speak() to return
    except Exception as e:
        print(f"Error: {e}")
        return None

def jarvis_main():
    is_active = False
    response = "Say 'beta' to activate me... and 'deactivate' to exit."
    
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
                    response = "Yes! How can I help you?"
                elif word.lower() == "deactivate":
                    is_active = False
                    response = "See you soon!"
                    break
            else:
                # Listen for command
                with sr.Microphone() as source:
                    print("Java active...")
                    audio = r.listen(source)
                    command = r.recognize_google(audio)
                    if command.lower() == "deactivate":
                        is_active = False
                        response = "See you soon!"
                    else:
                        response = processCommand(command)  # Get the text response for the command

        except sr.UnknownValueError:
            response = "Sorry! I didn't understand."
        except Exception as e:
            print(f"Error: {e}")
            response = f"Error: {e}"

    return response  # Return the final response after main loop ends

if __name__ == "__main__":
    final_response = jarvis_main()  # Call the main function and get the response
    print(final_response)  # Print the response at the end

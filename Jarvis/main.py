import speech_recognition as sr
import webbrowser
import pyttsx3
import musicLibrary
import os
import subprocess
import platform


recognizer = sr.Recognizer()
engine = pyttsx3.init()

def speak(text):
    engine.say(text)
    engine.runAndWait()

def get_desktop_path():
    user = os.environ["USERPROFILE"]
    one_drive = os.path.join(user, "OneDrive")
    if os.path.exists(one_drive):
        return os.path.join(one_drive, "Desktop")
    return os.path.join(user, "Desktop")

def open_item(path):
    """ Open a file or folder using the default application """
    if os.path.isdir(path):  # Open folder
        open_folder(path)
    elif os.path.isfile(path):  # Open file
        try:
            system_name = platform.system()
            if system_name == "Windows":
                os.startfile(path)  # Windows default opener
            elif system_name == "Darwin":  # macOS
                subprocess.Popen(["open", path])
            elif system_name == "Linux":
                subprocess.Popen(["xdg-open", path])
            else:
                speak("Unsupported operating system.")
                return
            speak(f"Opening {os.path.basename(path)}")
        except Exception as e:
            print(f"Error opening file: {e}")
            speak("Unable to open the file.")
    else:
        speak("The specified item does not exist.")

def open_folder(folder_name):
    desktop_path = get_desktop_path()
    folder_path = os.path.join(desktop_path, folder_name)
    if os.path.exists(folder_path):
        open_item(folder_path)
    else:
        speak("No such folder exists.")

def processCommand(command):
    if "open" in command and "folder" in command:
        folder_command = command.replace("open", "").replace("folder", "").strip()
        desktop_path = get_desktop_path()
        folder_name = folder_command
        folder_path = os.path.join(desktop_path, folder_name)

        if os.path.exists(folder_path):
            speak(f"Do you want to open a subfolder or a file in {folder_name}? Say subfolder or file.")
            response = listen()

            if response is None:
                return
            
            response = response.lower()
            
            if "subfolder" in response:
                speak("Which subfolder do you want to open?")
                subfolder_name = listen()
                subfolder_path = os.path.join(folder_path, subfolder_name)
                open_item(subfolder_path)
            
            elif "file" in response:
                speak("Which file do you want to open?")
                file_name = listen()
                print(f"file name said to open is {file_name}")
                file_path = os.path.join(folder_path, file_name)
                open_item(file_path)
            
            else:
                open_folder(folder_path)
        else:
            speak("No such folder exists.")
    
    elif "open" in command:
        website_name = command.replace("open", "").strip()
        if "." not in website_name:
            website_name = f"{website_name}.com"
        url = f"https://{website_name}"
        speak(f"Opening {website_name}")
        webbrowser.open(url)
    elif command.startswith("play"):
        songs = command.split(" ")[1]
        link = musicLibrary.music.get(songs)

        if link:
            speak(f"Playing {songs}")
            webbrowser.open(link)
        else:
            speak("Sorry, I couldn't find the song.")
    else:
        speak("Sorry, I didn't understand the command.")


def listen():
    try:
        with sr.Microphone() as source:
            print("Listening...")
            audio = recognizer.listen(source, timeout=5, phrase_time_limit=5)
            return recognizer.recognize_google(audio)
    except sr.UnknownValueError:
        speak("Sorry, I didn't catch that.")
        return None  # Return None instead of an empty string
    except Exception as e:
        print(f"Error: {e}")
        return None



if __name__ == "__main__":
  is_active = False  
  speak("Say jarvis! to activate me ... and deactivate to exit")
  while True:
       # Listen for the wake word "java"
        # obtain audio fron the microphone 
        r = sr.Recognizer()
        print("Recognizing....")  
          # recognize speech using googlr
        try: 
          if not is_active:
            with sr.Microphone() as source:
               print("Listening....")
               audio = r.listen(source , timeout=5 ,phrase_time_limit=5)
            word = r.recognize_google(audio)
            #  audio = r.listen(source,timeout=2)        #  we can also set the timing of listening 
            print(word)
            if(word.lower()=="jarvis"):
                is_active = True
                speak("Yes ! How i can help you .")
            elif(word.lower()== "deactivate"):
                is_active =False
                speak("Good Bye")
                break
          else:  
                # listen for command 
                with sr.Microphone() as source:
                   print("java active...")
                   audio = r.listen(source)
                   command = r.recognize_google(audio)
                   if(command == "deactivate"):
                       is_active=False
                       speak("Good Bye")
                   else:
                       processCommand(command)

             
        except sr.UnknownValueError:
           print("google could not understand audio")
        except Exception as e:
           print("google error ; {0}".format(e))



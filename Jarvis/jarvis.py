import speech_recognition as sr
import webbrowser
import pyttsx3
import os
import musicLibrary
import subprocess
import platform


recognizer = sr.Recognizer()
engine = pyttsx3.init()
engine = None  

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
            elif system_name == "Linux": #for linux
                subprocess.Popen(["xdg-open", path])
            else:
                speak(" Can not support this Operating System.")
                return
            speak(f"Opening {os.path.basename(path)}")
        except Exception as e:
            print(f"Error in opening file: {e}")
            speak("Unable to open this file.")
    else:
        speak("Sorry ! This specified item does not exist.")
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
            folder_name = os.path.basename(folder_path) #extract only the folder name
            speak(f"Opening folder {folder_name}")

        except Exception as e:
            print(f"Error opening folder: {e}")
    else:
        speak("No such folder exists.")

def processCommand(command):
    if "open" in command and "folder" in command:
        folder_command = command.replace("open", "").replace("folder", "").strip()
        # if not  folder_command:
        #     speak("Please specify folder name . ")
        #     return
        desktop_path = get_desktop_path()
        folder_name = folder_command
        folder_path = os.path.join(desktop_path, folder_name)

        if os.path.exists(folder_path):
            speak(f"Do you want to open a subfolder or a file in {folder_name}? Say subfolder or file name .")
            response = listen()

            if response is None:
                return
            
            response = response.lower()
            if ("open" in response and "subfolder" in response) or ("subfolder" in response) :
                subfolder_name = response.replace("open","").replace("subfolder","").strip()
                subfolder_path = os.path.join(folder_path,subfolder_name)
                if os.path.exists(subfolder_path):
                   print(f"opening subfolder {subfolder_name}")
                   open_item(subfolder_path)
                else:
                    speak("I can't get that subfolder.")
                    open_folder(folder_path)
                
            elif ("open" in response and "file" in response) or ("file" in response):
                file_name= response.replace("open","").replace("file","").strip()
                print(f"opening file {file_name}")
                file_path = os.path.join(folder_path, file_name)
                if os.path.exists(file_path):
                  open_item(file_path)
                else:
                    speak("I can't get that file .")
                    open_folder(folder_path)
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
        return None  
    except Exception as e:
        print(f"Error: {e}")
        return None
def jarvis_main():
    is_active = False 
    speak("Say 'beta' to activate me ... and 'deactivate' to exit.")
    
    while True:
        r = sr.Recognizer()
        print("Recognizing....")  
        try: 
          if not is_active:
            with sr.Microphone() as source:
               print("Listening....")
               audio = r.listen(source , timeout=5 ,phrase_time_limit=5)
            word = r.recognize_google(audio)
            #  audio = r.listen(source,timeout=2)        #  we can also set the timing of listening 
            print(word)
            if(word.lower()=="beta"):
                is_active = True
                speak("Yes ! How i can help you .")
            elif(word.lower()== "deactivate"):
                is_active =False
                speak("See you soon !!")
                break
          else:  
                # listen for command 
                with sr.Microphone() as source:
                   print("java active...")
                   audio = r.listen(source)
                   command = r.recognize_google(audio)
                   if(command == "deactivate"):
                       is_active=False
                       speak("See you soon ")
                   else:
                       processCommand(command)

             
        except sr.UnknownValueError:
           print("Sorry ! I didn't understand")
        except Exception as e:
           print("google error ; {0}".format(e))
if __name__ == "__main__":
    jarvis_main()

   

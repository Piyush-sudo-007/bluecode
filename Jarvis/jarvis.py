import webbrowser
import os
import musicLibrary
import subprocess
import platform

# Function to get desktop path
def get_desktop_path():
    user = os.environ["USERPROFILE"]
    one_drive = os.path.join(user, "OneDrive")
    if os.path.exists(one_drive):
        return os.path.join(one_drive, "Desktop")
    return os.path.join(user, "Desktop")

# Function to open a folder or file
def open_item(path):
    if os.path.isdir(path):  # Open folder
        open_folder(path)
    elif os.path.isfile(path):  # Open file
        try:
            system_name = platform.system()
            if system_name == "Windows":
                os.startfile(path)  # for Windows default opener
            elif system_name == "Darwin":  # for macOS
                subprocess.Popen(["open", path])
            elif system_name == "Linux":  # for Linux
                subprocess.Popen(["xdg-open", path])
            else:
                return "Cannot support this Operating System."
            return f"Opening {os.path.basename(path)}"
        except Exception as e:
            print(f"Error in opening file: {e}")
            return "Unable to open this file."
    else:
        return "Sorry! This specified item does not exist."

# Function to open a folder
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
                return "Unsupported operating system."
            folder_name = os.path.basename(folder_path)  # Extract only the folder name
            return f"Opening folder {folder_name}"
        except Exception as e:
            print(f"Error opening folder: {e}")
            return "Error opening folder."
    else:
        return "No such folder exists."

# Function to process the command
def processCommand(command):
    command = command.lower()  # Convert to lowercase for easier matching
    response = ""

    if "open" in command and "folder" in command:
        folder_command = command.replace("open", "").replace("folder", "").strip()
        desktop_path = get_desktop_path()
        folder_name = folder_command
        folder_path = os.path.join(desktop_path, folder_name)

        if os.path.exists(folder_path):
            response = f"Do you want to open a subfolder or a file in {folder_name}? Say subfolder or file name."
            return response
        else:
            response = "No such folder exists."
            return response
    
    elif "open" in command:
        website_name = command.replace("open", "").strip()
        if "." not in website_name:
            website_name = f"{website_name}.com"
        url = f"https://{website_name}"
        response = f"Opening {website_name}"
        webbrowser.open(url)
        return response

    elif command.startswith("play"):
        songs = command.split(" ")[1]
        link = musicLibrary.music.get(songs)

        if link:
            response = f"Playing {songs}"
            webbrowser.open(link)
        else:
            response = "Sorry, I couldn't find the song."
        return response
    else:
        response = "Sorry, I didn't understand the command."
        return response

# Main function to simulate receiving commands from a server (text input)
def backend_command(input_command):
    print(f"Received command: {input_command}")
    response = processCommand(input_command)  # Process the command
    print(f"Response: {response}")
    return response  # Return response as text for the server to handle

# Example Usage - commands received from the backend (simulated)
if __name__ == "__main__":
    # Example command for opening a website
    website_command = "open youtube"
    print(backend_command(website_command))  # Outputs: "Opening youtube"

    # Example command for playing a song
    song_command = "play song shape of you"
    print(backend_command(song_command))  # Outputs: "Playing shape of you"

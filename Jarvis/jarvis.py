import os
import platform
import subprocess
import webbrowser  # Add webbrowser to open websites

# A function to get the desktop path of the user (for folder/file operations)
def get_desktop_path():
    user = os.environ["USERPROFILE"]
    one_drive = os.path.join(user, "OneDrive")
    if os.path.exists(one_drive):
        return os.path.join(one_drive, "Desktop")
    return os.path.join(user, "Desktop")

# Function to open an item (file/folder or website)
def open_item(path):
    if path.lower() == "google":  # If the command is to open Google
        return open_google()
    elif os.path.isdir(path):  # Open folder
        return open_folder(path)
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

# Function to open Google in the default web browser
def open_google():
    webbrowser.open("https://www.google.com")
    return "Opening Google..."

# Function to open a website based on the user's command
def open_website(website):
    # Adding http:// or https:// if not provided
    if not website.lower().startswith("http://") and not website.lower().startswith("https://"):
        website = "https://" + website
    webbrowser.open(website)
    return f"Opening {website}..."

# Function to open a folder
def open_folder(folder_name):
    desktop_path = get_desktop_path()
    folder_path = os.path.join(desktop_path, folder_name)
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

# Function to process the command received from the frontend
def processCommand(command):
    command = command.lower()
    
    # Open specific websites based on the command
    if "open google" in command:
        return open_google()  # If command contains 'google', open Google
    elif "open" in command and "website" in command:
        # Extract the website URL (assuming the user says something like 'open website www.example.com')
        words = command.split()
        if len(words) > 1:
            website = words[-1]  # Assuming the website is the last word
            return open_website(website)
        else:
            return "Please provide a website to open."
    # Add more conditions to handle other commands as necessary
    return "Unknown command."

# Main function to handle frontend input (simulating text input from the frontend)
def handle_frontend_input(text):
    # Process the command sent from the frontend
    return processCommand(text)

if __name__ == "__main__":
    # Example: Let's assume the frontend sends text like "open google"
    frontend_input = "open www.example.com"  # This would be sent from the frontend
    response = handle_frontend_input(frontend_input)
    print(response)  # This is the final response to be sent back to the frontend

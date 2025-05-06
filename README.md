# Rogue Trader Virtual Table Top (VTT)
A specialized virtual tabletop application for playing the Warhammer 40K Rogue Trader roleplaying game online with friends.

## Overview
This VTT provides a digital platform for Game Masters and players to enjoy Rogue Trader sessions remotely. The application combines an interactive game board with real-time synchronization, character management, and a searchable rulebook encyclopedia.

## Features
- **Interactive Game Board**: Place and move tokens representing characters, NPCs, and enemies
- **Real-time Synchronization**: All players see changes instantly via SignalR
- **Encyclopedia**: Browse and search rulebook content with pagination
- **Character Management**: Track character stats, skills, and equipment
- **Asset Library**: Access maps, token images, and other resources
## Technology Stack
### Server
- C# .NET Core
- SignalR for real-time communication
- RESTful API controllers for data access
### Client
- React with TypeScript
- CSS for styling components
- Axios for API communication
### Data Storage
- JSON files (current implementation)
- Structured for future database migration
## Setup Instructions
### Prerequisites
- .NET 7+ SDK
- Node.js 16+ and npm
- Git
### Installation
1. Clone the repository:
    ```
    git clone https://github.com/yourusername/rogue-trader-vtt.git
    cd rogue-trader-vtt
    ```
2. Set up the server:
    ```
    cd server
    cd src
    dotnet restore
    dotnet build
    ```
3. Set up the client:
    ```
    cd ../client
    npm install
    ```
4. Add rulebook assets:

- Place your rulebook JSON files in assets directory
- Format should match the existing structure with pageIndex and text fields
## Running the Application
1. Start the server:
    ```
    cd server
    cd src
    dotnet run
    ```
2. In a separate terminal, start the client:
    ```
    cd client
    npm run dev
    ```
3. Open your browser and navigate to http://localhost:5173

## Project Structure
```
rogue-trader-vtt/
├── client/               # React frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API service layer
│   │   └── styles/       # CSS stylesheets
├── server/               # .NET backend
│   ├── assets/           # Rulebook JSON files
│   └── src/
│       ├── hubs/         # SignalR hubs
│       ├── models/       # Data models
│       └── routes/       # API controllers
```
## Usage
1. Game Masters can create a new session and share the link with players
2. Upload maps and place tokens to represent characters and NPCs
3. Use the encyclopedia to quickly reference rules during play
4. Track character stats and roll dice directly in the application

## Acknowledgements
- Fantasy Flight Games for creating the Rogue Trader RPG

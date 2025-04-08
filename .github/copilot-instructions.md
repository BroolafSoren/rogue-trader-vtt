This project focuses around the following aspects:
    Setting up a virtual tabletop app that hosts a server which manages all clients request and exists as a "single source of truth"
    This project also contains a client which hosts the actual virtual tabletop - meaning it shows the Dungeon Master a certain views and the players another. This form of data abstraction and data hiding is very important for this project.
    Always remember that there exist 2 different types of connection - one using SignalR for real-time communication and one using simple REST style communication for more time agnostic requests like the Encyclopedia
    Additionally, when making changes, ensure that you utilize the already existing libraries first before suggesting new libraries unless the added maintainance is justified by the benefit or there is no other way to implement/fix a feature/bug

Remember this is the directory Structure:
C:\Programmieren\Private Projects\rogue-trader-vtt
├───.git
├───.github
│   └───copilot-instructions.md
├───.gitignore
├───.out
│   └───directory_structure.txt
├───client
│   ├───.dockerignore
│   ├───.gitignore
│   ├───Dockerfile
│   ├───eslint.config.js
│   ├───index.html
│   ├───nginx.conf
│   ├───package.json
│   ├───package-lock.json
│   ├───public
│   │   └───vite.svg
│   ├───README.md
│   ├───src
│   │   ├───App.css
│   │   ├───App.tsx
│   │   ├───assets
│   │   ├───components
│   │   │   ├───CharacterSheet.tsx
│   │   │   ├───FloatingWindow.tsx
│   │   │   ├───MapCanvas.tsx
│   │   │   ├───MovementControls.tsx
│   │   │   ├───Navbar.tsx
│   │   │   └───Sidebar.tsx
│   │   ├───index.css
│   │   ├───main.tsx
│   │   ├───pages
│   │   │   ├───ApiDebugPage.tsx
│   │   │   ├───EncyclopediaDebug.tsx
│   │   │   ├───EncyclopediaPage.tsx
│   │   │   └───MapPage.tsx
│   │   ├───services
│   │   │   ├───characterService.ts
│   │   │   ├───connectionService.ts
│   │   │   ├───rulebookService.ts
│   │   │   └───skillsService.ts
│   │   ├───stores
│   │   │   ├───useCharacterStore.ts
│   │   │   ├───useTokenStore.ts
│   │   │   └───useWindowStore.ts
│   │   ├───styles
│   │   │   ├───CharacterSheet.css
│   │   │   ├───EncyclopediaPage.css
│   │   │   ├───FloatingWindow.css
│   │   │   ├───MapPage.css
│   │   │   ├───Navbar.css
│   │   │   └───Sidebar.css
│   │   ├───utils
│   │   │   └───ApiDebugger.tsx
│   │   └───vite-env.d.ts
│   ├───tsconfig.app.json
│   ├───tsconfig.json
│   ├───tsconfig.node.json
│   └───vite.config.ts
├───database
│   ├───init-scripts
│   │   └───01-create-collections.js
│   └───set-up-scripts
│       ├───populate-characters.js
│       └───run-populate.ps1
├───docker-compose.yml
├───get-tree.ps1
├───package.json
├───package-lock.json
├───pdfImporter
│   ├───.in
│   │   └───Rogue Trader - Core-Rulebook.pdf
│   ├───.out
│   ├───pdf_importer.py
│   └───requirements.txt
├───README.md
├───rogue-trader-vtt.sln
└───server
    ├───assets
    │   ├───Rogue Trader - Core-Rulebook.json
    │   └───Rouge Trader - Soul Reaver.json
    ├───Dockerfile
    └───src
        ├───appsettings.Development.json
        ├───appsettings.json
        ├───data
        │   ├───characters.json
        │   ├───skillgroups.json
        │   └───skills.json
        ├───Hubs
        │   └───GameHub.cs
        ├───models
        │   ├───Character.cs
        │   ├───CharacterRepository.cs
        │   ├───MongoCharacterRepository.cs
        │   └───Token.cs
        ├───Program.cs
        ├───Properties
        │   └───launchSettings.json
        ├───routes
        │   ├───CharacterController.cs
        │   ├───RulebookController.cs
        │   └───SkillsController.cs
        ├───socket
        ├───src.csproj
        └───src.http
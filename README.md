# PortfoliOS

My interactive 3D portfolio experience built with Unity, designed as a functional operating system interface. Explore my work through a virtual desktop environment featuring a Unix-style terminal, project showcases, and immersive 3D navigation.

## Screenshots

![OS Mode - Terminal Interface](Public/Screenshot%202026-02-08%20201925.png)
*Interactive desktop environment with applications and settings*

![Explore Mode - 3D Environment](Public/Screenshot%202026-02-08%20202058.png)
*Terminal interface with portfolio commands and system information*

![Project Showcase](Public/Screenshot%202026-02-08%20202117.png)
*Free-look 3D navigation of the virtual environment*

![Desktop Interface](Public/Screenshot%202026-02-08%20202241.png)
*GitHub repository showcase with real-time data*


## Features

### Interactive Terminal System

- Unix-style command-line interface with 20+ commands
- Real portfolio data integration (education, experience, skills, achievements)
- Command history navigation with up/down arrow keys
- Direct links to GitHub, LinkedIn, and live resume
- System commands: `uname`, `date`, `uptime`, `hostname`, `pwd`, `ls`, `cat`, `echo`
- Portfolio commands: `about`, `education`, `experience`, `skills`, `achievements`, `techstack`

### Dual Mode Experience

- **OS Mode**: Focused desktop interface for browsing projects and using the terminal
- **Explore Mode**: Free-look 3D navigation of the virtual environment
- Seamless transitions with smooth camera tweening and FOV adjustments
- Cursor lock/hide management for optimal UX in each mode

### Dynamic Content Loading

- GitHub repository showcase with real-time data from GitHub API
- Local JSON caching for WebGL compatibility (CORS workaround)
- Hackathon timeline with event details and project links
- Cache-busting mechanisms for fresh data retrieval

### Customization & Settings

- Volume control with dB conversion for AudioMixer
- "Disable 3D" mode for accessibility (OS-only experience)
- Persistent settings using PlayerPrefs
- Mobile support with click-to-focus interaction

### Technical Highlights

- Aspect ratio-aware camera positioning for screen quad rendering
- Custom cursor management system independent of script lifecycle
- Responsive UI with TextMeshPro and Unity UI components
- Manual JSON parsing for complex nested data structures

## Tech Stack

- **Engine**: Unity 2025.1
- **UI**: TextMeshPro, Unity UI (Canvas, ScrollRect, Layout Groups)
- **Networking**: UnityWebRequest for API calls
- **Data**: JSON parsing, PlayerPrefs persistence
- **Audio**: AudioMixer with logarithmic volume conversion
- **Deployment**: WebGL with CORS handling

## Project Structure

```
Assets/
├── Scripts/
│   ├── CameraFocusToggle.cs      # Dual-mode camera system
│   ├── CameraLookAround.cs       # Free-look navigation
│   ├── ClickToFocus.cs           # Mobile click interaction
│   ├── CursorManager.cs          # Centralized cursor control
│   ├── DragHandler.cs            # UI dragging functionality
│   ├── FitScreenToCamera.cs      # Aspect ratio handling
│   ├── HackathonTimeline.cs      # Timeline data fetching
│   ├── Projects.cs               # GitHub repo display
│   ├── Redirects.cs              # URL opening utilities
│   ├── SettingsManager.cs        # Settings persistence
│   ├── TerminalSystem.cs         # Command-line interface
│   └── TimelineItem.cs           # Timeline UI component
├── Data/
│   └── github_projects.json      # Cached GitHub data
├── Scenes/
│   └── SampleScene.unity         # Main scene
├── Materials/                    # Visual materials
└── UI/                          # UI assets
```

## Setup & Installation

### Prerequisites

- Unity 2025.1 or later
- TextMeshPro package (installed via Package Manager)

### Local Development

1. Clone the repository:

   ```bash
   git clone https://github.com/altf4-games/PortfoliOS.git
   ```

2. Open the project in Unity Hub

3. Open `Assets/Scenes/SampleScene.unity`

4. Press Play to run in the Unity Editor

### WebGL Build

1. Go to File > Build Settings
2. Select WebGL platform
3. Click "Switch Platform"
4. Click "Build" and choose output directory
5. Host the build files on a web server

## Usage

### Terminal Commands

**Portfolio Information:**

- `about` - Introduction and overview
- `education` - Educational background
- `experience` - Work experience
- `skills` - Core technical competencies
- `techstack` - Complete technology stack
- `achievements` - Awards and recognitions
- `whoami` - User identity

**Navigation:**

- `linkedin` - Open LinkedIn profile
- `github` - Open GitHub profile
- `resume` - Fetch and open latest resume
- `escape` - Toggle between OS and Explore modes

**System Commands:**

- `help` - List all available commands
- `clear` - Clear terminal output
- `fortune` - Random developer quote
- `uname` - OS information
- `date` - Current date and time
- `uptime` - System uptime
- `hostname` - System hostname
- `pwd` - Working directory
- `ls` - List directory contents
- `cat [file]` - Display file contents
- `echo [text]` - Display text

### Controls

**OS Mode:**

- Type commands in terminal
- Click UI elements
- Press Escape to enter Explore Mode

**Explore Mode:**

- Mouse drag to look around
- Press Escape to return to OS Mode
- Click the computer (mobile) to return to OS Mode

## API Endpoints

- GitHub Projects: `https://api.github.com/users/altf4-games/repos`
- Resume URL: `https://code-snip.vercel.app/raw/100`
- Hackathon Timeline: `https://code-snip.vercel.app/raw/101`

All endpoints use cache-busting with timestamp query parameters.

## Contact

**Pradyum Mistry**

- GitHub: [@altf4-games](https://github.com/altf4-games)
- LinkedIn: [pradyum-mistry](https://linkedin.com/in/pradyum-mistry)

## License

This project is available under the [MIT License](LICENSE).

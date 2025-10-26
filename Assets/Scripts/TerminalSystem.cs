using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using TMPro;
using UnityEngine.SceneManagement;

public class TerminalSystem : MonoBehaviour
{
    [Header("UI References")]
    [SerializeField] private TMP_InputField inputField;
    [SerializeField] private TMP_Text outputText;
    [SerializeField] private int maxOutputLines = 100;
    [SerializeField] private GameObject terminalObject; // Object to disable on exit
    [SerializeField] private UnityEngine.UI.ScrollRect scrollRect; // Optional: for auto-scroll

    private RectTransform outputTextRect;
    private RectTransform contentRect;

    [Header("Terminal Settings")]
    private const string PROMPT = "pradyum@altf4-os:~$ ";

    [Header("Command History")]
    private List<string> commandHistory = new List<string>();
    private int historyIndex = -1;
    private const int MAX_HISTORY = 10;
    private const string HISTORY_KEY = "TerminalHistory";

    [Header("Fortune Quotes")]
    private string[] fortuneQuotes = new string[]
    {
        "Code is like humor. When you have to explain it, it's bad.",
        "First, solve the problem. Then, write the code.",
        "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
        "The best error message is the one that never shows up.",
        "Simplicity is the soul of efficiency.",
        "Make it work, make it right, make it fast.",
        "Programming isn't about what you know; it's about what you can figure out."
    };

    void Start()
    {
        LoadCommandHistory();

        // Cache RectTransforms
        if (outputText != null)
        {
            outputTextRect = outputText.GetComponent<RectTransform>();
        }
        if (scrollRect != null && scrollRect.content != null)
        {
            contentRect = scrollRect.content;
        }

        if (inputField != null)
        {
            inputField.text = PROMPT;
            inputField.caretPosition = PROMPT.Length;
            inputField.onSubmit.AddListener(OnSubmit);
            inputField.onValueChanged.AddListener(OnInputChanged);
            inputField.ActivateInputField();
        }

        // Print welcome message
        PrintWelcomeMessage();
    }

    void Update()
    {
        // Keep input field focused when terminal is active
        if (inputField != null && terminalObject != null && terminalObject.activeSelf && !inputField.isFocused)
        {
            inputField.ActivateInputField();
        }

        // Command history navigation
        if (inputField != null && inputField.isFocused)
        {
            if (Input.GetKeyDown(KeyCode.UpArrow))
            {
                NavigateHistory(-1);
            }
            else if (Input.GetKeyDown(KeyCode.DownArrow))
            {
                NavigateHistory(1);
            }

            // Prevent deleting the prompt
            PreventPromptDeletion();
        }
    }

    private void OnInputChanged(string text)
    {
        // Only check if text is shorter than prompt or doesn't start with prompt
        if (text.Length < PROMPT.Length || !text.StartsWith(PROMPT))
        {
            // Restore prompt without triggering infinite loop
            if (inputField != null)
            {
                inputField.onValueChanged.RemoveListener(OnInputChanged);
                inputField.text = PROMPT;
                inputField.caretPosition = PROMPT.Length;
                inputField.onValueChanged.AddListener(OnInputChanged);
            }
        }
    }

    private void PreventPromptDeletion()
    {
        if (inputField == null) return;

        // If caret is in the prompt area, move it after the prompt
        if (inputField.caretPosition < PROMPT.Length)
        {
            inputField.caretPosition = PROMPT.Length;
        }

        // If selection would delete part of prompt, deselect
        if (inputField.selectionAnchorPosition < PROMPT.Length)
        {
            inputField.selectionAnchorPosition = PROMPT.Length;
            inputField.selectionFocusPosition = inputField.selectionFocusPosition < PROMPT.Length
                ? PROMPT.Length
                : inputField.selectionFocusPosition;
        }
    }

    private void EnsurePrompt()
    {
        if (inputField != null && !inputField.text.StartsWith(PROMPT))
        {
            inputField.text = PROMPT + inputField.text;
            inputField.caretPosition = inputField.text.Length;
        }
    }

    private void PrintWelcomeMessage()
    {
        AppendOutput("===========================================");
        AppendOutput("       Welcome to PortfoliOS Terminal      ");
        AppendOutput("===========================================");
        AppendOutput("Type 'help' for available commands.");
        AppendOutput("");
    }

    private void OnSubmit(string input)
    {
        // Extract command after prompt
        string command = input;
        if (command.StartsWith(PROMPT))
        {
            command = command.Substring(PROMPT.Length);
        }

        if (string.IsNullOrWhiteSpace(command))
        {
            inputField.text = PROMPT;
            inputField.caretPosition = PROMPT.Length;
            inputField.ActivateInputField();
            return;
        }

        // Display command with prompt
        AppendOutput(PROMPT + command);

        // Add to history (without prompt)
        AddToHistory(command);

        // Execute command
        ExecuteCommand(command.Trim().ToLower());

        // Clear input and refocus with prompt
        inputField.text = PROMPT;
        inputField.caretPosition = PROMPT.Length;
        inputField.ActivateInputField();

        // Reset history index
        historyIndex = -1;
    }

    private void ExecuteCommand(string command)
    {
        switch (command)
        {
            case "help":
                CommandHelp();
                break;
            case "clear":
                CommandClear();
                break;
            case "about":
                CommandAbout();
                break;
            case "education":
                CommandEducation();
                break;
            case "experience":
                CommandExperience();
                break;
            case "skills":
                CommandSkills();
                break;
            case "achievements":
                CommandAchievements();
                break;
            case "linkedin":
                CommandLinkedIn();
                break;
            case "github":
                CommandGitHub();
                break;
            case "resume":
                CommandResume();
                break;
            case "whoami":
                CommandWhoAmI();
                break;
            case "techstack":
                CommandTechStack();
                break;
            case "fortune":
                CommandFortune();
                break;
            case "sudo":
                CommandSudo();
                break;
            case "reboot":
                CommandReboot();
                break;
            case "exit":
                CommandExit();
                break;
            case "escape":
                CommandExplore();
                return; // Return immediately to avoid AppendOutput after terminal is disabled
            case "uname":
            case "version":
                CommandVersion();
                break;
            case "date":
                CommandDate();
                break;
            case "uptime":
                CommandUptime();
                break;
            case "hostname":
                CommandHostname();
                break;
            case "pwd":
                CommandPwd();
                break;
            case "ls":
                CommandLs();
                break;
            case "cat":
                CommandCat();
                break;
            case "echo":
                CommandEcho();
                break;
            default:
                AppendOutput("Unknown command. Type 'help' for a list of available commands.");
                break;
        }

        AppendOutput("");
    }

    private void CommandHelp()
    {
        AppendOutput("Available commands:");
        AppendOutput("-------------------");
        AppendOutput("help        - Display this help message");
        AppendOutput("clear       - Clear the terminal screen");
        AppendOutput("about       - Learn about me");
        AppendOutput("education   - View my educational background");
        AppendOutput("experience  - View my work experience");
        AppendOutput("skills      - View my technical skills");
        AppendOutput("achievements - View my achievements");
        AppendOutput("linkedin    - Open my LinkedIn profile");
        AppendOutput("github      - Open my GitHub profile");
        AppendOutput("resume      - Open my resume");
        AppendOutput("whoami      - Display user identity");
        AppendOutput("techstack   - View complete tech stack");
        AppendOutput("fortune     - Get a random developer quote");
        AppendOutput("sudo        - Attempt elevated permissions");
        AppendOutput("reboot      - Restart the terminal");
        AppendOutput("exit        - Close the terminal");
        AppendOutput("escape      - Toggle between OS and Explore mode (or press Escape key)");
        AppendOutput("");
        AppendOutput("System Commands:");
        AppendOutput("-------------------");
        AppendOutput("uname       - Display OS information");
        AppendOutput("date        - Display current date and time");
        AppendOutput("uptime      - Show how long the system has been running");
        AppendOutput("hostname    - Display the system hostname");
        AppendOutput("pwd         - Print working directory");
        AppendOutput("ls          - List directory contents");
        AppendOutput("cat         - Display file contents");
        AppendOutput("echo        - Display a line of text");
    }

    private void CommandClear()
    {
        if (outputText != null)
        {
            outputText.text = "";
        }
    }

    private void CommandAbout()
    {
        AppendOutput("Hi, I am Pradyum Mistry, a developer passionate about games, XR, and full-stack engineering.");
    }

    private void CommandEducation()
    {
        AppendOutput("B.Tech in Computer Engineering");
        AppendOutput("K.J. Somaiya College of Engineering, Mumbai");
        AppendOutput("Expected Graduation: 2027");
        AppendOutput("CGPA: 9.5");
    }

    private void CommandExperience()
    {
        AppendOutput("Work Experience:");
        AppendOutput("-------------------");
        AppendOutput("Game Development & XR Intern");
        AppendOutput("VyuXR Immersive Studios");
        AppendOutput("May 2025 - June 2025");
        AppendOutput("");
        AppendOutput("Tech Head");
        AppendOutput("Team Vision AR/VR Club");
        AppendOutput("July 2024 - May 2025");
    }

    private void CommandSkills()
    {
        AppendOutput("Core Technical Skills:");
        AppendOutput("-------------------");
        AppendOutput("→ Full-Stack Development (Web & Mobile)");
        AppendOutput("→ AI/ML");
        AppendOutput("→ Competitive Programming (4 Star CodeChef, 300+ LeetCode)");
        AppendOutput("→ Backend Architecture & APIs");
        AppendOutput("→ Real-time Communication (WebRTC, Socket.io)");
        AppendOutput("→ Database Design & Optimization");
        AppendOutput("→ Game Development (Unity, Unreal Engine)");
        AppendOutput("→ XR Development (WebXR, AR/VR)");
    }

    private void CommandAchievements()
    {
        AppendOutput("Achievements:");
        AppendOutput("-------------------");
        AppendOutput("- Won Most Addictive Game at 8th Wall Forge the Future Game Jam");
        AppendOutput("- Top 10 in I Love Hackathon Pune Web3 Edition");
        AppendOutput("- Top 6 in KJSSE Hack 8");
        AppendOutput("- 4 Star CodeChef Rating");
        AppendOutput("- 300+ LeetCode problems solved");
        AppendOutput("- Games featured by Markiplier and Jacksepticeye (20M+ subscribers)");
        AppendOutput("- 200K+ game downloads across platforms");
    }

    private void CommandLinkedIn()
    {
        AppendOutput("Opening LinkedIn profile...");
        Application.OpenURL("https://linkedin.com/in/pradyum-mistry");
    }

    private void CommandGitHub()
    {
        AppendOutput("Opening GitHub profile...");
        Application.OpenURL("https://github.com/altf4-games");
    }

    private void CommandResume()
    {
        AppendOutput("Opening resume...");
        StartCoroutine(FetchAndOpenResume());
    }

    private IEnumerator FetchAndOpenResume()
    {
        // Fetch resume URL from your endpoint
        using (UnityEngine.Networking.UnityWebRequest request = UnityEngine.Networking.UnityWebRequest.Get("https://code-snip.vercel.app/raw/100"))
        {
            yield return request.SendWebRequest();

            if (request.result == UnityEngine.Networking.UnityWebRequest.Result.Success)
            {
                string resumeURL = request.downloadHandler.text.Trim();
                if (!string.IsNullOrEmpty(resumeURL))
                {
                    Application.OpenURL(resumeURL);
                }
                else
                {
                    AppendOutput("Error: Resume URL not found.");
                }
            }
            else
            {
                AppendOutput("Error: Failed to fetch resume URL.");
            }
        }
    }

    private void CommandWhoAmI()
    {
        AppendOutput("Pradyum Mistry - Full Stack Developer, Game Developer, App Developer, Competitive Programmer, and AI/ML Enthusiast.");
    }

    private void CommandTechStack()
    {
        AppendOutput("Complete Tech Stack:");
        AppendOutput("-------------------");
        AppendOutput("Languages: C, C++, C#, JavaScript, Python, Java, Dart");
        AppendOutput("Frontend: HTML, CSS, React, Next.js, Three.js");
        AppendOutput("Backend: Node.js, Express, FastAPI");
        AppendOutput("Databases: MongoDB, PostgreSQL, Firebase");
        AppendOutput("Game Engines: Unity, Unreal Engine");
        AppendOutput("Mobile: Flutter, React Native");
        AppendOutput("AI/ML: Scikit-learn, TensorFlow");
        AppendOutput("Other: Socket.io, WebRTC, WebXR");
    }

    private void CommandFortune()
    {
        string quote = fortuneQuotes[Random.Range(0, fortuneQuotes.Length)];
        AppendOutput(quote);
    }

    private void CommandSudo()
    {
        AppendOutput("Access denied. Permission required.");
        AppendOutput("Nice try though!");
    }

    private void CommandVersion()
    {
        AppendOutput("PortfoliOS v1.0.0");
        AppendOutput("Kernel: Unity 2022.3 LTS");
        AppendOutput("Architecture: x86_64");
        AppendOutput("Build Date: October 2025");
    }

    private void CommandDate()
    {
        AppendOutput(System.DateTime.Now.ToString("dddd, MMMM dd, yyyy HH:mm:ss"));
    }

    private void CommandUptime()
    {
        float uptime = Time.realtimeSinceStartup;
        int hours = (int)(uptime / 3600);
        int minutes = (int)((uptime % 3600) / 60);
        int seconds = (int)(uptime % 60);
        AppendOutput($"System uptime: {hours}h {minutes}m {seconds}s");
    }

    private void CommandHostname()
    {
        AppendOutput("portfolios.local");
    }

    private void CommandPwd()
    {
        AppendOutput("/home/pradyum");
    }

    private void CommandLs()
    {
        AppendOutput("Desktop/     Documents/   Downloads/");
        AppendOutput("Pictures/    Projects/    Music/");
        AppendOutput("Videos/      portfolio/   resume.pdf");
    }

    private void CommandCat()
    {
        AppendOutput("cat: missing file operand");
        AppendOutput("Try 'cat resume.txt' to view resume (or use 'resume' command)");
    }

    private void CommandEcho()
    {
        AppendOutput("Hello from PortfoliOS!");
    }

    private void CommandReboot()
    {
        StartCoroutine(RebootSequence());
    }

    private void CommandExit()
    {
        AppendOutput("Closing terminal...");
        AppendOutput("Goodbye!");

        if (terminalObject != null)
        {
            StartCoroutine(ExitTerminal());
        }
        else
        {
            Debug.LogWarning("Terminal object not assigned. Cannot close terminal.");
        }
    }

    private IEnumerator ExitTerminal()
    {
        yield return new WaitForSeconds(0.5f);
        terminalObject.SetActive(false);
    }

    private void CommandExplore()
    {
        // Check if 3D mode is disabled
        if (PlayerPrefs.GetInt("Disable3D", 0) == 1)
        {
            // 3D is disabled, show message
            AppendOutput("Explore mode is disabled.");
            AppendOutput("Please uncheck 'Disable 3D' in Settings to use this feature.");
            return;
        }

        // Don't use AppendOutput here as it starts coroutines after this point
        // Just switch to explore mode immediately

        // Find and trigger CameraFocusToggle to unfocus (return to explore mode)
        CameraFocusToggle cameraToggle = FindObjectOfType<CameraFocusToggle>();
        if (cameraToggle != null)
        {
            cameraToggle.ForceUnfocus();
        }

        // Close terminal immediately
        if (terminalObject != null)
        {
            terminalObject.SetActive(false);
        }
    }

    private IEnumerator RebootSequence()
    {
        CommandClear();
        AppendOutput("Initiating system reboot...");
        yield return new WaitForSeconds(0.5f);

        AppendOutput("Shutting down services...");
        yield return new WaitForSeconds(0.5f);

        AppendOutput("Clearing memory...");
        yield return new WaitForSeconds(0.5f);

        AppendOutput("Restarting PortfoliOS...");
        yield return new WaitForSeconds(1f);

        // Reload the current scene
        SceneManager.LoadScene(SceneManager.GetActiveScene().buildIndex);
    }

    private void AppendOutput(string text)
    {
        if (outputText == null) return;

        if (string.IsNullOrEmpty(outputText.text))
        {
            outputText.text = text;
        }
        else
        {
            outputText.text += "\n" + text;
        }

        // Force TMP_Text to update its preferred height
        outputText.ForceMeshUpdate();

        // Limit output lines
        string[] lines = outputText.text.Split('\n');
        if (lines.Length > maxOutputLines)
        {
            int removeCount = lines.Length - maxOutputLines;
            outputText.text = string.Join("\n", lines, removeCount, maxOutputLines);
        }

        // Auto-scroll to bottom
        StartCoroutine(ScrollToBottom());
    }

    private IEnumerator ScrollToBottom()
    {
        // Wait for TMP to update
        yield return null;

        // Manually set content height based on text preferred height
        UpdateContentHeight();

        yield return new WaitForEndOfFrame();

        // Scroll to bottom
        if (scrollRect != null)
        {
            Canvas.ForceUpdateCanvases();
            scrollRect.verticalNormalizedPosition = 0f;
            scrollRect.velocity = Vector2.zero;
        }
    }

    private void UpdateContentHeight()
    {
        if (outputText != null && contentRect != null && outputTextRect != null)
        {
            // Force TMP to recalculate
            outputText.ForceMeshUpdate();

            // Get the preferred height from TMP_Text
            float preferredHeight = outputText.preferredHeight;

            // Set content height to match (with some padding)
            contentRect.sizeDelta = new Vector2(contentRect.sizeDelta.x, preferredHeight + 20f);

            // Make sure output text fills the content
            outputTextRect.sizeDelta = new Vector2(outputTextRect.sizeDelta.x, preferredHeight);
        }
    }

    // Public method to force scroll - call this if auto-scroll isn't working
    public void ForceScrollToBottom()
    {
        if (scrollRect != null)
        {
            UpdateContentHeight();
            Canvas.ForceUpdateCanvases();
            scrollRect.verticalNormalizedPosition = 0f;
        }
    }

    private void AddToHistory(string command)
    {
        // Remove duplicate if exists
        commandHistory.Remove(command);

        // Add to front
        commandHistory.Insert(0, command);

        // Limit history size
        if (commandHistory.Count > MAX_HISTORY)
        {
            commandHistory.RemoveAt(commandHistory.Count - 1);
        }

        // Save to PlayerPrefs
        SaveCommandHistory();
    }

    private void NavigateHistory(int direction)
    {
        if (commandHistory.Count == 0) return;

        historyIndex += direction;

        // Clamp index
        if (historyIndex < -1)
            historyIndex = -1;
        else if (historyIndex >= commandHistory.Count)
            historyIndex = commandHistory.Count - 1;

        // Set input text
        if (historyIndex == -1)
        {
            inputField.text = PROMPT;
            inputField.caretPosition = PROMPT.Length;
        }
        else
        {
            inputField.text = PROMPT + commandHistory[historyIndex];
            inputField.caretPosition = inputField.text.Length;
        }
    }

    private void SaveCommandHistory()
    {
        string json = JsonUtility.ToJson(new CommandHistoryWrapper { history = commandHistory.ToArray() });
        PlayerPrefs.SetString(HISTORY_KEY, json);
        PlayerPrefs.Save();
    }

    private void LoadCommandHistory()
    {
        if (PlayerPrefs.HasKey(HISTORY_KEY))
        {
            string json = PlayerPrefs.GetString(HISTORY_KEY);
            CommandHistoryWrapper wrapper = JsonUtility.FromJson<CommandHistoryWrapper>(json);
            if (wrapper != null && wrapper.history != null)
            {
                commandHistory = new List<string>(wrapper.history);
            }
        }
    }

    [System.Serializable]
    private class CommandHistoryWrapper
    {
        public string[] history;
    }
}

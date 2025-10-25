using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Networking;
using UnityEngine.UI;
using TMPro;

[System.Serializable]
public class GitHubRepo
{
    public string name;
    public string description;
    public string html_url;
    public string language;
    public int stargazers_count;
    public int forks_count;
    public string updated_at;
    public bool fork;
    public string homepage;
}

public class Projects : MonoBehaviour
{
    [Header("GitHub Settings")]
    [SerializeField] private string githubUsername = "altf4-games";
    [SerializeField] private int maxProjects = 10;
    [SerializeField] private bool excludeForks = true;

    [Header("UI References")]
    [SerializeField] private GameObject projectItemPrefab;
    [SerializeField] private Transform projectsContainer;
    [SerializeField] private GameObject loadingIndicator;
    [SerializeField] private TextMeshProUGUI errorText;

    [Header("Sorting")]
    [SerializeField] private bool sortByStars = true;
    [SerializeField] private bool showOnlyPinned = false;

    private List<GitHubRepo> repositories = new List<GitHubRepo>();

    // Pinned repositories (manually curated based on your profile)
    private string[] pinnedRepos = new string[]
    {
        "Voyage3",
        "RunFT",
        "Accident-Analysis-Dashboard",
        "CatchPhish",
        "Cultur.AI",
        "Heart-Quake"
    };

    void Start()
    {
        LoadProjects();
    }

    public void LoadProjects()
    {
        StartCoroutine(FetchGitHubProjects());
    }

    private IEnumerator FetchGitHubProjects()
    {
        // Show loading indicator
        if (loadingIndicator != null)
            loadingIndicator.SetActive(true);

        if (errorText != null)
            errorText.gameObject.SetActive(false);

        // Clear existing projects
        ClearProjects();

        string apiUrl = $"https://api.github.com/users/{githubUsername}/repos?per_page=100&sort=updated";

        using (UnityWebRequest request = UnityWebRequest.Get(apiUrl))
        {
            // GitHub API requires a User-Agent header
            request.SetRequestHeader("User-Agent", "Unity-PortfoliOS");

            yield return request.SendWebRequest();

            if (loadingIndicator != null)
                loadingIndicator.SetActive(false);

            if (request.result == UnityWebRequest.Result.Success)
            {
                string jsonResponse = request.downloadHandler.text;

                try
                {
                    // Parse JSON array
                    repositories = ParseRepositories(jsonResponse);

                    // Filter repositories
                    if (excludeForks)
                    {
                        repositories.RemoveAll(repo => repo.fork);
                    }

                    if (showOnlyPinned)
                    {
                        repositories = repositories.FindAll(repo => System.Array.Exists(pinnedRepos, p => p == repo.name));
                    }

                    // Sort repositories
                    if (sortByStars)
                    {
                        repositories.Sort((a, b) => b.stargazers_count.CompareTo(a.stargazers_count));
                    }

                    // Limit number of projects
                    if (repositories.Count > maxProjects)
                    {
                        repositories.RemoveRange(maxProjects, repositories.Count - maxProjects);
                    }

                    // Display projects
                    DisplayProjects();

                    Debug.Log($"Successfully loaded {repositories.Count} projects from GitHub");
                }
                catch (System.Exception e)
                {
                    Debug.LogError("Error parsing GitHub data: " + e.Message);
                    ShowError("Error parsing project data");
                }
            }
            else
            {
                Debug.LogError("Failed to fetch GitHub projects: " + request.error);
                ShowError("Failed to load projects. Please check your internet connection.");
            }
        }
    }

    private List<GitHubRepo> ParseRepositories(string json)
    {
        // Add wrapper to parse JSON array
        string wrappedJson = "{\"repos\":" + json + "}";
        RepositoryList repoList = JsonUtility.FromJson<RepositoryList>("{\"repos\":[]}");

        // Manual parsing since Unity's JsonUtility doesn't handle arrays directly
        List<GitHubRepo> repos = new List<GitHubRepo>();

        // Simple JSON array parsing
        json = json.Trim();
        if (json.StartsWith("["))
            json = json.Substring(1);
        if (json.EndsWith("]"))
            json = json.Substring(0, json.Length - 1);

        // Split by "},{"
        string[] repoStrings = json.Split(new string[] { "},{" }, System.StringSplitOptions.None);

        foreach (string repoStr in repoStrings)
        {
            string repoJson = repoStr.Trim();
            if (!repoJson.StartsWith("{"))
                repoJson = "{" + repoJson;
            if (!repoJson.EndsWith("}"))
                repoJson = repoJson + "}";

            try
            {
                GitHubRepo repo = JsonUtility.FromJson<GitHubRepo>(repoJson);
                if (repo != null && !string.IsNullOrEmpty(repo.name))
                {
                    repos.Add(repo);
                }
            }
            catch (System.Exception e)
            {
                Debug.LogWarning("Failed to parse repository: " + e.Message);
            }
        }

        return repos;
    }

    private void DisplayProjects()
    {
        if (projectItemPrefab == null || projectsContainer == null)
        {
            Debug.LogError("Project prefab or container not assigned!");
            return;
        }

        foreach (GitHubRepo repo in repositories)
        {
            GameObject projectItem = Instantiate(projectItemPrefab, projectsContainer);

            // Set project data using the ProjectItem component
            ProjectItem itemScript = projectItem.GetComponent<ProjectItem>();
            if (itemScript != null)
            {
                itemScript.SetProjectData(repo);
            }
            else
            {
                // Fallback: try to set data using common text components
                SetProjectDataFallback(projectItem, repo);
            }
        }
    }

    private void SetProjectDataFallback(GameObject projectItem, GitHubRepo repo)
    {
        // Try to find and set common UI elements
        TextMeshProUGUI[] texts = projectItem.GetComponentsInChildren<TextMeshProUGUI>();

        if (texts.Length > 0) texts[0].text = repo.name;
        if (texts.Length > 1) texts[1].text = repo.description ?? "No description";
        if (texts.Length > 2) texts[2].text = repo.language ?? "Unknown";
        if (texts.Length > 3) texts[3].text = $"⭐ {repo.stargazers_count}";

        // Set button click to open URL
        Button btn = projectItem.GetComponentInChildren<Button>();
        if (btn != null)
        {
            string url = repo.html_url;
            btn.onClick.AddListener(() => Application.OpenURL(url));
        }
    }

    private void ClearProjects()
    {
        if (projectsContainer != null)
        {
            foreach (Transform child in projectsContainer)
            {
                Destroy(child.gameObject);
            }
        }
    }

    private void ShowError(string message)
    {
        if (errorText != null)
        {
            errorText.text = message;
            errorText.gameObject.SetActive(true);
        }
    }

    // Public methods for UI controls
    public void SetExcludeForks(bool exclude)
    {
        excludeForks = exclude;
        LoadProjects();
    }

    public void SetShowOnlyPinned(bool pinned)
    {
        showOnlyPinned = pinned;
        LoadProjects();
    }

    public void SetSortByStars(bool sort)
    {
        sortByStars = sort;
        LoadProjects();
    }
}

[System.Serializable]
public class RepositoryList
{
    public GitHubRepo[] repos;
}

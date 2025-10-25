using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

public class ProjectItem : MonoBehaviour
{
    [Header("UI Elements")]
    [SerializeField] private TextMeshProUGUI projectNameText;
    [SerializeField] private TextMeshProUGUI descriptionText;
    [SerializeField] private TextMeshProUGUI languageText;
    [SerializeField] private TextMeshProUGUI starsText;
    [SerializeField] private TextMeshProUGUI forksText;
    [SerializeField] private Button openButton;
    [SerializeField] private GameObject languageIcon;

    private string projectURL;

    public void SetProjectData(GitHubRepo repo)
    {
        if (repo == null) return;

        // Set project name
        if (projectNameText != null)
        {
            projectNameText.text = FormatProjectName(repo.name);
        }

        // Set description
        if (descriptionText != null)
        {
            descriptionText.text = string.IsNullOrEmpty(repo.description)
                ? "No description available"
                : repo.description;
        }

        // Set language
        if (languageText != null)
        {
            languageText.text = string.IsNullOrEmpty(repo.language)
                ? "Language: Unknown"
                : "Language: " + repo.language;

            // Color code based on language
            SetLanguageColor(languageText, repo.language);
        }

        // Set stars
        if (starsText != null)
        {
            starsText.text = $"Stars: {repo.stargazers_count}";
        }

        // Set forks
        if (forksText != null)
        {
            forksText.text = $"Forks: {repo.forks_count}";
        }

        // Set URL and button
        projectURL = repo.html_url;
        if (openButton != null)
        {
            openButton.onClick.RemoveAllListeners();
            openButton.onClick.AddListener(OpenProject);
        }

        // Show/hide language icon based on availability
        if (languageIcon != null)
        {
            languageIcon.SetActive(!string.IsNullOrEmpty(repo.language));
        }
    }

    private string FormatProjectName(string name)
    {
        // Replace hyphens and underscores with spaces
        string formatted = name.Replace("-", " ").Replace("_", " ");

        // Capitalize first letter of each word
        string[] words = formatted.Split(' ');
        for (int i = 0; i < words.Length; i++)
        {
            if (words[i].Length > 0)
            {
                words[i] = char.ToUpper(words[i][0]) + words[i].Substring(1);
            }
        }

        return string.Join(" ", words);
    }

    private void SetLanguageColor(TextMeshProUGUI text, string language)
    {
        if (text == null || string.IsNullOrEmpty(language)) return;

        // GitHub language colors
        Color color = Color.white;

        switch (language.ToLower())
        {
            case "c#":
                ColorUtility.TryParseHtmlString("#178600", out color);
                break;
            case "javascript":
                ColorUtility.TryParseHtmlString("#f1e05a", out color);
                break;
            case "typescript":
                ColorUtility.TryParseHtmlString("#2b7489", out color);
                break;
            case "python":
                ColorUtility.TryParseHtmlString("#3572A5", out color);
                break;
            case "c++":
                ColorUtility.TryParseHtmlString("#f34b7d", out color);
                break;
            case "c":
                ColorUtility.TryParseHtmlString("#555555", out color);
                break;
            case "css":
                ColorUtility.TryParseHtmlString("#563d7c", out color);
                break;
            case "html":
                ColorUtility.TryParseHtmlString("#e34c26", out color);
                break;
            case "java":
                ColorUtility.TryParseHtmlString("#b07219", out color);
                break;
            case "jupyter notebook":
                ColorUtility.TryParseHtmlString("#DA5B0B", out color);
                break;
            default:
                ColorUtility.TryParseHtmlString("#cccccc", out color);
                break;
        }

        text.color = color;
    }

    public void OpenProject()
    {
        if (!string.IsNullOrEmpty(projectURL))
        {
            Application.OpenURL(projectURL);
            Debug.Log("Opening project: " + projectURL);
        }
    }
}

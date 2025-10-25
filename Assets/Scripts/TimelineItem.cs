using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

public class TimelineItem : MonoBehaviour
{
    [Header("UI Elements")]
    [SerializeField] private TextMeshProUGUI eventNameText;
    [SerializeField] private TextMeshProUGUI dateText;
    [SerializeField] private TextMeshProUGUI descriptionText;
    [SerializeField] private TextMeshProUGUI locationText;

    [Header("Link Buttons")]
    [SerializeField] private Button githubButton;
    [SerializeField] private Button projectLinkButton; // Combined site/itch/game link
    [SerializeField] private TextMeshProUGUI projectLinkButtonText; // Optional: to change button text

    [Header("Link Icons/Containers")]
    [SerializeField] private GameObject githubContainer;
    [SerializeField] private GameObject projectLinkContainer;

    private HackathonEvent eventData;

    public void SetEventData(HackathonEvent hackathonEvent)
    {
        if (hackathonEvent == null) return;

        eventData = hackathonEvent;

        // Set event name
        if (eventNameText != null)
        {
            eventNameText.text = hackathonEvent.name;
        }

        // Set date
        if (dateText != null)
        {
            dateText.text = hackathonEvent.date;
        }

        // Set description
        if (descriptionText != null)
        {
            descriptionText.text = hackathonEvent.description;
        }

        // Set location
        if (locationText != null)
        {
            locationText.text = !string.IsNullOrEmpty(hackathonEvent.location)
                ? hackathonEvent.location
                : "";
        }

        // Setup links
        SetupLinks(hackathonEvent.links);
    }

    private void SetupLinks(HackathonLinks links)
    {
        if (links == null) return;

        // GitHub link
        SetupLink(
            githubButton,
            githubContainer,
            links.github,
            () => OpenURL(links.github)
        );

        // Combined Project/Site/Game link - prioritize in order: itch, site, devpost
        string projectUrl = null;
        string buttonLabel = "View Project";

        if (!string.IsNullOrEmpty(links.itch))
        {
            projectUrl = links.itch;
            buttonLabel = "Play Game";
        }
        else if (!string.IsNullOrEmpty(links.site))
        {
            projectUrl = links.site;
            buttonLabel = "View Site";
        }
        else if (!string.IsNullOrEmpty(links.devpost))
        {
            projectUrl = links.devpost;
            buttonLabel = "View Project";
        }

        // Update button text if available
        if (projectLinkButtonText != null && !string.IsNullOrEmpty(projectUrl))
        {
            projectLinkButtonText.text = buttonLabel;
        }

        // Setup the combined project link button
        SetupLink(
            projectLinkButton,
            projectLinkContainer,
            projectUrl,
            () => OpenURL(projectUrl)
        );
    }

    private void SetupLink(Button button, GameObject container, string url, UnityEngine.Events.UnityAction action)
    {
        bool hasLink = !string.IsNullOrEmpty(url);

        // Show/hide button
        if (button != null)
        {
            button.gameObject.SetActive(hasLink);
            if (hasLink)
            {
                button.onClick.RemoveAllListeners();
                button.onClick.AddListener(action);
            }
        }

        // Show/hide container
        if (container != null)
        {
            container.SetActive(hasLink);
        }
    }

    private void OpenURL(string url)
    {
        if (!string.IsNullOrEmpty(url))
        {
            Application.OpenURL(url);
            Debug.Log("Opening URL: " + url);
        }
    }

    // Public methods for individual link opening (can be called from UI)
    public void OpenGitHub()
    {
        if (eventData?.links != null)
            OpenURL(eventData.links.github);
    }

    public void OpenProjectLink()
    {
        if (eventData?.links != null)
        {
            // Prioritize itch, then site, then devpost
            if (!string.IsNullOrEmpty(eventData.links.itch))
                OpenURL(eventData.links.itch);
            else if (!string.IsNullOrEmpty(eventData.links.site))
                OpenURL(eventData.links.site);
            else if (!string.IsNullOrEmpty(eventData.links.devpost))
                OpenURL(eventData.links.devpost);
        }
    }
}

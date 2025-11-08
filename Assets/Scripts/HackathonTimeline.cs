using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Networking;
using UnityEngine.UI;
using TMPro;

[System.Serializable]
public class HackathonLinks
{
    public string github;
    public string itch;
    public string site;
    public string devpost;
}

[System.Serializable]
public class HackathonEvent
{
    public string name;
    public string date;
    public string description;
    public string location;
    public HackathonLinks links;
}

[System.Serializable]
public class HackathonList
{
    public HackathonEvent[] events;
}

public class HackathonTimeline : MonoBehaviour
{
    [Header("API Settings")]
    [SerializeField] private string timelineURL = "https://code-snip.vercel.app/raw/101";

    [Header("UI References")]
    [SerializeField] private GameObject timelineItemPrefab;
    [SerializeField] private Transform timelineContainer;
    [SerializeField] private GameObject loadingIndicator;
    [SerializeField] private TextMeshProUGUI errorText;
    [SerializeField] private Button loadMoreButton;
    [SerializeField] private TextMeshProUGUI loadMoreButtonText;

    [Header("Display Settings")]
    [SerializeField] private bool reverseOrder = false; // Show newest first
    [SerializeField] private bool usePagination = false;
    [SerializeField] private int itemsPerPage = 5;

    private List<HackathonEvent> events = new List<HackathonEvent>();
    private int currentPage = 0;
    private int totalPages = 0;

    void Start()
    {
        LoadTimeline();
    }

    public void LoadTimeline()
    {
        StartCoroutine(FetchHackathonTimeline());
    }

    private IEnumerator FetchHackathonTimeline()
    {
        // Show loading indicator
        if (loadingIndicator != null)
            loadingIndicator.SetActive(true);

        if (errorText != null)
            errorText.gameObject.SetActive(false);

        // Clear existing timeline items
        ClearTimeline();

        // Add timestamp to prevent caching
        string finalURL = timelineURL + "?t=" + System.DateTime.UtcNow.Ticks;

        using (UnityWebRequest request = UnityWebRequest.Get(finalURL))
        {
            yield return request.SendWebRequest();

            if (loadingIndicator != null)
                loadingIndicator.SetActive(false);

            if (request.result == UnityWebRequest.Result.Success)
            {
                string jsonResponse = request.downloadHandler.text;

                try
                {
                    // Parse JSON array
                    events = ParseHackathonEvents(jsonResponse);

                    if (reverseOrder)
                    {
                        events.Reverse();
                    }

                    // Calculate pagination
                    if (usePagination)
                    {
                        totalPages = Mathf.CeilToInt((float)events.Count / itemsPerPage);
                        currentPage = 0;
                    }

                    // Display timeline
                    DisplayTimeline();

                    Debug.Log($"Successfully loaded {events.Count} hackathon events");
                }
                catch (System.Exception e)
                {
                    Debug.LogError("Error parsing hackathon data: " + e.Message);
                    ShowError("Error parsing timeline data");
                }
            }
            else
            {
                Debug.LogError("Failed to fetch hackathon timeline: " + request.error);
                ShowError("Failed to load timeline. Please check your internet connection.");
            }
        }
    }

    private List<HackathonEvent> ParseHackathonEvents(string json)
    {
        List<HackathonEvent> eventsList = new List<HackathonEvent>();

        // Clean up JSON
        json = json.Trim();
        if (json.StartsWith("["))
            json = json.Substring(1);
        if (json.EndsWith("]"))
            json = json.Substring(0, json.Length - 1);

        // Remove trailing comma if exists
        json = json.TrimEnd(',', ' ', '\n', '\r');

        // Split by objects
        int depth = 0;
        int startIndex = 0;
        List<string> eventStrings = new List<string>();

        for (int i = 0; i < json.Length; i++)
        {
            if (json[i] == '{')
            {
                if (depth == 0)
                    startIndex = i;
                depth++;
            }
            else if (json[i] == '}')
            {
                depth--;
                if (depth == 0)
                {
                    string eventJson = json.Substring(startIndex, i - startIndex + 1);
                    eventStrings.Add(eventJson);
                }
            }
        }

        // Parse each event
        foreach (string eventStr in eventStrings)
        {
            try
            {
                HackathonEvent hackathonEvent = JsonUtility.FromJson<HackathonEvent>(eventStr);
                if (hackathonEvent != null && !string.IsNullOrEmpty(hackathonEvent.name))
                {
                    eventsList.Add(hackathonEvent);
                }
            }
            catch (System.Exception e)
            {
                Debug.LogWarning("Failed to parse hackathon event: " + e.Message);
            }
        }

        return eventsList;
    }

    private void DisplayTimeline()
    {
        if (timelineItemPrefab == null || timelineContainer == null)
        {
            Debug.LogError("Timeline prefab or container not assigned!");
            return;
        }

        // Clear only if not paginating or starting fresh
        if (!usePagination || currentPage == 0)
        {
            ClearTimeline();
        }

        // Determine which events to display
        List<HackathonEvent> eventsToDisplay = events;

        if (usePagination)
        {
            int startIndex = currentPage * itemsPerPage;
            int count = Mathf.Min(itemsPerPage, events.Count - startIndex);

            if (startIndex < events.Count)
            {
                eventsToDisplay = events.GetRange(startIndex, count);
            }
            else
            {
                eventsToDisplay = new List<HackathonEvent>();
            }
        }

        // Display events
        foreach (HackathonEvent hackathonEvent in eventsToDisplay)
        {
            GameObject timelineItem = Instantiate(timelineItemPrefab, timelineContainer);

            // Set timeline data using the TimelineItem component
            TimelineItem itemScript = timelineItem.GetComponent<TimelineItem>();
            if (itemScript != null)
            {
                itemScript.SetEventData(hackathonEvent);
            }
            else
            {
                // Fallback: try to set data using common text components
                SetTimelineDataFallback(timelineItem, hackathonEvent);
            }
        }

        // Update Load More button
        UpdateLoadMoreButton();

        // Refresh scroll view layout
        RefreshScrollLayout();
    }

    private void SetTimelineDataFallback(GameObject timelineItem, HackathonEvent hackathonEvent)
    {
        // Try to find and set common UI elements
        TextMeshProUGUI[] texts = timelineItem.GetComponentsInChildren<TextMeshProUGUI>();

        if (texts.Length > 0) texts[0].text = hackathonEvent.name;
        if (texts.Length > 1) texts[1].text = hackathonEvent.date;
        if (texts.Length > 2) texts[2].text = hackathonEvent.description;
        if (texts.Length > 3) texts[3].text = hackathonEvent.location;
    }

    private void ClearTimeline()
    {
        if (timelineContainer != null)
        {
            foreach (Transform child in timelineContainer)
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

    private void UpdateLoadMoreButton()
    {
        if (!usePagination || loadMoreButton == null)
        {
            if (loadMoreButton != null)
                loadMoreButton.gameObject.SetActive(false);
            return;
        }

        // Check if there are more items to load
        bool hasMore = (currentPage + 1) * itemsPerPage < events.Count;
        loadMoreButton.gameObject.SetActive(hasMore);

        // Update button text
        if (hasMore && loadMoreButtonText != null)
        {
            int remaining = events.Count - ((currentPage + 1) * itemsPerPage);
            loadMoreButtonText.text = $"Load More ({remaining} remaining)";
        }
    }

    // Public methods
    public void LoadMoreEvents()
    {
        if (!usePagination) return;

        currentPage++;
        DisplayTimeline();
    }

    public void ShowAllEvents()
    {
        usePagination = false;
        ClearTimeline();
        DisplayTimeline();
    }

    public void SetReverseOrder(bool reverse)
    {
        reverseOrder = reverse;
        LoadTimeline();
    }

    public int GetEventCount()
    {
        return events.Count;
    }

    private void RefreshScrollLayout()
    {
        // Manual layout refresh
        StartCoroutine(ForceLayoutRefresh());
    }

    private IEnumerator ForceLayoutRefresh()
    {
        yield return new WaitForEndOfFrame();

        if (timelineContainer != null)
        {
            LayoutRebuilder.ForceRebuildLayoutImmediate(timelineContainer as RectTransform);
        }
    }
}

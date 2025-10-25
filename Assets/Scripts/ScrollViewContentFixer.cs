using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

[RequireComponent(typeof(RectTransform))]
public class ScrollViewContentFixer : MonoBehaviour
{
    /* SCROLL VIEW SETUP CHECKLIST:
     * 1. ScrollView (parent) should have Scroll Rect component with:
     *    - Horizontal: UNCHECKED
     *    - Vertical: CHECKED
     *    - Content: Assigned to this GameObject
     *    - Viewport: Assigned to the Viewport GameObject
     * 2. Viewport should have Mask component
     * 3. This Content GameObject should be child of Viewport
     */

    [Header("Auto Setup")]
    [SerializeField] private bool autoSetupOnStart = true;
    [SerializeField] private float spacing = 10f;
    [SerializeField] private int paddingLeft = 10;
    [SerializeField] private int paddingRight = 10;
    [SerializeField] private int paddingTop = 10;
    [SerializeField] private int paddingBottom = 10;

    void Start()
    {
        if (autoSetupOnStart)
        {
            SetupScrollContent();
        }
    }

    [ContextMenu("Setup Scroll Content")]
    public void SetupScrollContent()
    {
        RectTransform rectTransform = GetComponent<RectTransform>();
        if (rectTransform == null)
        {
            Debug.LogError("ScrollViewContentFixer: No RectTransform found!");
            return;
        }

        // Set anchor and pivot for vertical scroll (stretch horizontally, grow vertically from top)
        rectTransform.anchorMin = new Vector2(0, 1);  // Top-left
        rectTransform.anchorMax = new Vector2(1, 1);  // Top-right (stretch width)
        rectTransform.pivot = new Vector2(0.5f, 1);   // Pivot at top-center
        rectTransform.anchoredPosition = new Vector2(0, 0);
        rectTransform.sizeDelta = new Vector2(0, rectTransform.sizeDelta.y); // Reset width offset

        // Add or configure Vertical Layout Group
        VerticalLayoutGroup layoutGroup = GetComponent<VerticalLayoutGroup>();
        if (layoutGroup == null)
        {
            layoutGroup = gameObject.AddComponent<VerticalLayoutGroup>();
        }

        if (layoutGroup != null)
        {
            layoutGroup.childControlWidth = true;
            layoutGroup.childControlHeight = true;
            layoutGroup.childForceExpandWidth = true;
            layoutGroup.childForceExpandHeight = false;
            layoutGroup.childAlignment = TextAnchor.UpperCenter;
            layoutGroup.spacing = spacing;
            layoutGroup.padding = new RectOffset(paddingLeft, paddingRight, paddingTop, paddingBottom);
        }

        // Add or configure Content Size Fitter
        ContentSizeFitter sizeFitter = GetComponent<ContentSizeFitter>();
        if (sizeFitter == null)
        {
            sizeFitter = gameObject.AddComponent<ContentSizeFitter>();
        }

        if (sizeFitter != null)
        {
            sizeFitter.verticalFit = ContentSizeFitter.FitMode.PreferredSize;
            sizeFitter.horizontalFit = ContentSizeFitter.FitMode.Unconstrained;
        }

        Debug.Log("Scroll content setup complete!");
    }

    // Helper method to refresh layout
    public void RefreshLayout()
    {
        StartCoroutine(RefreshLayoutCoroutine());
    }

    private IEnumerator RefreshLayoutCoroutine()
    {
        // Wait for end of frame to ensure all items are instantiated
        yield return new WaitForEndOfFrame();

        // Force rebuild layout
        LayoutRebuilder.ForceRebuildLayoutImmediate(GetComponent<RectTransform>());

        // If parent has a scroll rect, reset scroll position to top
        ScrollRect parentScroll = GetComponentInParent<ScrollRect>();
        if (parentScroll != null)
        {
            parentScroll.verticalNormalizedPosition = 1f;
        }
    }
}

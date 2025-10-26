using UnityEngine;

public class ClickToFocus : MonoBehaviour
{
    [Header("References")]
    [SerializeField] private CameraFocusToggle cameraFocusToggle;

    [Header("Settings")]
    [SerializeField] private float maxClickDistance = 50f; // Max distance for raycast
    [SerializeField] private LayerMask clickableLayer; // Optional: only click on specific layers

    private Camera mainCamera;

    void Start()
    {
        mainCamera = Camera.main;

        if (cameraFocusToggle == null)
        {
            cameraFocusToggle = FindObjectOfType<CameraFocusToggle>();
            if (cameraFocusToggle == null)
            {
                Debug.LogError("ClickToFocus: No CameraFocusToggle found!");
            }
        }
    }

    void Update()
    {
        // Only process clicks when in explore mode (not focused)
        if (cameraFocusToggle != null && !cameraFocusToggle.IsFocused())
        {
            // Check for mouse click or touch
            if (Input.GetMouseButtonDown(0) || (Input.touchCount > 0 && Input.GetTouch(0).phase == TouchPhase.Began))
            {
                CheckForClick();
            }
        }
    }

    private void CheckForClick()
    {
        Ray ray;

        // Handle touch or mouse
        if (Input.touchCount > 0)
        {
            ray = mainCamera.ScreenPointToRay(Input.GetTouch(0).position);
        }
        else
        {
            ray = mainCamera.ScreenPointToRay(Input.mousePosition);
        }

        RaycastHit hit;
        bool didHit;

        // Raycast with or without layer mask
        if (clickableLayer.value != 0)
        {
            didHit = Physics.Raycast(ray, out hit, maxClickDistance, clickableLayer);
        }
        else
        {
            didHit = Physics.Raycast(ray, out hit, maxClickDistance);
        }

        if (didHit)
        {
            // Check if we hit this object or any of its children/parents
            if (hit.collider.gameObject == gameObject ||
                hit.collider.transform.IsChildOf(transform) ||
                transform.IsChildOf(hit.collider.transform))
            {
                OnComputerClicked();
            }
        }
    }

    private void OnComputerClicked()
    {
        // Check if 3D is disabled
        if (PlayerPrefs.GetInt("Disable3D", 0) == 1)
        {
            Debug.Log("Cannot focus - 3D mode is disabled");
            return;
        }

        Debug.Log("Computer clicked - focusing camera");

        if (cameraFocusToggle != null && !cameraFocusToggle.IsFocused())
        {
            cameraFocusToggle.ToggleFocus();
        }
    }

    // Optional: Visual feedback on hover
    void OnMouseOver()
    {
        if (cameraFocusToggle != null && !cameraFocusToggle.IsFocused())
        {
            // You could change cursor or show outline here
        }
    }
}

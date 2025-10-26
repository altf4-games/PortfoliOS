using UnityEngine;

/// <summary>
/// Centralized cursor management system that works with CameraFocusToggle
/// to ensure proper cursor visibility and lock state in different modes.
/// </summary>
public class CursorManager : MonoBehaviour
{
    [Header("References")]
    [SerializeField] private CameraFocusToggle cameraFocusToggle;

    [Header("Cursor States")]
    [SerializeField] private bool hideInExploreMode = true;
    [SerializeField] private bool lockInExploreMode = true;

    private bool lastFocusedState = false;
    private bool isInitialized = false;

    void Start()
    {
        if (cameraFocusToggle == null)
        {
            cameraFocusToggle = FindObjectOfType<CameraFocusToggle>();
            if (cameraFocusToggle == null)
            {
                Debug.LogError("CursorManager: No CameraFocusToggle found!");
                enabled = false;
                return;
            }
        }

        // Set initial cursor state based on starting mode
        UpdateCursorState(cameraFocusToggle.IsFocused());
        lastFocusedState = cameraFocusToggle.IsFocused();
        isInitialized = true;
    }

    void Update()
    {
        if (!isInitialized || cameraFocusToggle == null) return;

        // Check if focus state changed
        bool currentFocusedState = cameraFocusToggle.IsFocused();
        if (currentFocusedState != lastFocusedState)
        {
            UpdateCursorState(currentFocusedState);
            lastFocusedState = currentFocusedState;
        }
    }

    void LateUpdate()
    {
        if (!isInitialized) return;

        // Force cursor state every frame to prevent other scripts from interfering
        EnforceCursorState();

        // In explore mode, also check for any mouse movement or input to ensure lock
        if (!cameraFocusToggle.IsFocused())
        {
            // If user moves mouse or presses any mouse button, ensure cursor is locked
            if (Input.GetAxis("Mouse X") != 0 || Input.GetAxis("Mouse Y") != 0 ||
                Input.GetMouseButton(0) || Input.GetMouseButton(1) || Input.GetMouseButton(2))
            {
                if (Cursor.lockState != CursorLockMode.Locked)
                {
                    Cursor.lockState = CursorLockMode.Locked;
                    Cursor.visible = false;
                }
            }
        }
    }

    private void UpdateCursorState(bool isFocused)
    {
        if (isFocused)
        {
            // OS Mode - show cursor and unlock
            SetCursorState(true, true);
            Debug.Log("CursorManager: OS Mode - Cursor Visible & Unlocked");
        }
        else
        {
            // Explore Mode - hide cursor and lock
            SetCursorState(!hideInExploreMode, !lockInExploreMode);
            Debug.Log("CursorManager: Explore Mode - Cursor Hidden & Locked");
        }
    }

    private void EnforceCursorState()
    {
        if (cameraFocusToggle.IsFocused())
        {
            // OS Mode - ensure cursor is visible and unlocked
            if (!Cursor.visible || Cursor.lockState != CursorLockMode.None)
            {
                Cursor.visible = true;
                Cursor.lockState = CursorLockMode.None;
            }
        }
        else
        {
            // Explore Mode - IMMEDIATELY lock and hide cursor
            if (hideInExploreMode && Cursor.visible)
            {
                Cursor.visible = false;
            }
            if (lockInExploreMode && Cursor.lockState != CursorLockMode.Locked)
            {
                Cursor.lockState = CursorLockMode.Locked;
            }
        }
    }

    private void SetCursorState(bool visible, bool unlocked)
    {
        Cursor.visible = visible;
        Cursor.lockState = unlocked ? CursorLockMode.None : CursorLockMode.Locked;
    }

    // Public methods for manual control if needed
    public void SetOSMode()
    {
        SetCursorState(true, true);
    }

    public void SetExploreMode()
    {
        SetCursorState(!hideInExploreMode, !lockInExploreMode);
    }

    public void ForceUpdate()
    {
        if (cameraFocusToggle != null)
        {
            UpdateCursorState(cameraFocusToggle.IsFocused());
        }
    }
}

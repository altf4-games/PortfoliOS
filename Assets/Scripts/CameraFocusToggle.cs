using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class CameraFocusToggle : MonoBehaviour
{
    [Header("Focus Settings")]
    [SerializeField] private Vector3 focusRotation = new Vector3(0f, 90f, 0f);
    [SerializeField] private float focusFOV = 27f;
    [SerializeField] private float normalFOV = 70f;

    [Header("Tween Settings")]
    [SerializeField] private float tweenDuration = 1f;
    [SerializeField] private AnimationCurve tweenCurve = AnimationCurve.EaseInOut(0f, 0f, 1f, 1f);

    [Header("Input")]
    [SerializeField] private KeyCode toggleKey = KeyCode.F;

    [Header("UI References")]
    [SerializeField] private GameObject osCanvas;
    [SerializeField] private GameObject osSCreen;

    [Header("Startup Settings")]
    [SerializeField] private bool startFocused = true; // Start the game focused by default

    private Camera cam;
    private CameraLookAround lookAroundScript;
    private bool isFocused = false;
    private bool isTweening = false;

    private Vector3 normalRotation;
    private Quaternion startRotation;
    private Quaternion targetRotation;
    private float startFOV;
    private float targetFOV;

    void Awake()
    {
        cam = GetComponent<Camera>();
        lookAroundScript = GetComponent<CameraLookAround>();

        if (cam == null)
        {
            Debug.LogError("CameraFocusToggle: No Camera component found!");
        }

        if (lookAroundScript == null)
        {
            Debug.LogWarning("CameraFocusToggle: No CameraLookAround script found!");
        }

        if (osCanvas == null)
        {
            Debug.LogWarning("CameraFocusToggle: No OS Canvas assigned!");
        }
        else
        {
            // Set initial state based on startFocused
            // osCanvas.SetActive(startFocused);
            // osSCreen.SetActive(startFocused);
        }

        // Store the initial FOV if not set
        if (cam != null && normalFOV == 70f)
        {
            normalFOV = cam.fieldOfView;
        }

        // Apply initial focused state if needed
        if (startFocused)
        {
            osCanvas.SetActive(startFocused);
            osSCreen.SetActive(startFocused);
            ApplyFocusedStateImmediate();
        }
    }

    private void ApplyFocusedStateImmediate()
    {
        // Store normal rotation before applying focused state
        normalRotation = transform.localEulerAngles;

        // Apply focused rotation and FOV immediately without tweening
        transform.localRotation = Quaternion.Euler(focusRotation);

        if (cam != null)
        {
            cam.fieldOfView = focusFOV;
        }

        // Disable look around script when focused
        if (lookAroundScript != null)
        {
            lookAroundScript.enabled = false;
        }

        // Set focused state
        isFocused = true;

        Debug.Log("Started in focused state");
    }

    void Update()
    {
        if (Input.GetKeyDown(toggleKey) && !isTweening)
        {
            ToggleFocus();
        }
    }

    public void ToggleFocus()
    {
        if (isFocused)
        {
            // Return to normal
            StartCoroutine(TweenToNormal());
        }
        else
        {
            // Focus
            StartCoroutine(TweenToFocus());
        }

        isFocused = !isFocused;
    }

    IEnumerator TweenToFocus()
    {
        isTweening = true;

        // Disable look around script
        if (lookAroundScript != null)
        {
            lookAroundScript.enabled = false;
        }

        // Store current state
        normalRotation = transform.localEulerAngles;
        startRotation = transform.localRotation;
        targetRotation = Quaternion.Euler(focusRotation);
        startFOV = cam.fieldOfView;
        targetFOV = focusFOV;

        float elapsed = 0f;

        while (elapsed < tweenDuration)
        {
            elapsed += Time.deltaTime;
            float t = Mathf.Clamp01(elapsed / tweenDuration);
            float curveValue = tweenCurve.Evaluate(t);

            // Tween rotation
            transform.localRotation = Quaternion.Slerp(startRotation, targetRotation, curveValue);

            // Tween FOV
            if (cam != null)
            {
                cam.fieldOfView = Mathf.Lerp(startFOV, targetFOV, curveValue);
            }

            yield return null;
        }

        // Ensure final values are set
        transform.localRotation = targetRotation;
        if (cam != null)
        {
            cam.fieldOfView = targetFOV;
        }

        // Activate OS Canvas when focused
        if (osCanvas != null)
        {
            osCanvas.SetActive(true);
            osSCreen.SetActive(true);
        }

        isTweening = false;
    }

    IEnumerator TweenToNormal()
    {
        isTweening = true;

        // Deactivate OS Canvas when unfocusing
        if (osCanvas != null)
        {
            osCanvas.SetActive(false);
            osSCreen.SetActive(false);
        }

        // Store current state
        startRotation = transform.localRotation;
        targetRotation = Quaternion.Euler(normalRotation);
        startFOV = cam.fieldOfView;
        targetFOV = normalFOV;

        float elapsed = 0f;

        while (elapsed < tweenDuration)
        {
            elapsed += Time.deltaTime;
            float t = Mathf.Clamp01(elapsed / tweenDuration);
            float curveValue = tweenCurve.Evaluate(t);

            // Tween rotation
            transform.localRotation = Quaternion.Slerp(startRotation, targetRotation, curveValue);

            // Tween FOV
            if (cam != null)
            {
                cam.fieldOfView = Mathf.Lerp(startFOV, targetFOV, curveValue);
            }

            yield return null;
        }

        // Ensure final values are set
        transform.localRotation = targetRotation;
        if (cam != null)
        {
            cam.fieldOfView = targetFOV;
        }

        // Re-enable look around script
        if (lookAroundScript != null)
        {
            lookAroundScript.enabled = true;
        }

        isTweening = false;
    }

    // Public methods for external control
    public void SetFocusRotation(Vector3 rotation)
    {
        focusRotation = rotation;
    }

    public void SetFocusFOV(float fov)
    {
        focusFOV = fov;
    }

    public void SetNormalFOV(float fov)
    {
        normalFOV = fov;
    }

    public void SetTweenDuration(float duration)
    {
        tweenDuration = duration;
    }

    public bool IsFocused()
    {
        return isFocused;
    }

    public bool IsTweening()
    {
        return isTweening;
    }

    public void ForceUnfocus()
    {
        if (isFocused && !isTweening)
        {
            StartCoroutine(TweenToNormal());
            isFocused = false;
        }
    }
}

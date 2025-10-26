using UnityEngine;

[ExecuteAlways]
public class FitScreenToCamera : MonoBehaviour
{
    [Header("References")]
    [SerializeField] private Camera cam;
    [SerializeField] private Transform screenQuad;

    [Header("Settings")]
    [SerializeField] private bool updateInPlayMode = true;
    [SerializeField] private bool updateInEditMode = true;
    [SerializeField] private float quadHeight = 1f; // Base height of the quad

    private float lastAspect = -1f;
    private bool isInitialized = false;

    void Start()
    {
        if (!isInitialized)
        {
            Initialize();
        }
    }

    void LateUpdate()
    {
        // Only update if enabled for current mode
        if (Application.isPlaying && !updateInPlayMode) return;
        if (!Application.isPlaying && !updateInEditMode) return;

        if (!cam || !screenQuad) return;

        // Only recalculate if aspect ratio changed
        if (Mathf.Abs(cam.aspect - lastAspect) > 0.001f)
        {
            FitQuadToCamera();
            lastAspect = cam.aspect;
        }
    }

    public void Initialize()
    {
        if (!cam)
        {
            cam = GetComponent<Camera>();
            if (!cam)
            {
                Debug.LogError("FitScreenToCamera: No camera found!");
                return;
            }
        }

        if (!screenQuad)
        {
            Debug.LogWarning("FitScreenToCamera: No screen quad assigned!");
            return;
        }

        isInitialized = true;
        FitQuadToCamera();
    }

    public void FitQuadToCamera()
    {
        if (!cam || !screenQuad) return;

        // Calculate distance based on FOV so quad fills vertical view
        float distance = (quadHeight / 2f) / Mathf.Tan(cam.fieldOfView * 0.5f * Mathf.Deg2Rad);

        // Position quad in front of camera at calculated distance
        screenQuad.position = cam.transform.position + cam.transform.forward * distance;

        // Make quad face the camera
        screenQuad.rotation = cam.transform.rotation;

        // Adjust quad width to match camera aspect ratio
        float quadWidth = quadHeight * cam.aspect;
        screenQuad.localScale = new Vector3(quadWidth, quadHeight, 1f);

        Debug.Log($"FitScreenToCamera: Aspect={cam.aspect:F2}, Distance={distance:F2}, Scale=({quadWidth:F2}, {quadHeight:F2})");
    }

    // Public method to manually trigger update
    public void UpdateFit()
    {
        FitQuadToCamera();
    }

    // Set custom quad height
    public void SetQuadHeight(float height)
    {
        quadHeight = height;
        FitQuadToCamera();
    }

#if UNITY_EDITOR
    void OnValidate()
    {
        if (updateInEditMode && cam && screenQuad)
        {
            FitQuadToCamera();
        }
    }
#endif
}

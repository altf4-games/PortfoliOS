using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class CameraLookAround : MonoBehaviour
{
    [Header("Look Sensitivity")]
    [SerializeField] private float mouseSensitivity = 100f;
    [SerializeField] private float touchSensitivity = 0.5f;

    [Header("Look Limits")]
    [SerializeField] private float minVerticalAngle = -90f;
    [SerializeField] private float maxVerticalAngle = 90f;
    [SerializeField] private float minHorizontalAngle = -180f;
    [SerializeField] private float maxHorizontalAngle = 180f;

    [Header("Smoothing")]
    [SerializeField] private bool smoothLook = true;
    [SerializeField] private float smoothSpeed = 10f;

    private float xRotation = 0f;
    private float yRotation = 0f;
    private float targetXRotation = 0f;
    private float targetYRotation = 0f;

    private Vector2 lastTouchPosition;
    private bool isTouching = false;

    void Start()
    {
        yRotation = transform.localEulerAngles.y;
        xRotation = transform.localEulerAngles.x;
        if (xRotation > 180f) xRotation -= 360f;

        targetXRotation = xRotation;
        targetYRotation = yRotation;
    }

    void Update()
    {
        HandleInput();
        ApplyRotation();
    }

    void HandleInput()
    {
        float mouseX = 0f;
        float mouseY = 0f;

        mouseX = Input.GetAxis("Mouse X") * mouseSensitivity * Time.deltaTime;
        mouseY = Input.GetAxis("Mouse Y") * mouseSensitivity * Time.deltaTime;

        if (Input.touchCount > 0)
        {
            Touch touch = Input.GetTouch(0);

            if (touch.phase == TouchPhase.Began)
            {
                lastTouchPosition = touch.position;
                isTouching = true;
            }
            else if (touch.phase == TouchPhase.Moved && isTouching)
            {
                Vector2 delta = touch.position - lastTouchPosition;
                mouseX = delta.x * touchSensitivity;
                mouseY = delta.y * touchSensitivity;
                lastTouchPosition = touch.position;
            }
            else if (touch.phase == TouchPhase.Ended || touch.phase == TouchPhase.Canceled)
            {
                isTouching = false;
            }
        }

        targetYRotation += mouseX;
        targetXRotation -= mouseY;

        targetXRotation = Mathf.Clamp(targetXRotation, minVerticalAngle, maxVerticalAngle);
        targetYRotation = Mathf.Clamp(targetYRotation, minHorizontalAngle, maxHorizontalAngle);
    }

    void ApplyRotation()
    {
        if (smoothLook)
        {
            xRotation = Mathf.Lerp(xRotation, targetXRotation, smoothSpeed * Time.deltaTime);
            yRotation = Mathf.Lerp(yRotation, targetYRotation, smoothSpeed * Time.deltaTime);
        }
        else
        {
            xRotation = targetXRotation;
            yRotation = targetYRotation;
        }

        transform.localRotation = Quaternion.Euler(xRotation, yRotation, 0f);
    }

    public void SetLookDirection(float horizontal, float vertical)
    {
        targetYRotation = Mathf.Clamp(horizontal, minHorizontalAngle, maxHorizontalAngle);
        targetXRotation = Mathf.Clamp(vertical, minVerticalAngle, maxVerticalAngle);
    }

    public void ResetLookDirection()
    {
        targetXRotation = 0f;
        targetYRotation = 0f;
    }

    public void SetSensitivity(float newSensitivity)
    {
        mouseSensitivity = newSensitivity;
    }

    public void SetLookLimits(float minVertical, float maxVertical, float minHorizontal, float maxHorizontal)
    {
        minVerticalAngle = minVertical;
        maxVerticalAngle = maxVertical;
        minHorizontalAngle = minHorizontal;
        maxHorizontalAngle = maxHorizontal;
    }
}

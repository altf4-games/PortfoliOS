using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Audio;
using UnityEngine.UI;

public class SettingsManager : MonoBehaviour
{
    [Header("Audio Settings")]
    [SerializeField] private AudioMixer audioMixer;
    [SerializeField] private Slider volumeSlider;
    [SerializeField] private string mixerVolumeParameter = "MasterVolume"; // Name of the exposed parameter in Audio Mixer

    [Header("3D Settings")]
    [SerializeField] private Toggle disable3DToggle;
    [SerializeField] private CameraFocusToggle cameraFocusToggle;
    [SerializeField] private GameObject[] objectsToDisable; // All 3D objects to disable

    [Header("PlayerPrefs Keys")]
    [SerializeField] private string volumeKey = "MasterVolume";
    [SerializeField] private string disable3DKey = "Disable3D";

    private bool is3DDisabled = false;

    void Start()
    {
        // Load saved settings
        LoadSettings();

        // Setup listeners
        if (volumeSlider != null)
        {
            volumeSlider.onValueChanged.AddListener(SetVolume);
        }

        if (disable3DToggle != null)
        {
            disable3DToggle.onValueChanged.AddListener(SetDisable3D);
        }
    }

    private void LoadSettings()
    {
        // Load volume
        if (PlayerPrefs.HasKey(volumeKey))
        {
            float savedVolume = PlayerPrefs.GetFloat(volumeKey, 0.75f);
            if (volumeSlider != null)
            {
                volumeSlider.value = savedVolume;
            }
            SetVolume(savedVolume);
        }
        else
        {
            // Default volume
            if (volumeSlider != null)
            {
                SetVolume(volumeSlider.value);
            }
        }

        // Load 3D disable setting
        if (PlayerPrefs.HasKey(disable3DKey))
        {
            bool disable3D = PlayerPrefs.GetInt(disable3DKey, 0) == 1;
            if (disable3DToggle != null)
            {
                disable3DToggle.isOn = disable3D;
            }
            SetDisable3D(disable3D);
        }
    }

    public void SetVolume(float volume)
    {
        if (audioMixer != null)
        {
            // Convert 0-1 slider value to decibels (-80 to 0)
            // Using logarithmic scale for more natural volume control
            float dB = volume > 0.0001f ? 20f * Mathf.Log10(volume) : -80f;
            audioMixer.SetFloat(mixerVolumeParameter, dB);
        }

        // Save to PlayerPrefs
        PlayerPrefs.SetFloat(volumeKey, volume);
        PlayerPrefs.Save();
    }

    public void SetDisable3D(bool disable)
    {
        is3DDisabled = disable;

        // Disable/Enable camera focus toggle script
        if (cameraFocusToggle != null)
        {
            cameraFocusToggle.enabled = !disable;
        }

        // Disable/Enable 3D objects
        if (objectsToDisable != null)
        {
            foreach (GameObject obj in objectsToDisable)
            {
                if (obj != null)
                {
                    obj.SetActive(!disable);
                }
            }
        }

        // Save to PlayerPrefs
        PlayerPrefs.SetInt(disable3DKey, disable ? 1 : 0);
        PlayerPrefs.Save();

        Debug.Log($"3D Mode: {(disable ? "Disabled" : "Enabled")}");
    }

    // Public methods for UI
    public void ResetSettings()
    {
        // Reset volume to default (75%)
        if (volumeSlider != null)
        {
            volumeSlider.value = 0.75f;
        }

        // Reset 3D toggle to enabled (false)
        if (disable3DToggle != null)
        {
            disable3DToggle.isOn = false;
        }

        // Clear PlayerPrefs
        PlayerPrefs.DeleteKey(volumeKey);
        PlayerPrefs.DeleteKey(disable3DKey);
        PlayerPrefs.Save();

        Debug.Log("Settings reset to default");
    }

    public bool Is3DDisabled()
    {
        return is3DDisabled;
    }

    public float GetVolume()
    {
        return volumeSlider != null ? volumeSlider.value : 0.75f;
    }
}

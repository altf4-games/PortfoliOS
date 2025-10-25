using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Networking;

public class Redirects : MonoBehaviour
{
    private const string RESUME_URL_ENDPOINT = "https://code-snip.vercel.app/raw/100";

    public void OpenURL(string url)
    {
        Application.OpenURL(url);
    }

    public void OpenResume()
    {
        StartCoroutine(FetchAndOpenResume());
    }

    private IEnumerator FetchAndOpenResume()
    {
        using (UnityWebRequest request = UnityWebRequest.Get(RESUME_URL_ENDPOINT))
        {
            yield return request.SendWebRequest();

            if (request.result == UnityWebRequest.Result.Success)
            {
                string resumeURL = request.downloadHandler.text.Trim();

                if (!string.IsNullOrEmpty(resumeURL))
                {
                    Debug.Log("Opening resume URL: " + resumeURL);
                    Application.OpenURL(resumeURL);
                }
                else
                {
                    Debug.LogError("Resume URL is empty!");
                }
            }
            else
            {
                Debug.LogError("Failed to fetch resume URL: " + request.error);
            }
        }
    }
}

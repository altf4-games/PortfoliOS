using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Menu : MonoBehaviour
{
    public GameObject menuObject;
    public GameObject projectWindow;
    public GameObject hackathonWindow;

    public void ToggleMenu()
    {
        menuObject.SetActive(!menuObject.activeSelf);
    }

    public void ToggleProjectFolder()
    {
        projectWindow.SetActive(!projectWindow.activeSelf);
    }

    public void ToggleHackathonFolder()
    {
        hackathonWindow.SetActive(!hackathonWindow.activeSelf);
    }
}

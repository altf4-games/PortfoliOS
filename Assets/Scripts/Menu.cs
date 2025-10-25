using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Menu : MonoBehaviour
{
    public GameObject menuObject;

    public void ToggleMenu()
    {
        menuObject.SetActive(!menuObject.activeSelf);
    }
}

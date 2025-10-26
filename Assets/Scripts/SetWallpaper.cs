using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class SetWallpaper : MonoBehaviour
{
    public Image wallpaperImage;
    public Image wallpaperImage2;
    public Material material;
    public Sprite[] images;
    public Texture[] imagesW;
    private int currentWallpaper = 5;

    private void Start()
    {
        currentWallpaper = PlayerPrefs.GetInt("Wallpaper", 5);
        wallpaperImage.sprite = images[currentWallpaper - 1];
        wallpaperImage2.sprite = images[currentWallpaper - 1];
        material.SetTexture("_BaseMap", imagesW[currentWallpaper - 1]);
        material.SetTexture("_EmissionMap", imagesW[currentWallpaper - 1]);
    }

    public void ChangeWallpaper(int wallpaper)
    {
        wallpaperImage.sprite = images[wallpaper - 1];
        wallpaperImage2.sprite = images[wallpaper - 1];
        material.SetTexture("_BaseMap", imagesW[wallpaper - 1]);
        material.SetTexture("_EmissionMap", imagesW[wallpaper - 1]);
        PlayerPrefs.SetInt("Wallpaper", wallpaper);
    }
}

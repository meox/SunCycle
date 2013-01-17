package com.enginetwork.app.suncycle;

import org.apache.cordova.DroidGap;

import android.os.Bundle;

public class SunCycleActivity extends DroidGap {
    /** Called when the activity is first created. */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        super.setIntegerProperty("splashscreen", com.enginetwork.app.suncycle.R.drawable.splash);

        super.loadUrl("file:///android_asset/www/index.html", 1000);
    }
}

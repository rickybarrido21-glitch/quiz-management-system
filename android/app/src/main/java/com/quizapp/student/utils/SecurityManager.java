package com.quizapp.student.utils;

import android.app.Activity;
import android.app.ActivityManager;
import android.content.Context;
import android.graphics.PixelFormat;
import android.os.Build;
import android.view.Gravity;
import android.view.View;
import android.view.WindowManager;
import android.widget.Toast;

import java.util.List;

public class SecurityManager {
    private Activity activity;
    private WindowManager windowManager;
    private View overlayView;
    private boolean isSecurityEnabled = false;

    public SecurityManager(Activity activity) {
        this.activity = activity;
        this.windowManager = (WindowManager) activity.getSystemService(Context.WINDOW_SERVICE);
    }

    public void enableSecurityFeatures() {
        preventScreenshots();
        isSecurityEnabled = true;
    }

    public void disableSecurityFeatures() {
        allowScreenshots();
        removeOverlay();
        isSecurityEnabled = false;
    }

    private void preventScreenshots() {
        // Prevent screenshots and screen recording
        activity.getWindow().setFlags(
            WindowManager.LayoutParams.FLAG_SECURE,
            WindowManager.LayoutParams.FLAG_SECURE
        );
    }

    private void allowScreenshots() {
        activity.getWindow().clearFlags(WindowManager.LayoutParams.FLAG_SECURE);
    }

    public void enableQuizMode() {
        if (!isSecurityEnabled) {
            enableSecurityFeatures();
        }
        
        // Additional quiz-specific security
        preventTaskSwitching();
        showSecurityOverlay();
    }

    public void disableQuizMode() {
        removeOverlay();
        disableSecurityFeatures();
    }

    private void preventTaskSwitching() {
        // Make the activity sticky and prevent task switching
        activity.getWindow().addFlags(
            WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON |
            WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD |
            WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED |
            WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
        );
    }

    private void showSecurityOverlay() {
        if (overlayView != null) {
            return; // Already showing
        }

        try {
            overlayView = new View(activity);
            overlayView.setBackgroundColor(0x80000000); // Semi-transparent black

            WindowManager.LayoutParams params = new WindowManager.LayoutParams(
                WindowManager.LayoutParams.MATCH_PARENT,
                WindowManager.LayoutParams.MATCH_PARENT,
                Build.VERSION.SDK_INT >= Build.VERSION_CODES.O 
                    ? WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
                    : WindowManager.LayoutParams.TYPE_PHONE,
                WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE |
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE |
                WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
                PixelFormat.TRANSLUCENT
            );

            params.gravity = Gravity.TOP | Gravity.LEFT;
            windowManager.addView(overlayView, params);
        } catch (Exception e) {
            // Handle permission issues gracefully
            Toast.makeText(activity, "Security overlay permission required", Toast.LENGTH_SHORT).show();
        }
    }

    private void removeOverlay() {
        if (overlayView != null) {
            try {
                windowManager.removeView(overlayView);
                overlayView = null;
            } catch (Exception e) {
                // View might already be removed
            }
        }
    }

    public void checkSecurityViolations() {
        if (!isSecurityEnabled) {
            return;
        }

        // Check if user is trying to switch apps
        if (isAppInBackground()) {
            handleSecurityViolation("App switching detected");
        }
    }

    private boolean isAppInBackground() {
        try {
            ActivityManager activityManager = (ActivityManager) activity.getSystemService(Context.ACTIVITY_SERVICE);
            if (activityManager == null) return false;
            List<ActivityManager.RunningAppProcessInfo> appProcesses = activityManager.getRunningAppProcesses();
            if (appProcesses == null) return false;
            final String packageName = activity.getPackageName();
            for (ActivityManager.RunningAppProcessInfo appProcess : appProcesses) {
                if (appProcess.importance == ActivityManager.RunningAppProcessInfo.IMPORTANCE_FOREGROUND
                        && appProcess.processName.equals(packageName)) {
                    return false;
                }
            }
        } catch (Exception e) {
            return false; // Fail safe - don't trigger violation
        }
        return true;
    }

    private void handleSecurityViolation(String violation) {
        Toast.makeText(activity, "Security violation: " + violation, Toast.LENGTH_LONG).show();
        
        // Log the violation (you might want to send this to your server)
        // For now, just show a warning
    }

    public boolean isSecurityEnabled() {
        return isSecurityEnabled;
    }
}
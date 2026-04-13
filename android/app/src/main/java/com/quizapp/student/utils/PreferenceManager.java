package com.quizapp.student.utils;

import android.content.Context;
import android.content.SharedPreferences;
import androidx.security.crypto.EncryptedSharedPreferences;
import androidx.security.crypto.MasterKeys;

public class PreferenceManager {
    private static final String PREF_NAME = "quiz_app_prefs";
    private static final String KEY_IS_LOGGED_IN = "is_logged_in";
    private static final String KEY_STUDENT_ID = "student_id";
    private static final String KEY_STUDENT_NAME = "student_name";
    private static final String KEY_STUDENT_COURSE = "student_course";
    private static final String KEY_STUDENT_YEAR = "student_year";
    private static final String KEY_STUDENT_SECTION = "student_section";
    private static final String KEY_DEVICE_ID = "device_id";
    private static final String KEY_API_BASE_URL = "api_base_url";

    private SharedPreferences sharedPreferences;
    private SharedPreferences.Editor editor;

    public PreferenceManager(Context context) {
        try {
            String masterKeyAlias = MasterKeys.getOrCreate(MasterKeys.AES256_GCM_SPEC);
            sharedPreferences = EncryptedSharedPreferences.create(
                PREF_NAME,
                masterKeyAlias,
                context,
                EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
                EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
            );
        } catch (Exception e) {
            // Fallback to regular SharedPreferences if encryption fails
            // Also delete corrupted encrypted prefs if they exist
            try {
                context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)
                       .edit().clear().apply();
            } catch (Exception ignored) {}
            sharedPreferences = context.getSharedPreferences(PREF_NAME + "_plain", Context.MODE_PRIVATE);
        }
        editor = sharedPreferences.edit();
    }

    // Login state management
    public void setLoggedIn(boolean isLoggedIn) {
        editor.putBoolean(KEY_IS_LOGGED_IN, isLoggedIn);
        editor.apply();
    }

    public boolean isLoggedIn() {
        return sharedPreferences.getBoolean(KEY_IS_LOGGED_IN, false);
    }

    // Student information
    public void setStudentInfo(String studentId, String name, String course, String year, String section) {
        editor.putString(KEY_STUDENT_ID, studentId);
        editor.putString(KEY_STUDENT_NAME, name);
        editor.putString(KEY_STUDENT_COURSE, course);
        editor.putString(KEY_STUDENT_YEAR, year);
        editor.putString(KEY_STUDENT_SECTION, section);
        editor.apply();
    }

    public String getStudentId() {
        return sharedPreferences.getString(KEY_STUDENT_ID, "");
    }

    public String getStudentName() {
        return sharedPreferences.getString(KEY_STUDENT_NAME, "");
    }

    public String getStudentCourse() {
        return sharedPreferences.getString(KEY_STUDENT_COURSE, "");
    }

    public String getStudentYear() {
        return sharedPreferences.getString(KEY_STUDENT_YEAR, "");
    }

    public String getStudentSection() {
        return sharedPreferences.getString(KEY_STUDENT_SECTION, "");
    }

    // Device ID
    public void setDeviceId(String deviceId) {
        editor.putString(KEY_DEVICE_ID, deviceId);
        editor.apply();
    }

    public String getDeviceId() {
        return sharedPreferences.getString(KEY_DEVICE_ID, "");
    }

    // API Configuration
    public void setApiBaseUrl(String baseUrl) {
        editor.putString(KEY_API_BASE_URL, baseUrl);
        editor.apply();
    }

    public String getApiBaseUrl() {
        return sharedPreferences.getString(KEY_API_BASE_URL, "http://10.0.2.2:3000/api/");
    }

    // Clear all data (logout)
    public void clearSession() {
        editor.clear();
        editor.apply();
    }

    // Clear specific keys
    public void clearKey(String key) {
        editor.remove(key);
        editor.apply();
    }

    // Generic methods for any key-value pairs
    public void putString(String key, String value) {
        editor.putString(key, value);
        editor.apply();
    }

    public String getString(String key, String defaultValue) {
        return sharedPreferences.getString(key, defaultValue);
    }

    public void putInt(String key, int value) {
        editor.putInt(key, value);
        editor.apply();
    }

    public int getInt(String key, int defaultValue) {
        return sharedPreferences.getInt(key, defaultValue);
    }

    public void putBoolean(String key, boolean value) {
        editor.putBoolean(key, value);
        editor.apply();
    }

    public boolean getBoolean(String key, boolean defaultValue) {
        return sharedPreferences.getBoolean(key, defaultValue);
    }

    public void putLong(String key, long value) {
        editor.putLong(key, value);
        editor.apply();
    }

    public long getLong(String key, long defaultValue) {
        return sharedPreferences.getLong(key, defaultValue);
    }
}
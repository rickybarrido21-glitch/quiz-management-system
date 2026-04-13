package com.quizapp.student.activities;

import android.content.Intent;
import android.os.Bundle;
import android.provider.Settings;
import android.text.TextUtils;
import android.view.View;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.google.android.material.button.MaterialButton;
import android.widget.ProgressBar;
import com.google.android.material.textfield.TextInputEditText;
import com.google.android.material.textfield.TextInputLayout;
import com.quizapp.student.R;
import com.quizapp.student.api.ApiClient;
import com.quizapp.student.api.ApiService;
import com.quizapp.student.models.Student;
import com.quizapp.student.utils.PreferenceManager;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class LoginActivity extends AppCompatActivity {

    private TextInputLayout tilStudentId;
    private TextInputEditText etStudentId;
    private MaterialButton btnLogin;
    private ProgressBar progressBar;
    
    private PreferenceManager preferenceManager;
    private ApiService apiService;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        preferenceManager = new PreferenceManager(this);
        apiService = ApiClient.getClient().create(ApiService.class);

        // Check if already logged in
        if (preferenceManager.isLoggedIn()) {
            navigateToMain();
            return;
        }

        initViews();
        setupClickListeners();
    }

    private void initViews() {
        tilStudentId = findViewById(R.id.tilStudentId);
        etStudentId = findViewById(R.id.etStudentId);
        btnLogin = findViewById(R.id.btnLogin);
        progressBar = findViewById(R.id.progressBar);
    }

    private void setupClickListeners() {
        btnLogin.setOnClickListener(v -> attemptLogin());
        
        findViewById(R.id.tvRegisterLink).setOnClickListener(v -> {
            startActivity(new Intent(this, RegisterActivity.class));
        });
    }

    private void attemptLogin() {
        if (!validateInput()) {
            return;
        }

        String studentId = etStudentId.getText().toString().trim();
        String deviceId = getAndroidDeviceId();

        setLoading(true);

        ApiService.StudentLoginRequest request = new ApiService.StudentLoginRequest(studentId, deviceId);
        
        Call<ApiService.ApiResponse<Student>> call = apiService.loginStudent(request);
        call.enqueue(new Callback<ApiService.ApiResponse<Student>>() {
            @Override
            public void onResponse(Call<ApiService.ApiResponse<Student>> call, Response<ApiService.ApiResponse<Student>> response) {
                setLoading(false);

                if (response.isSuccessful() && response.body() != null) {
                    ApiService.ApiResponse<Student> apiResponse = response.body();

                    // Backend returns { student: {...} } — check both student and data fields
                    Student student = apiResponse.student != null ? apiResponse.student : apiResponse.data;

                    if (student != null) {
                        preferenceManager.setLoggedIn(true);
                        preferenceManager.setStudentInfo(
                            student.getStudentId(),
                            student.getFullName(),
                            student.getCourse(),
                            student.getYear(),
                            student.getSection()
                        );

                        Toast.makeText(LoginActivity.this, "Login successful!", Toast.LENGTH_SHORT).show();
                        navigateToMain();
                    } else {
                        showError(apiResponse.message != null ? apiResponse.message : "Login failed");
                    }
                } else {
                    try {
                        String errorBody = response.errorBody() != null ? response.errorBody().string() : "";
                        if (errorBody.contains("\"message\"")) {
                            int start = errorBody.indexOf("\"message\"") + 11;
                            int end = errorBody.indexOf("\"", start + 1);
                            if (end > start) {
                                showError(errorBody.substring(start, end));
                                return;
                            }
                        }
                        showError("Login failed. Please check your student ID.");
                    } catch (Exception e) {
                        showError("Login failed. Please check your student ID.");
                    }
                }
            }

            @Override
            public void onFailure(Call<ApiService.ApiResponse<Student>> call, Throwable t) {
                setLoading(false);
                showError("Network error: " + t.getMessage());
            }
        });
    }

    private boolean validateInput() {
        String studentId = etStudentId.getText().toString().trim();

        if (TextUtils.isEmpty(studentId)) {
            tilStudentId.setError(getString(R.string.field_required));
            etStudentId.requestFocus();
            return false;
        }

        if (studentId.length() < 3) {
            tilStudentId.setError(getString(R.string.invalid_student_id));
            etStudentId.requestFocus();
            return false;
        }

        tilStudentId.setError(null);
        return true;
    }

    private void setLoading(boolean loading) {
        btnLogin.setEnabled(!loading);
        progressBar.setVisibility(loading ? View.VISIBLE : View.GONE);
        
        if (loading) {
            btnLogin.setText("");
        } else {
            btnLogin.setText(getString(R.string.login_button));
        }
    }

    private void showError(String message) {
        Toast.makeText(this, message, Toast.LENGTH_LONG).show();
    }

    private String getAndroidDeviceId() {
        return Settings.Secure.getString(getContentResolver(), Settings.Secure.ANDROID_ID);
    }

    private void navigateToMain() {
        Intent intent = new Intent(this, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
        finish();
    }

    @Override
    public void onBackPressed() {
        // Disable back button on login screen
        moveTaskToBack(true);
    }
}
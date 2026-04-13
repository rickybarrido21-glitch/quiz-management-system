package com.quizapp.student.activities;

import android.content.Intent;
import android.os.Bundle;
import android.provider.Settings;
import android.text.TextUtils;
import android.util.Patterns;
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

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class RegisterActivity extends AppCompatActivity {

    private TextInputLayout tilStudentId, tilFullName, tilCourse, tilYear, tilSection, tilEmail;
    private TextInputEditText etStudentId, etFullName, etCourse, etYear, etSection, etEmail;
    private MaterialButton btnRegister;
    private ProgressBar progressBar;
    
    private ApiService apiService;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_register);

        initViews();
        setupClickListeners();
        
        apiService = ApiClient.getClient().create(ApiService.class);
    }

    private void initViews() {
        tilStudentId = findViewById(R.id.tilStudentId);
        tilFullName = findViewById(R.id.tilFullName);
        tilCourse = findViewById(R.id.tilCourse);
        tilYear = findViewById(R.id.tilYear);
        tilSection = findViewById(R.id.tilSection);
        tilEmail = findViewById(R.id.tilEmail);
        
        etStudentId = findViewById(R.id.etStudentId);
        etFullName = findViewById(R.id.etFullName);
        etCourse = findViewById(R.id.etCourse);
        etYear = findViewById(R.id.etYear);
        etSection = findViewById(R.id.etSection);
        etEmail = findViewById(R.id.etEmail);
        
        btnRegister = findViewById(R.id.btnRegister);
        progressBar = findViewById(R.id.progressBar);
    }

    private void setupClickListeners() {
        btnRegister.setOnClickListener(v -> attemptRegister());
        
        findViewById(R.id.tvLoginLink).setOnClickListener(v -> {
            startActivity(new Intent(this, LoginActivity.class));
            finish();
        });
    }

    private void attemptRegister() {
        if (!validateInput()) {
            return;
        }

        String studentId = etStudentId.getText().toString().trim();
        String fullName = etFullName.getText().toString().trim();
        String course = etCourse.getText().toString().trim();
        String year = etYear.getText().toString().trim();
        String section = etSection.getText().toString().trim();
        String email = etEmail.getText().toString().trim();
        String deviceId = getAndroidDeviceId();

        setLoading(true);

        ApiService.StudentRegistrationRequest request = new ApiService.StudentRegistrationRequest(
            studentId, fullName, course, year, section, email, deviceId
        );
        
        Call<ApiService.ApiResponse<Student>> call = apiService.registerStudent(request);
        call.enqueue(new Callback<ApiService.ApiResponse<Student>>() {
            @Override
            public void onResponse(Call<ApiService.ApiResponse<Student>> call, Response<ApiService.ApiResponse<Student>> response) {
                setLoading(false);

                if (response.isSuccessful() && response.body() != null) {
                    // Backend returns { message: "Registration successful", student: {...} }
                    // Registration is successful if we get HTTP 201
                    Toast.makeText(RegisterActivity.this,
                        getString(R.string.success_register), Toast.LENGTH_LONG).show();

                    Intent intent = new Intent(RegisterActivity.this, LoginActivity.class);
                    intent.putExtra("student_id", studentId);
                    startActivity(intent);
                    finish();
                } else {
                    // Try to parse error message
                    try {
                        String errorBody = response.errorBody() != null ? response.errorBody().string() : "Registration failed";
                        // Extract message from JSON if possible
                        if (errorBody.contains("\"message\"")) {
                            int start = errorBody.indexOf("\"message\"") + 11;
                            int end = errorBody.indexOf("\"", start + 1);
                            if (end > start) {
                                showError(errorBody.substring(start, end));
                                return;
                            }
                        }
                        showError("Registration failed. " + errorBody);
                    } catch (Exception e) {
                        showError("Registration failed. Please try again.");
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
        boolean isValid = true;

        // Clear previous errors
        clearErrors();

        String studentId = etStudentId.getText().toString().trim();
        String fullName = etFullName.getText().toString().trim();
        String course = etCourse.getText().toString().trim();
        String year = etYear.getText().toString().trim();
        String section = etSection.getText().toString().trim();
        String email = etEmail.getText().toString().trim();

        // Validate Student ID
        if (TextUtils.isEmpty(studentId)) {
            tilStudentId.setError(getString(R.string.field_required));
            isValid = false;
        } else if (studentId.length() < 3) {
            tilStudentId.setError(getString(R.string.invalid_student_id));
            isValid = false;
        }

        // Validate Full Name
        if (TextUtils.isEmpty(fullName)) {
            tilFullName.setError(getString(R.string.field_required));
            isValid = false;
        }

        // Validate Course
        if (TextUtils.isEmpty(course)) {
            tilCourse.setError(getString(R.string.field_required));
            isValid = false;
        }

        // Validate Year - must be 1st, 2nd, 3rd, 4th, or 5th
        if (TextUtils.isEmpty(year)) {
            tilYear.setError(getString(R.string.field_required));
            isValid = false;
        } else if (!year.matches("^[1-5](st|nd|rd|th)$")) {
            tilYear.setError("Enter: 1st, 2nd, 3rd, 4th, or 5th");
            isValid = false;
        }

        // Validate Section
        if (TextUtils.isEmpty(section)) {
            tilSection.setError(getString(R.string.field_required));
            isValid = false;
        }

        // Validate Email
        if (TextUtils.isEmpty(email)) {
            tilEmail.setError(getString(R.string.field_required));
            isValid = false;
        } else if (!Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            tilEmail.setError(getString(R.string.invalid_email));
            isValid = false;
        }

        return isValid;
    }

    private void clearErrors() {
        tilStudentId.setError(null);
        tilFullName.setError(null);
        tilCourse.setError(null);
        tilYear.setError(null);
        tilSection.setError(null);
        tilEmail.setError(null);
    }

    private void setLoading(boolean loading) {
        btnRegister.setEnabled(!loading);
        progressBar.setVisibility(loading ? View.VISIBLE : View.GONE);
        
        if (loading) {
            btnRegister.setText("");
        } else {
            btnRegister.setText(getString(R.string.register_button));
        }
    }

    private void showError(String message) {
        Toast.makeText(this, message, Toast.LENGTH_LONG).show();
    }

    private String getAndroidDeviceId() {
        return Settings.Secure.getString(getContentResolver(), Settings.Secure.ANDROID_ID);
    }
}
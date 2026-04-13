package com.quizapp.student.activities;

import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.google.android.material.button.MaterialButton;
import com.google.android.material.floatingactionbutton.FloatingActionButton;
import com.google.android.material.textfield.TextInputEditText;
import com.quizapp.student.R;
import com.quizapp.student.adapters.SubjectAdapter;
import com.quizapp.student.api.ApiClient;
import com.quizapp.student.api.ApiService;
import com.quizapp.student.models.Student;
import com.quizapp.student.models.Subject;
import com.quizapp.student.utils.PreferenceManager;
import com.quizapp.student.utils.SecurityManager;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class MainActivity extends AppCompatActivity implements SubjectAdapter.OnSubjectClickListener {
    
    private RecyclerView recyclerViewSubjects;
    private SubjectAdapter subjectAdapter;
    private FloatingActionButton fabJoinClass;
    private PreferenceManager preferenceManager;
    private SecurityManager securityManager;
    private ApiService apiService;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Initialize preferences first
        preferenceManager = new PreferenceManager(this);

        // Restore auth token
        String savedToken = preferenceManager.getToken();
        if (savedToken != null && !savedToken.isEmpty()) {
            ApiClient.setAuthToken(savedToken);
        }

        // Check if user is logged in
        if (!preferenceManager.isLoggedIn()) {
            startActivity(new Intent(this, LoginActivity.class));
            finish();
            return;
        }

        // Initialize security after setContentView
        securityManager = new SecurityManager(this);
        securityManager.enableSecurityFeatures();

        initViews();
        setupRecyclerView();
        loadSubjects();
    }
    
    private void initViews() {
        recyclerViewSubjects = findViewById(R.id.recyclerViewSubjects);
        fabJoinClass = findViewById(R.id.fabJoinClass);
        
        // Initialize welcome text
        TextView tvWelcome = findViewById(R.id.tvWelcome);
        TextView tvStudentName = findViewById(R.id.tvStudentName);
        
        String studentName = preferenceManager.getStudentName();
        if (studentName != null && !studentName.isEmpty()) {
            tvStudentName.setText(studentName);
        } else {
            tvStudentName.setText("Student");
        }
        
        apiService = ApiClient.getClient().create(ApiService.class);
        
        fabJoinClass.setOnClickListener(v -> showJoinClassDialog());
    }
    
    private void setupRecyclerView() {
        subjectAdapter = new SubjectAdapter(new ArrayList<>(), this);
        recyclerViewSubjects.setLayoutManager(new LinearLayoutManager(this));
        recyclerViewSubjects.setAdapter(subjectAdapter);
    }
    
    private void loadSubjects() {
        Call<ApiService.MyClassesResponse> call = apiService.getMyClasses();
        call.enqueue(new Callback<ApiService.MyClassesResponse>() {
            @Override
            public void onResponse(Call<ApiService.MyClassesResponse> call, Response<ApiService.MyClassesResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    List<Subject> classes = response.body().classes;
                    if (classes == null) classes = new ArrayList<>();

                    subjectAdapter.updateSubjects(classes);

                    LinearLayout layoutEmptyState = findViewById(R.id.layoutEmptyState);
                    if (classes.isEmpty()) {
                        layoutEmptyState.setVisibility(View.VISIBLE);
                        recyclerViewSubjects.setVisibility(View.GONE);
                    } else {
                        layoutEmptyState.setVisibility(View.GONE);
                        recyclerViewSubjects.setVisibility(View.VISIBLE);
                    }
                } else {
                    Toast.makeText(MainActivity.this, "Failed to load classes", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<ApiService.MyClassesResponse> call, Throwable t) {
                Toast.makeText(MainActivity.this, "Network error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }
    
    private void showJoinClassDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        View dialogView = getLayoutInflater().inflate(R.layout.dialog_join_class, null);
        
        TextInputEditText etClassCode = dialogView.findViewById(R.id.etClassCode);
        MaterialButton btnJoin = dialogView.findViewById(R.id.btnJoin);
        MaterialButton btnCancel = dialogView.findViewById(R.id.btnCancel);
        
        AlertDialog dialog = builder.setView(dialogView).create();
        
        btnJoin.setOnClickListener(v -> {
            String classCode = etClassCode.getText().toString().trim();
            if (!TextUtils.isEmpty(classCode)) {
                joinClass(classCode);
                dialog.dismiss();
            } else {
                Toast.makeText(this, "Please enter a class code", Toast.LENGTH_SHORT).show();
            }
        });
        
        btnCancel.setOnClickListener(v -> dialog.dismiss());
        
        dialog.show();
    }
    
    private void joinClass(String classCode) {
        ApiService.JoinClassRequest request = new ApiService.JoinClassRequest(classCode);

        Call<ApiService.ApiResponse<String>> call = apiService.joinClass(request);
        call.enqueue(new Callback<ApiService.ApiResponse<String>>() {
            @Override
            public void onResponse(Call<ApiService.ApiResponse<String>> call, Response<ApiService.ApiResponse<String>> response) {
                if (response.isSuccessful()) {
                    // Show success dialog
                    new androidx.appcompat.app.AlertDialog.Builder(MainActivity.this)
                        .setTitle("✅ Request Submitted!")
                        .setMessage("Your enrollment request has been sent successfully.\n\nPlease wait for your teacher to approve your request before you can access the class.")
                        .setPositiveButton("OK", null)
                        .show();
                    loadSubjects();
                } else {
                    try {
                        String errorBody = response.errorBody() != null ? response.errorBody().string() : "";
                        if (errorBody.contains("\"message\"")) {
                            int start = errorBody.indexOf("\"message\"") + 11;
                            int end = errorBody.indexOf("\"", start + 1);
                            if (end > start) {
                                Toast.makeText(MainActivity.this, errorBody.substring(start, end), Toast.LENGTH_LONG).show();
                                return;
                            }
                        }
                        Toast.makeText(MainActivity.this, getString(R.string.error_join_class), Toast.LENGTH_SHORT).show();
                    } catch (Exception e) {
                        Toast.makeText(MainActivity.this, getString(R.string.error_join_class), Toast.LENGTH_SHORT).show();
                    }
                }
            }

            @Override
            public void onFailure(Call<ApiService.ApiResponse<String>> call, Throwable t) {
                Toast.makeText(MainActivity.this, "Network error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }
    
    @Override
    public void onSubjectClick(Subject subject) {
        Intent intent = new Intent(this, SubjectDetailActivity.class);
        // Pass the class ID (used to fetch quizzes) and display name
        intent.putExtra("subject_id", subject.getId());
        intent.putExtra("subject_name", subject.getCourseCode() + " - " + subject.getCourseDescription());
        startActivity(intent);
    }
    
    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.main_menu, menu);
        return true;
    }
    
    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        int id = item.getItemId();
        
        if (id == R.id.action_profile) {
            startActivity(new Intent(this, ProfileActivity.class));
            return true;
        } else if (id == R.id.action_leaderboard) {
            startActivity(new Intent(this, LeaderboardActivity.class));
            return true;
        } else if (id == R.id.action_logout) {
            logout();
            return true;
        }
        
        return super.onOptionsItemSelected(item);
    }
    
    private void logout() {
        preferenceManager.clearSession();
        startActivity(new Intent(this, LoginActivity.class));
        finish();
    }
    
    @Override
    protected void onResume() {
        super.onResume();
        securityManager.checkSecurityViolations();
    }
    
    @Override
    public void onBackPressed() {
        // Prevent back button during normal operation
        moveTaskToBack(true);
    }
}
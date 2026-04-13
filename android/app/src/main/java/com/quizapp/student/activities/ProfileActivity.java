package com.quizapp.student.activities;

import android.os.Bundle;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;

import com.quizapp.student.R;
import com.quizapp.student.utils.PreferenceManager;

public class ProfileActivity extends AppCompatActivity {

    private TextView tvStudentId, tvFullName, tvCourse, tvYear, tvSection;
    private PreferenceManager preferenceManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_profile);

        preferenceManager = new PreferenceManager(this);
        initViews();
        loadProfile();
    }

    private void initViews() {
        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        getSupportActionBar().setTitle("Profile");
        
        tvStudentId = findViewById(R.id.tvStudentId);
        tvFullName = findViewById(R.id.tvFullName);
        tvCourse = findViewById(R.id.tvCourse);
        tvYear = findViewById(R.id.tvYear);
        tvSection = findViewById(R.id.tvSection);
    }

    private void loadProfile() {
        preferenceManager = new PreferenceManager(this);
        
        tvStudentId.setText(preferenceManager.getStudentId());
        tvFullName.setText(preferenceManager.getStudentName());
        tvCourse.setText(preferenceManager.getStudentCourse());
        tvYear.setText(preferenceManager.getStudentYear());
        tvSection.setText(preferenceManager.getStudentSection());
    }

    @Override
    public boolean onSupportNavigateUp() {
        onBackPressed();
        return true;
    }
}
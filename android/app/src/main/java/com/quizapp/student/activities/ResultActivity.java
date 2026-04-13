package com.quizapp.student.activities;

import android.content.Intent;
import android.os.Bundle;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

import com.google.android.material.button.MaterialButton;
import com.quizapp.student.R;
import com.quizapp.student.models.QuizResult;

public class ResultActivity extends AppCompatActivity {

    private TextView tvScore, tvCorrectAnswers, tvTotalQuestions, tvPercentage, tvTimeSpent;
    private MaterialButton btnBackToHome, btnViewLeaderboard;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_result);

        initViews();
        displayResults();
        setupClickListeners();
    }

    private void initViews() {
        tvScore = findViewById(R.id.tvScore);
        tvCorrectAnswers = findViewById(R.id.tvCorrectAnswers);
        tvTotalQuestions = findViewById(R.id.tvTotalQuestions);
        tvPercentage = findViewById(R.id.tvPercentage);
        tvTimeSpent = findViewById(R.id.tvTimeSpent);
        btnBackToHome = findViewById(R.id.btnBackToHome);
        btnViewLeaderboard = findViewById(R.id.btnViewLeaderboard);
    }

    private void displayResults() {
        QuizResult result = (QuizResult) getIntent().getSerializableExtra("quiz_result");

        if (result != null) {
            tvScore.setText(String.valueOf(result.getScore()));
            tvCorrectAnswers.setText(String.valueOf(result.getScore()));
            tvTotalQuestions.setText(String.valueOf(result.getTotalPoints()));
            tvPercentage.setText(result.getFormattedPercentage());
            tvTimeSpent.setText(result.getFormattedTimeSpent());
        }
    }

    private void setupClickListeners() {
        btnBackToHome.setOnClickListener(v -> {
            Intent intent = new Intent(this, MainActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
            startActivity(intent);
            finish();
        });

        btnViewLeaderboard.setOnClickListener(v -> {
            startActivity(new Intent(this, LeaderboardActivity.class));
        });
    }

    @Override
    public void onBackPressed() {
        // Go back to main activity
        Intent intent = new Intent(this, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
        startActivity(intent);
        finish();
    }
}
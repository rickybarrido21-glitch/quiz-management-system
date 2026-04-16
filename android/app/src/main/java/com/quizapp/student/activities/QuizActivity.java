package com.quizapp.student.activities;

import android.app.AlertDialog;
import android.content.Intent;
import android.os.Bundle;
import android.os.CountDownTimer;
import android.os.Handler;
import android.provider.Settings;
import android.view.View;
import android.view.WindowManager;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.google.android.material.button.MaterialButton;
import com.google.android.material.card.MaterialCardView;
import com.quizapp.student.R;
import com.quizapp.student.api.ApiClient;
import com.quizapp.student.api.ApiService;
import com.quizapp.student.models.Question;
import com.quizapp.student.models.Quiz;
import com.quizapp.student.models.QuizResult;
import com.quizapp.student.utils.PreferenceManager;
import com.quizapp.student.utils.SecurityManager;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class QuizActivity extends AppCompatActivity {

    private TextView tvQuizTitle, tvQuestionProgress, tvTimer, tvQuestion;
    private ImageView ivQuestionImage;
    private LinearLayout layoutOptions;
    private MaterialButton btnPrevious, btnNext;
    private ProgressBar progressBar;
    
    private Quiz quiz;
    private List<Question> questions;
    private Map<String, String> answers;
    private int currentQuestionIndex = 0;
    private CountDownTimer timer;
    private long timeRemainingInMillis;
    private int totalTimeSpent = 0;
    
    private SecurityManager securityManager;
    private PreferenceManager preferenceManager;
    private ApiService apiService;
    
    private Handler securityCheckHandler;
    private Runnable securityCheckRunnable;
    private boolean isQuizActive = false;
    private int securityViolationCount = 0;
    private static final int MAX_VIOLATIONS = 3;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Set content view first
        setContentView(R.layout.activity_quiz);

        // Initialize all dependencies before using them
        preferenceManager = new PreferenceManager(this);
        apiService = ApiClient.getClient().create(ApiService.class);
        answers = new HashMap<>();

        // Initialize security after setContentView
        securityManager = new SecurityManager(this);
        securityManager.enableQuizMode();

        initViews();
        setupSecurity();
        loadQuizData();
    }

    private void initViews() {
        tvQuizTitle = findViewById(R.id.tvQuizTitle);
        tvQuestionProgress = findViewById(R.id.tvQuestionProgress);
        tvTimer = findViewById(R.id.tvTimer);
        tvQuestion = findViewById(R.id.tvQuestion);
        ivQuestionImage = findViewById(R.id.ivQuestionImage);
        layoutOptions = findViewById(R.id.layoutOptions);
        btnPrevious = findViewById(R.id.btnPrevious);
        btnNext = findViewById(R.id.btnNext);
        progressBar = findViewById(R.id.progressBar);
        
        btnPrevious.setOnClickListener(v -> navigateToPrevious());
        btnNext.setOnClickListener(v -> navigateToNext());
    }

    private void setupSecurity() {
        // Prevent screenshots and screen recording
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_SECURE, 
                           WindowManager.LayoutParams.FLAG_SECURE);
        
        // Keep screen on during quiz
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        
        // Start security monitoring
        startSecurityMonitoring();
        isQuizActive = true;
    }

    private void startSecurityMonitoring() {
        securityCheckHandler = new Handler();
        securityCheckRunnable = new Runnable() {
            @Override
            public void run() {
                if (isQuizActive) {
                    checkSecurityViolations();
                    securityCheckHandler.postDelayed(this, 2000); // Check every 2 seconds
                }
            }
        };
        securityCheckHandler.post(securityCheckRunnable);
    }

    private void checkSecurityViolations() {
        securityManager.checkSecurityViolations();
        
        // Additional checks can be added here
        // For example: check if app is in foreground, detect task switching, etc.
    }

    private void handleSecurityViolation(String violation) {
        securityViolationCount++;
        
        String message = "Security violation detected: " + violation + 
                        "\nViolations: " + securityViolationCount + "/" + MAX_VIOLATIONS;
        
        Toast.makeText(this, message, Toast.LENGTH_LONG).show();
        
        if (securityViolationCount >= MAX_VIOLATIONS) {
            terminateQuizForSecurity();
        }
    }

    private void terminateQuizForSecurity() {
        isQuizActive = false;
        
        new AlertDialog.Builder(this)
            .setTitle("Quiz Terminated")
            .setMessage("The quiz has been terminated due to multiple security violations.")
            .setCancelable(false)
            .setPositiveButton("OK", (dialog, which) -> {
                finish();
            })
            .show();
    }

    private void loadQuizData() {
        String quizId = getIntent().getStringExtra("quiz_id");
        String studentId = preferenceManager.getStudentId();
        
        if (quizId == null) {
            Toast.makeText(this, "Quiz not found", Toast.LENGTH_SHORT).show();
            finish();
            return;
        }

        Call<ApiService.QuizTakeResponse> call = apiService.getQuizForTaking(quizId, studentId);
        call.enqueue(new Callback<ApiService.QuizTakeResponse>() {
            @Override
            public void onResponse(Call<ApiService.QuizTakeResponse> call, Response<ApiService.QuizTakeResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    quiz = response.body().quiz;
                    questions = quiz.getQuestions();
                    
                    setupQuiz();
                    displayCurrentQuestion();
                } else {
                    Toast.makeText(QuizActivity.this, "Failed to load quiz", Toast.LENGTH_SHORT).show();
                    finish();
                }
            }

            @Override
            public void onFailure(Call<ApiService.QuizTakeResponse> call, Throwable t) {
                Toast.makeText(QuizActivity.this, "Network error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
                finish();
            }
        });
    }

    private void setupQuiz() {
        tvQuizTitle.setText(quiz.getTitle());
        
        // Setup timer — time limit is inside settings
        int timeLimitMinutes = (quiz.getSettings() != null) ? quiz.getSettings().getTimeLimit() : 15;
        timeRemainingInMillis = timeLimitMinutes * 60 * 1000L;
        startTimer();
        
        updateProgress();
    }

    private void startTimer() {
        timer = new CountDownTimer(timeRemainingInMillis, 1000) {
            @Override
            public void onTick(long millisUntilFinished) {
                timeRemainingInMillis = millisUntilFinished;
                updateTimerDisplay();
            }

            @Override
            public void onFinish() {
                // Time's up - auto submit
                submitQuiz();
            }
        }.start();
    }

    private void updateTimerDisplay() {
        int minutes = (int) (timeRemainingInMillis / 1000) / 60;
        int seconds = (int) (timeRemainingInMillis / 1000) % 60;
        
        String timeText = String.format("%02d:%02d", minutes, seconds);
        tvTimer.setText(timeText);
        
        // Change color when time is running low
        if (minutes < 5) {
            tvTimer.setTextColor(getResources().getColor(R.color.quiz_timer));
        }
    }

    private void displayCurrentQuestion() {
        if (questions == null || questions.isEmpty()) {
            return;
        }

        Question question = questions.get(currentQuestionIndex);
        
        tvQuestion.setText(question.getQuestion());
        tvQuestionProgress.setText("Question " + (currentQuestionIndex + 1) + " of " + questions.size());
        
        // Hide image by default
        ivQuestionImage.setVisibility(View.GONE);
        
        // Display options
        displayOptions(question);
        
        // Update navigation buttons
        btnPrevious.setEnabled(currentQuestionIndex > 0);
        btnNext.setText(currentQuestionIndex == questions.size() - 1 ? "Finish" : "Next");
        
        updateProgress();
    }

    private void displayOptions(Question question) {
        layoutOptions.removeAllViews();

        List<Question.Option> options = question.getOptions();
        if (options == null) return;

        String selectedAnswer = answers.get(question.getId());

        for (int i = 0; i < options.size(); i++) {
            MaterialCardView optionCard = createOptionCard(options.get(i).getText(), i, selectedAnswer);
            layoutOptions.addView(optionCard);
        }
    }

    private MaterialCardView createOptionCard(String optionText, int optionIndex, String selectedAnswer) {
        MaterialCardView card = new MaterialCardView(this);
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        );
        params.setMargins(0, 0, 0, 16);
        card.setLayoutParams(params);
        card.setRadius(12);
        card.setCardElevation(4);
        card.setClickable(true);
        card.setFocusable(true);
        
        TextView textView = new TextView(this);
        textView.setText((char)('A' + optionIndex) + ". " + optionText);
        textView.setPadding(24, 20, 24, 20);
        textView.setTextSize(16);
        textView.setTextColor(getResources().getColor(R.color.text_primary));
        
        // Check if this option is selected
        boolean isSelected = String.valueOf(optionIndex).equals(selectedAnswer);
        if (isSelected) {
            card.setCardBackgroundColor(getResources().getColor(R.color.quiz_selected));
            card.setStrokeColor(getResources().getColor(R.color.primary));
            card.setStrokeWidth(4);
        } else {
            card.setCardBackgroundColor(getResources().getColor(R.color.surface));
            card.setStrokeColor(getResources().getColor(R.color.text_hint));
            card.setStrokeWidth(2);
        }
        
        card.addView(textView);
        
        final int finalOptionIndex = optionIndex;
        card.setOnClickListener(v -> selectOption(finalOptionIndex));
        
        return card;
    }

    private void selectOption(int optionIndex) {
        Question currentQuestion = questions.get(currentQuestionIndex);
        answers.put(currentQuestion.getId(), String.valueOf(optionIndex));
        
        // Refresh the options display to show selection
        displayOptions(currentQuestion);
    }

    private void navigateToPrevious() {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            displayCurrentQuestion();
        }
    }

    private void navigateToNext() {
        if (currentQuestionIndex < questions.size() - 1) {
            currentQuestionIndex++;
            displayCurrentQuestion();
        } else {
            // This is the last question - show submit confirmation
            showSubmitConfirmation();
        }
    }

    private void showSubmitConfirmation() {
        int answeredCount = answers.size();
        int totalQuestions = questions.size();
        
        String message = "You have answered " + answeredCount + " out of " + totalQuestions + " questions.\n\n" +
                        "Are you sure you want to submit your quiz?";
        
        new AlertDialog.Builder(this)
            .setTitle("Submit Quiz")
            .setMessage(message)
            .setPositiveButton("Submit", (dialog, which) -> submitQuiz())
            .setNegativeButton("Review", null)
            .show();
    }

    private void submitQuiz() {
        isQuizActive = false;
        
        if (timer != null) {
            timer.cancel();
        }
        
        // Calculate time spent
        int timeLimitMinutes = (quiz.getSettings() != null) ? quiz.getSettings().getTimeLimit() : 15;
        long timeSpentMillis = (timeLimitMinutes * 60 * 1000L) - timeRemainingInMillis;
        totalTimeSpent = (int) (timeSpentMillis / 1000);
        
        // Prepare submission data
        List<ApiService.QuizAnswer> quizAnswers = new ArrayList<>();
        for (Map.Entry<String, String> entry : answers.entrySet()) {
            quizAnswers.add(new ApiService.QuizAnswer(entry.getKey(), entry.getValue(), 0));
        }
        
        Map<String, String> deviceInfo = new HashMap<>();
        deviceInfo.put("deviceId", getAndroidDeviceId());
        deviceInfo.put("securityViolations", String.valueOf(securityViolationCount));
        
        ApiService.QuizSubmissionRequest request = new ApiService.QuizSubmissionRequest(
            preferenceManager.getStudentId(),
            quizAnswers,
            totalTimeSpent,
            deviceInfo
        );
        
        Call<ApiService.QuizSubmitResponse> call = apiService.submitQuiz(quiz.getId(), request);
        call.enqueue(new Callback<ApiService.QuizSubmitResponse>() {
            @Override
            public void onResponse(Call<ApiService.QuizSubmitResponse> call, Response<ApiService.QuizSubmitResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    QuizResult result = response.body().result;
                    showResults(result);
                } else {
                    Toast.makeText(QuizActivity.this, "Failed to submit quiz", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<ApiService.QuizSubmitResponse> call, Throwable t) {
                Toast.makeText(QuizActivity.this, "Network error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void showResults(QuizResult result) {
        Intent intent = new Intent(this, ResultActivity.class);
        intent.putExtra("quiz_result", result);
        startActivity(intent);
        finish();
    }

    private void updateProgress() {
        if (questions != null && !questions.isEmpty()) {
            int progress = ((currentQuestionIndex + 1) * 100) / questions.size();
            progressBar.setProgress(progress);
        }
    }

    private String getAndroidDeviceId() {
        return Settings.Secure.getString(getContentResolver(), Settings.Secure.ANDROID_ID);
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (isQuizActive) {
            handleSecurityViolation("App switched to background");
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        isQuizActive = false;
        
        if (timer != null) {
            timer.cancel();
        }
        
        if (securityCheckHandler != null && securityCheckRunnable != null) {
            securityCheckHandler.removeCallbacks(securityCheckRunnable);
        }
        
        if (securityManager != null) {
            securityManager.disableQuizMode();
        }
    }

    @Override
    public void onBackPressed() {
        // Prevent back button during quiz
        if (isQuizActive) {
            new AlertDialog.Builder(this)
                .setTitle("Exit Quiz")
                .setMessage("Are you sure you want to exit? Your progress will be lost.")
                .setPositiveButton("Exit", (dialog, which) -> {
                    isQuizActive = false;
                    finish();
                })
                .setNegativeButton("Continue", null)
                .show();
        } else {
            super.onBackPressed();
        }
    }
}
package com.quizapp.student.activities;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.quizapp.student.R;
import com.quizapp.student.adapters.QuizAdapter;
import com.quizapp.student.api.ApiClient;
import com.quizapp.student.api.ApiService;
import com.quizapp.student.models.Quiz;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class SubjectDetailActivity extends AppCompatActivity implements QuizAdapter.OnQuizClickListener {

    private RecyclerView recyclerViewQuizzes;
    private QuizAdapter quizAdapter;
    private ApiService apiService;

    private String classId;
    private String className;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_subject_detail);

        classId = getIntent().getStringExtra("subject_id");
        className = getIntent().getStringExtra("subject_name");

        // Setup toolbar safely
        androidx.appcompat.widget.Toolbar toolbar = findViewById(R.id.toolbar);
        if (toolbar != null) {
            setSupportActionBar(toolbar);
            if (getSupportActionBar() != null) {
                getSupportActionBar().setDisplayHomeAsUpEnabled(true);
                getSupportActionBar().setTitle(className != null ? className : "Quizzes");
            }
        }

        // Init RecyclerView
        recyclerViewQuizzes = findViewById(R.id.recyclerViewQuizzes);
        quizAdapter = new QuizAdapter(new ArrayList<>(), this);
        recyclerViewQuizzes.setLayoutManager(new LinearLayoutManager(this));
        recyclerViewQuizzes.setAdapter(quizAdapter);

        // Init API
        apiService = ApiClient.getClient().create(ApiService.class);

        loadQuizzes();
    }

    private void loadQuizzes() {
        if (classId == null || classId.isEmpty()) {
            Toast.makeText(this, "Class not found", Toast.LENGTH_SHORT).show();
            finish();
            return;
        }

        Call<List<Quiz>> call = apiService.getQuizzes(classId);
        call.enqueue(new Callback<List<Quiz>>() {
            @Override
            public void onResponse(Call<List<Quiz>> call, Response<List<Quiz>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    List<Quiz> quizzes = response.body();
                    quizAdapter.updateQuizzes(quizzes);

                    if (quizzes.isEmpty()) {
                        Toast.makeText(SubjectDetailActivity.this,
                            "No quizzes available for this class", Toast.LENGTH_SHORT).show();
                    }
                } else {
                    Toast.makeText(SubjectDetailActivity.this,
                        "Failed to load quizzes", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<List<Quiz>> call, Throwable t) {
                Toast.makeText(SubjectDetailActivity.this,
                    "Network error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    @Override
    public void onQuizClick(Quiz quiz) {
        Intent intent = new Intent(this, QuizActivity.class);
        intent.putExtra("quiz_id", quiz.getId());
        intent.putExtra("quiz_title", quiz.getTitle());
        startActivity(intent);
    }

    @Override
    public boolean onSupportNavigateUp() {
        onBackPressed();
        return true;
    }
}

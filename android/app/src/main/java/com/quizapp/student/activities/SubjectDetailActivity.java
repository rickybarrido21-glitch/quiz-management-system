package com.quizapp.student.activities;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
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
    
    private String subjectId;  // this is actually the classId
    private String subjectName;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_subject_detail);

        // Init apiService FIRST before anything else
        apiService = ApiClient.getClient().create(ApiService.class);

        getIntentData();
        initViews();
        setupRecyclerView();
        loadQuizzes();
    }

    private void getIntentData() {
        subjectId = getIntent().getStringExtra("subject_id");
        subjectName = getIntent().getStringExtra("subject_name");
    }

    private void initViews() {
        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        getSupportActionBar().setTitle(subjectName != null ? subjectName : "Subject");
        
        recyclerViewQuizzes = findViewById(R.id.recyclerViewQuizzes);
    }

    private void setupRecyclerView() {
        quizAdapter = new QuizAdapter(new ArrayList<>(), this);
        recyclerViewQuizzes.setLayoutManager(new LinearLayoutManager(this));
        recyclerViewQuizzes.setAdapter(quizAdapter);
    }

    private void loadQuizzes() {
        if (subjectId == null) {
            Toast.makeText(this, "Subject not found", Toast.LENGTH_SHORT).show();
            finish();
            return;
        }

        Call<List<Quiz>> call = apiService.getQuizzes(subjectId);
        call.enqueue(new Callback<List<Quiz>>() {
            @Override
            public void onResponse(Call<List<Quiz>> call, Response<List<Quiz>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    quizAdapter.updateQuizzes(response.body());
                } else {
                    Toast.makeText(SubjectDetailActivity.this, "Failed to load quizzes", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<List<Quiz>> call, Throwable t) {
                Toast.makeText(SubjectDetailActivity.this, "Network error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
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
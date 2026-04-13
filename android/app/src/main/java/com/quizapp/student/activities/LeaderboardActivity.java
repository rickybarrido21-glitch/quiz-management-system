package com.quizapp.student.activities;

import android.os.Bundle;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.quizapp.student.R;
import com.quizapp.student.adapters.LeaderboardAdapter;
import com.quizapp.student.api.ApiClient;
import com.quizapp.student.api.ApiService;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class LeaderboardActivity extends AppCompatActivity {

    private RecyclerView recyclerViewLeaderboard;
    private LeaderboardAdapter adapter;
    private ApiService apiService;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_leaderboard);

        initViews();
        setupRecyclerView();
        loadLeaderboard();
        
        apiService = ApiClient.getClient().create(ApiService.class);
    }

    private void initViews() {
        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        getSupportActionBar().setTitle("Leaderboard");
        
        recyclerViewLeaderboard = findViewById(R.id.recyclerViewLeaderboard);
    }

    private void setupRecyclerView() {
        adapter = new LeaderboardAdapter(new ArrayList<>());
        recyclerViewLeaderboard.setLayoutManager(new LinearLayoutManager(this));
        recyclerViewLeaderboard.setAdapter(adapter);
    }

    private void loadLeaderboard() {
        // For now, show a placeholder message
        Toast.makeText(this, "Leaderboard feature coming soon!", Toast.LENGTH_SHORT).show();
        
        // TODO: Implement actual leaderboard loading
        /*
        Call<List<ApiService.LeaderboardEntry>> call = apiService.getGlobalLeaderboard(null, 50);
        call.enqueue(new Callback<List<ApiService.LeaderboardEntry>>() {
            @Override
            public void onResponse(Call<List<ApiService.LeaderboardEntry>> call, Response<List<ApiService.LeaderboardEntry>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    adapter.updateLeaderboard(response.body());
                }
            }

            @Override
            public void onFailure(Call<List<ApiService.LeaderboardEntry>> call, Throwable t) {
                Toast.makeText(LeaderboardActivity.this, "Failed to load leaderboard", Toast.LENGTH_SHORT).show();
            }
        });
        */
    }

    @Override
    public boolean onSupportNavigateUp() {
        onBackPressed();
        return true;
    }
}
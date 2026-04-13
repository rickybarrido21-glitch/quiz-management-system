package com.quizapp.student.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.quizapp.student.R;
import com.quizapp.student.api.ApiService;

import java.util.List;

public class LeaderboardAdapter extends RecyclerView.Adapter<LeaderboardAdapter.LeaderboardViewHolder> {

    private List<ApiService.LeaderboardEntry> entries;

    public LeaderboardAdapter(List<ApiService.LeaderboardEntry> entries) {
        this.entries = entries;
    }

    @NonNull
    @Override
    public LeaderboardViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_leaderboard, parent, false);
        return new LeaderboardViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull LeaderboardViewHolder holder, int position) {
        ApiService.LeaderboardEntry entry = entries.get(position);
        holder.bind(entry, position + 1);
    }

    @Override
    public int getItemCount() {
        return entries.size();
    }

    public void updateLeaderboard(List<ApiService.LeaderboardEntry> newEntries) {
        this.entries = newEntries;
        notifyDataSetChanged();
    }

    static class LeaderboardViewHolder extends RecyclerView.ViewHolder {
        private TextView tvRank, tvStudentName, tvStudentInfo, tvScore;

        public LeaderboardViewHolder(@NonNull View itemView) {
            super(itemView);
            tvRank = itemView.findViewById(R.id.tvRank);
            tvStudentName = itemView.findViewById(R.id.tvStudentName);
            tvStudentInfo = itemView.findViewById(R.id.tvStudentInfo);
            tvScore = itemView.findViewById(R.id.tvScore);
        }

        public void bind(ApiService.LeaderboardEntry entry, int rank) {
            tvRank.setText(String.valueOf(rank));
            tvStudentName.setText(entry.student.getFullName());
            tvStudentInfo.setText(entry.student.getCourse() + " " + entry.student.getYear());
            tvScore.setText(String.format("%.1f%%", entry.averagePercentage));
        }
    }
}
package com.quizapp.student.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.quizapp.student.R;
import com.quizapp.student.models.Quiz;

import java.util.List;

public class QuizAdapter extends RecyclerView.Adapter<QuizAdapter.QuizViewHolder> {

    private List<Quiz> quizzes;
    private OnQuizClickListener listener;

    public interface OnQuizClickListener {
        void onQuizClick(Quiz quiz);
    }

    public QuizAdapter(List<Quiz> quizzes, OnQuizClickListener listener) {
        this.quizzes = quizzes;
        this.listener = listener;
    }

    @NonNull
    @Override
    public QuizViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_quiz, parent, false);
        return new QuizViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull QuizViewHolder holder, int position) {
        Quiz quiz = quizzes.get(position);
        holder.bind(quiz);
    }

    @Override
    public int getItemCount() {
        return quizzes.size();
    }

    public void updateQuizzes(List<Quiz> newQuizzes) {
        this.quizzes = newQuizzes;
        notifyDataSetChanged();
    }

    class QuizViewHolder extends RecyclerView.ViewHolder {
        private TextView tvQuizTitle, tvQuizDescription, tvQuestionCount, tvTimeLimit, tvDueDate;

        public QuizViewHolder(@NonNull View itemView) {
            super(itemView);
            
            tvQuizTitle = itemView.findViewById(R.id.tvQuizTitle);
            tvQuizDescription = itemView.findViewById(R.id.tvQuizDescription);
            tvQuestionCount = itemView.findViewById(R.id.tvQuestionCount);
            tvTimeLimit = itemView.findViewById(R.id.tvTimeLimit);
            tvDueDate = itemView.findViewById(R.id.tvDueDate);

            itemView.setOnClickListener(v -> {
                int position = getAdapterPosition();
                if (position != RecyclerView.NO_POSITION && listener != null) {
                    listener.onQuizClick(quizzes.get(position));
                }
            });
        }

        public void bind(Quiz quiz) {
            tvQuizTitle.setText(quiz.getTitle() != null ? quiz.getTitle() : "");
            tvQuizDescription.setText(quiz.getDescription() != null ? quiz.getDescription() : "No description");

            int questionCount = quiz.getQuestions() != null ? quiz.getQuestions().size() : 0;
            tvQuestionCount.setText(questionCount + " questions");

            // Time limit is inside settings
            int timeLimit = (quiz.getSettings() != null) ? quiz.getSettings().getTimeLimit() : 0;
            tvTimeLimit.setText(timeLimit > 0 ? timeLimit + " minutes" : "No time limit");

            // Use endDate as due date
            if (quiz.getEndDate() != null && !quiz.getEndDate().isEmpty()) {
                tvDueDate.setText("Due: " + quiz.getEndDate().substring(0, 10));
            } else {
                tvDueDate.setText("No due date");
            }
        }
    }
}
package com.quizapp.student.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.quizapp.student.R;
import com.quizapp.student.models.Subject;

import java.util.List;

public class SubjectAdapter extends RecyclerView.Adapter<SubjectAdapter.SubjectViewHolder> {

    private List<Subject> subjects;
    private OnSubjectClickListener listener;

    public interface OnSubjectClickListener {
        void onSubjectClick(Subject subject);
    }

    public SubjectAdapter(List<Subject> subjects, OnSubjectClickListener listener) {
        this.subjects = subjects;
        this.listener = listener;
    }

    @NonNull
    @Override
    public SubjectViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_subject, parent, false);
        return new SubjectViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull SubjectViewHolder holder, int position) {
        Subject subject = subjects.get(position);
        holder.bind(subject);
    }

    @Override
    public int getItemCount() {
        return subjects.size();
    }

    public void updateSubjects(List<Subject> newSubjects) {
        this.subjects = newSubjects;
        notifyDataSetChanged();
    }

    class SubjectViewHolder extends RecyclerView.ViewHolder {
        private TextView tvSubjectName;
        private TextView tvSubjectCode;
        private TextView tvQuizCount;
        private ImageView ivSubjectIcon;

        public SubjectViewHolder(@NonNull View itemView) {
            super(itemView);
            
            tvSubjectName = itemView.findViewById(R.id.tvSubjectName);
            tvSubjectCode = itemView.findViewById(R.id.tvSubjectCode);
            tvQuizCount = itemView.findViewById(R.id.tvQuizCount);
            ivSubjectIcon = itemView.findViewById(R.id.ivSubjectIcon);

            itemView.setOnClickListener(v -> {
                int position = getAdapterPosition();
                if (position != RecyclerView.NO_POSITION && listener != null) {
                    listener.onSubjectClick(subjects.get(position));
                }
            });
        }

        public void bind(Subject subject) {
            tvSubjectName.setText(subject.getName() != null ? subject.getName() : "");
            tvSubjectCode.setText(subject.getCode() != null ? subject.getCode() : subject.getClassCode());
            tvQuizCount.setText("Tap to view quizzes");
            
            // Set subject icon based on subject type or use default
            ivSubjectIcon.setImageResource(getSubjectIcon(subject.getName()));
        }

        private int getSubjectIcon(String subjectName) {
            // Return different icons based on subject name
            if (subjectName != null) {
                String name = subjectName.toLowerCase();
                if (name.contains("math") || name.contains("calculus") || name.contains("algebra")) {
                    return R.drawable.ic_math;
                } else if (name.contains("science") || name.contains("physics") || name.contains("chemistry")) {
                    return R.drawable.ic_science;
                } else if (name.contains("computer") || name.contains("programming") || name.contains("cs")) {
                    return R.drawable.ic_computer;
                } else if (name.contains("english") || name.contains("literature")) {
                    return R.drawable.ic_book;
                }
            }
            return R.drawable.ic_subject; // Default icon
        }
    }
}
package com.quizapp.student.models;

import com.google.gson.annotations.SerializedName;
import java.io.Serializable;
import java.util.List;

public class QuizResult implements Serializable {
    @SerializedName("_id")
    private String id;
    
    @SerializedName("quiz")
    private Quiz quiz;
    
    @SerializedName("student")
    private Student student;
    
    @SerializedName("answers")
    private List<Answer> answers;
    
    @SerializedName("score")
    private int score;
    
    @SerializedName("totalPoints")
    private int totalPoints;
    
    @SerializedName("percentage")
    private double percentage;
    
    @SerializedName("timeSpent")
    private int timeSpent;
    
    @SerializedName("startedAt")
    private String startedAt;
    
    @SerializedName("completedAt")
    private String completedAt;
    
    @SerializedName("isSubmitted")
    private boolean isSubmitted;

    // Constructors
    public QuizResult() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Quiz getQuiz() { return quiz; }
    public void setQuiz(Quiz quiz) { this.quiz = quiz; }

    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }

    public List<Answer> getAnswers() { return answers; }
    public void setAnswers(List<Answer> answers) { this.answers = answers; }

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }

    public int getTotalPoints() { return totalPoints; }
    public void setTotalPoints(int totalPoints) { this.totalPoints = totalPoints; }

    public double getPercentage() { return percentage; }
    public void setPercentage(double percentage) { this.percentage = percentage; }

    public int getTimeSpent() { return timeSpent; }
    public void setTimeSpent(int timeSpent) { this.timeSpent = timeSpent; }

    public String getStartedAt() { return startedAt; }
    public void setStartedAt(String startedAt) { this.startedAt = startedAt; }

    public String getCompletedAt() { return completedAt; }
    public void setCompletedAt(String completedAt) { this.completedAt = completedAt; }

    public boolean isSubmitted() { return isSubmitted; }
    public void setSubmitted(boolean submitted) { isSubmitted = submitted; }

    // Helper methods
    public String getFormattedScore() {
        return score + "/" + totalPoints;
    }

    public String getFormattedPercentage() {
        return String.format("%.1f%%", percentage);
    }

    public String getFormattedTimeSpent() {
        int minutes = timeSpent / 60;
        int seconds = timeSpent % 60;
        return String.format("%d:%02d", minutes, seconds);
    }

    public boolean isPassed(int passingScore) {
        return percentage >= passingScore;
    }

    public String getGrade() {
        if (percentage >= 90) return "A";
        else if (percentage >= 80) return "B";
        else if (percentage >= 70) return "C";
        else if (percentage >= 60) return "D";
        else return "F";
    }

    public static class Answer {
        @SerializedName("questionId")
        private String questionId;
        
        @SerializedName("answer")
        private String answer;
        
        @SerializedName("isCorrect")
        private boolean isCorrect;
        
        @SerializedName("points")
        private int points;
        
        @SerializedName("timeSpent")
        private int timeSpent;

        // Constructors
        public Answer() {}

        public Answer(String questionId, String answer, int timeSpent) {
            this.questionId = questionId;
            this.answer = answer;
            this.timeSpent = timeSpent;
        }

        // Getters and Setters
        public String getQuestionId() { return questionId; }
        public void setQuestionId(String questionId) { this.questionId = questionId; }

        public String getAnswer() { return answer; }
        public void setAnswer(String answer) { this.answer = answer; }

        public boolean isCorrect() { return isCorrect; }
        public void setCorrect(boolean correct) { isCorrect = correct; }

        public int getPoints() { return points; }
        public void setPoints(int points) { this.points = points; }

        public int getTimeSpent() { return timeSpent; }
        public void setTimeSpent(int timeSpent) { this.timeSpent = timeSpent; }
    }
}
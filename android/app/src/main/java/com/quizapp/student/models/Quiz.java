package com.quizapp.student.models;

import com.google.gson.annotations.SerializedName;
import java.util.List;

public class Quiz {
    @SerializedName("_id")
    private String id;
    
    @SerializedName("title")
    private String title;
    
    @SerializedName("description")
    private String description;
    
    @SerializedName("subject")
    private Subject subject;
    
    @SerializedName("questions")
    private List<Question> questions;
    
    @SerializedName("settings")
    private QuizSettings settings;
    
    @SerializedName("isActive")
    private boolean isActive;

    @SerializedName("isCompleted")
    private boolean isCompleted;

    @SerializedName("startDate")
    private String startDate;
    
    @SerializedName("endDate")
    private String endDate;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Subject getSubject() { return subject; }
    public void setSubject(Subject subject) { this.subject = subject; }

    public List<Question> getQuestions() { return questions; }
    public void setQuestions(List<Question> questions) { this.questions = questions; }

    public QuizSettings getSettings() { return settings; }
    public void setSettings(QuizSettings settings) { this.settings = settings; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public boolean isCompleted() { return isCompleted; }
    public void setCompleted(boolean completed) { isCompleted = completed; }

    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }

    public String getEndDate() { return endDate; }
    public void setEndDate(String endDate) { this.endDate = endDate; }

    public static class QuizSettings {
        @SerializedName("timeLimit")
        private int timeLimit;
        
        @SerializedName("randomizeQuestions")
        private boolean randomizeQuestions;
        
        @SerializedName("shuffleChoices")
        private boolean shuffleChoices;
        
        @SerializedName("showResults")
        private boolean showResults;
        
        @SerializedName("allowRetake")
        private boolean allowRetake;
        
        @SerializedName("passingScore")
        private int passingScore;

        // Getters and Setters
        public int getTimeLimit() { return timeLimit; }
        public void setTimeLimit(int timeLimit) { this.timeLimit = timeLimit; }

        public boolean isRandomizeQuestions() { return randomizeQuestions; }
        public void setRandomizeQuestions(boolean randomizeQuestions) { this.randomizeQuestions = randomizeQuestions; }

        public boolean isShuffleChoices() { return shuffleChoices; }
        public void setShuffleChoices(boolean shuffleChoices) { this.shuffleChoices = shuffleChoices; }

        public boolean isShowResults() { return showResults; }
        public void setShowResults(boolean showResults) { this.showResults = showResults; }

        public boolean isAllowRetake() { return allowRetake; }
        public void setAllowRetake(boolean allowRetake) { this.allowRetake = allowRetake; }

        public int getPassingScore() { return passingScore; }
        public void setPassingScore(int passingScore) { this.passingScore = passingScore; }
    }
}
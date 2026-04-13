package com.quizapp.student.models;

import com.google.gson.annotations.SerializedName;
import java.util.List;

public class Question {
    @SerializedName("_id")
    private String id;
    
    @SerializedName("type")
    private String type;
    
    @SerializedName("question")
    private String question;
    
    @SerializedName("options")
    private List<Option> options;
    
    @SerializedName("correctAnswer")
    private String correctAnswer;
    
    @SerializedName("points")
    private int points;
    
    @SerializedName("explanation")
    private String explanation;

    // Question types constants
    public static final String TYPE_MULTIPLE_CHOICE = "multiple_choice";
    public static final String TYPE_TRUE_FALSE = "true_false";
    public static final String TYPE_FILL_BLANK = "fill_blank";
    public static final String TYPE_ESSAY = "essay";

    // Constructors
    public Question() {}

    public Question(String type, String question, int points) {
        this.type = type;
        this.question = question;
        this.points = points;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public List<Option> getOptions() { return options; }
    public void setOptions(List<Option> options) { this.options = options; }

    public String getCorrectAnswer() { return correctAnswer; }
    public void setCorrectAnswer(String correctAnswer) { this.correctAnswer = correctAnswer; }

    public int getPoints() { return points; }
    public void setPoints(int points) { this.points = points; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    // Helper methods
    public boolean isMultipleChoice() {
        return TYPE_MULTIPLE_CHOICE.equals(type);
    }

    public boolean isTrueFalse() {
        return TYPE_TRUE_FALSE.equals(type);
    }

    public boolean isFillBlank() {
        return TYPE_FILL_BLANK.equals(type);
    }

    public boolean isEssay() {
        return TYPE_ESSAY.equals(type);
    }

    public static class Option {
        @SerializedName("text")
        private String text;
        
        @SerializedName("isCorrect")
        private boolean isCorrect;

        // Constructors
        public Option() {}

        public Option(String text) {
            this.text = text;
        }

        public Option(String text, boolean isCorrect) {
            this.text = text;
            this.isCorrect = isCorrect;
        }

        // Getters and Setters
        public String getText() { return text; }
        public void setText(String text) { this.text = text; }

        public boolean isCorrect() { return isCorrect; }
        public void setCorrect(boolean correct) { isCorrect = correct; }

        @Override
        public String toString() {
            return text;
        }
    }
}
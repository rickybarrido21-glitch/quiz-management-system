package com.quizapp.student.models;

import com.google.gson.annotations.SerializedName;
import java.util.List;

public class Student {
    @SerializedName("_id")
    private String id;
    
    @SerializedName("studentId")
    private String studentId;
    
    @SerializedName("fullName")
    private String fullName;
    
    @SerializedName("course")
    private String course;
    
    @SerializedName("year")
    private String year;
    
    @SerializedName("section")
    private String section;
    
    @SerializedName("email")
    private String email;
    
    @SerializedName("subjects")
    private List<SubjectEnrollment> subjects;
    
    @SerializedName("isActive")
    private boolean isActive;
    
    @SerializedName("createdAt")
    private String createdAt;

    // Constructors
    public Student() {}

    public Student(String studentId, String fullName, String course, String year, String section) {
        this.studentId = studentId;
        this.fullName = fullName;
        this.course = course;
        this.year = year;
        this.section = section;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getCourse() { return course; }
    public void setCourse(String course) { this.course = course; }

    public String getYear() { return year; }
    public void setYear(String year) { this.year = year; }

    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public List<SubjectEnrollment> getSubjects() { return subjects; }
    public void setSubjects(List<SubjectEnrollment> subjects) { this.subjects = subjects; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public static class SubjectEnrollment {
        @SerializedName("subject")
        private Subject subject;
        
        @SerializedName("enrolledAt")
        private String enrolledAt;
        
        @SerializedName("isVerified")
        private boolean isVerified;

        // Getters and Setters
        public Subject getSubject() { return subject; }
        public void setSubject(Subject subject) { this.subject = subject; }

        public String getEnrolledAt() { return enrolledAt; }
        public void setEnrolledAt(String enrolledAt) { this.enrolledAt = enrolledAt; }

        public boolean isVerified() { return isVerified; }
        public void setVerified(boolean verified) { isVerified = verified; }
    }
}
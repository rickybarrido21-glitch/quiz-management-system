package com.quizapp.student.models;

import com.google.gson.annotations.SerializedName;

public class Subject {
    @SerializedName("_id")
    private String id;
    
    @SerializedName("name")
    private String name;
    
    @SerializedName("code")
    private String code;
    
    @SerializedName("description")
    private String description;
    
    @SerializedName("classCode")
    private String classCode;
    
    @SerializedName("teacher")
    private Teacher teacher;
    
    @SerializedName("schoolYear")
    private SchoolYear schoolYear;
    
    @SerializedName("semester")
    private String semester;
    
    @SerializedName("isActive")
    private boolean isActive;

    // Constructors
    public Subject() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getClassCode() { return classCode; }
    public void setClassCode(String classCode) { this.classCode = classCode; }

    public Teacher getTeacher() { return teacher; }
    public void setTeacher(Teacher teacher) { this.teacher = teacher; }

    public SchoolYear getSchoolYear() { return schoolYear; }
    public void setSchoolYear(SchoolYear schoolYear) { this.schoolYear = schoolYear; }

    public String getSemester() { return semester; }
    public void setSemester(String semester) { this.semester = semester; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public static class Teacher {
        @SerializedName("_id")
        private String id;
        
        @SerializedName("fullName")
        private String fullName;
        
        @SerializedName("email")
        private String email;

        // Getters and Setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }

    public static class SchoolYear {
        @SerializedName("_id")
        private String id;
        
        @SerializedName("year")
        private String year;

        // Getters and Setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getYear() { return year; }
        public void setYear(String year) { this.year = year; }
    }
}
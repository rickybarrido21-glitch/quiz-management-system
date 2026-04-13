package com.quizapp.student.models;

import com.google.gson.annotations.SerializedName;

public class Subject {
    @SerializedName("_id")
    private String id;

    // Fields from /students/my-classes response
    @SerializedName("id")
    private String classId;

    @SerializedName("courseCode")
    private String courseCode;

    @SerializedName("courseDescription")
    private String courseDescription;

    @SerializedName("year")
    private String year;

    @SerializedName("section")
    private String section;

    @SerializedName("classCode")
    private String classCode;

    @SerializedName("teacher")
    private String teacher;

    // Legacy fields
    @SerializedName("name")
    private String name;

    @SerializedName("code")
    private String code;

    @SerializedName("description")
    private String description;

    @SerializedName("isActive")
    private boolean isActive;

    public Subject() {}

    // Getters
    public String getId() { return id != null ? id : classId; }
    public void setId(String id) { this.id = id; }

    public String getCourseCode() { return courseCode; }
    public void setCourseCode(String courseCode) { this.courseCode = courseCode; }

    public String getCourseDescription() { return courseDescription; }
    public void setCourseDescription(String courseDescription) { this.courseDescription = courseDescription; }

    public String getYear() { return year; }
    public void setYear(String year) { this.year = year; }

    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }

    public String getClassCode() { return classCode; }
    public void setClassCode(String classCode) { this.classCode = classCode; }

    public String getTeacher() { return teacher; }
    public void setTeacher(String teacher) { this.teacher = teacher; }

    // getName returns courseCode for display in the adapter
    public String getName() { return courseCode != null ? courseCode : name; }
    public void setName(String name) { this.name = name; }

    public String getCode() { return courseDescription != null ? courseDescription : code; }
    public void setCode(String code) { this.code = code; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

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
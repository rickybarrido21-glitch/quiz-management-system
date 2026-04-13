package com.quizapp.student.models;

import com.google.gson.annotations.SerializedName;

public class Subject {

    @SerializedName("_id")
    private String id;

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

    @SerializedName("name")
    private String name;

    @SerializedName("code")
    private String code;

    @SerializedName("description")
    private String description;

    @SerializedName("isActive")
    private boolean isActive;

    public Subject() {}

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

    // getName returns courseCode for display in adapter
    public String getName() { return courseCode != null ? courseCode : name; }
    public void setName(String name) { this.name = name; }

    // getCode returns courseDescription for display in adapter
    public String getCode() { return courseDescription != null ? courseDescription : code; }
    public void setCode(String code) { this.code = code; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    // Keep getQuizzes returning null for adapter compatibility
    public java.util.List<Object> getQuizzes() { return null; }
}

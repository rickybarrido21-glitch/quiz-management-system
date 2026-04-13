package com.quizapp.student.api;

import com.quizapp.student.models.Quiz;
import com.quizapp.student.models.QuizResult;
import com.quizapp.student.models.Student;
import com.quizapp.student.models.Subject;

import java.util.List;
import java.util.Map;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.Path;
import retrofit2.http.Query;

public interface ApiService {
    
    // Student Authentication
    @POST("students/register")
    Call<ApiResponse<Student>> registerStudent(@Body StudentRegistrationRequest request);

    @POST("students/login")
    Call<StudentLoginResponse> loginStudent(@Body StudentLoginRequest request);

    class StudentLoginResponse {
        public String token;
        public Student student;
        public String message;
    }
    
    @GET("students/{studentId}")
    Call<Student> getStudentProfile(@Path("studentId") String studentId);
    
    // Class Enrollment
    @POST("students/enroll")
    Call<ApiService.ApiResponse<String>> joinClass(@Body JoinClassRequest request);

    class JoinClassRequest {
        public String classCode;
        public JoinClassRequest(String classCode) {
            this.classCode = classCode;
        }
    }
    
    // Quiz Management
    @GET("quizzes")
    Call<List<Quiz>> getQuizzes(@Query("subjectId") String subjectId);
    
    @GET("quizzes/{id}/take")
    Call<QuizTakeResponse> getQuizForTaking(@Path("id") String quizId, @Query("studentId") String studentId);
    
    @POST("quizzes/{id}/submit")
    Call<QuizSubmitResponse> submitQuiz(@Path("id") String quizId, @Body QuizSubmissionRequest request);
    
    @GET("quizzes/{id}/leaderboard")
    Call<List<QuizResult>> getQuizLeaderboard(@Path("id") String quizId, @Query("limit") int limit);
    
    // Results
    @GET("results/student/{studentId}")
    Call<ResultsResponse> getStudentResults(@Path("studentId") String studentId, 
                                          @Query("page") int page, 
                                          @Query("limit") int limit);
    
    @GET("results/leaderboard/global")
    Call<List<LeaderboardEntry>> getGlobalLeaderboard(@Query("subjectId") String subjectId, 
                                                     @Query("limit") int limit);

    // Request/Response Classes
    class StudentRegistrationRequest {
        public String studentId;
        public String fullName;
        public String course;
        public String year;
        public String section;
        public String email;
        public String deviceId;

        public StudentRegistrationRequest(String studentId, String fullName, String course, 
                                        String year, String section, String email, String deviceId) {
            this.studentId = studentId;
            this.fullName = fullName;
            this.course = course;
            this.year = year;
            this.section = section;
            this.email = email;
            this.deviceId = deviceId;
        }
    }

    class StudentLoginRequest {
        public String studentId;
        public String deviceId;

        public StudentLoginRequest(String studentId, String deviceId) {
            this.studentId = studentId;
            this.deviceId = deviceId;
        }
    }

    class JoinSubjectRequest {
        public String studentId;
        public String classCode;

        public JoinSubjectRequest(String studentId, String classCode) {
            this.studentId = studentId;
            this.classCode = classCode;
        }
    }

    class QuizSubmissionRequest {
        public String studentId;
        public List<QuizAnswer> answers;
        public int timeSpent;
        public Map<String, String> deviceInfo;

        public QuizSubmissionRequest(String studentId, List<QuizAnswer> answers, 
                                   int timeSpent, Map<String, String> deviceInfo) {
            this.studentId = studentId;
            this.answers = answers;
            this.timeSpent = timeSpent;
            this.deviceInfo = deviceInfo;
        }
    }

    class QuizAnswer {
        public String questionId;
        public String answer;
        public int timeSpent;

        public QuizAnswer(String questionId, String answer, int timeSpent) {
            this.questionId = questionId;
            this.answer = answer;
            this.timeSpent = timeSpent;
        }
    }

    class ApiResponse<T> {
        public String message;
        public T data;
        public boolean success;
        public T student;
        public String token;
    }

    class QuizTakeResponse {
        public Quiz quiz;
    }

    class QuizSubmitResponse {
        public String message;
        public QuizResult result;
    }

    class ResultsResponse {
        public List<QuizResult> results;
        public int totalPages;
        public int currentPage;
        public int total;
    }

    class LeaderboardEntry {
        public Student student;
        public int totalScore;
        public int totalPossible;
        public double averagePercentage;
        public int quizzesTaken;
        public double bestScore;
    }
}
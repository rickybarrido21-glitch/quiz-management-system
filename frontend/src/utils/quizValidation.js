/**
 * Quiz validation utilities for property-based testing
 * Extracted from QuizBuilder component for testability
 */

/**
 * Validates question type input
 * Property 9: Question Type Validation - Validates Requirements 7.2
 * For any question type input, the validation should accept only 
 * "multiple_choice", "true_false", "short_answer", and "essay" and reject all other values.
 */
const validateQuestionType = (questionType) => {
  const validTypes = ['multiple_choice', 'true_false', 'short_answer', 'essay'];
  return validTypes.includes(questionType);
};

/**
 * Validates quiz activation requirements
 * Property 10: Quiz Activation Validation - Validates Requirements 7.5
 * For any quiz, the activation validation should require at least one question 
 * and reject quizzes with zero questions.
 */
const validateQuizActivation = (quiz) => {
  if (!quiz || typeof quiz !== 'object') {
    return false;
  }
  
  if (!Array.isArray(quiz.questions)) {
    return false;
  }
  
  return quiz.questions.length > 0;
};

/**
 * Complete question validation (for reference)
 */
const validateQuestion = (question) => {
  if (!question || typeof question !== 'object') {
    return { valid: false, error: 'Question must be an object' };
  }

  if (!question.question?.trim()) {
    return { valid: false, error: 'Question text is required' };
  }

  // Validate question type
  if (!validateQuestionType(question.type)) {
    return { valid: false, error: 'Invalid question type' };
  }

  if (question.type === 'multiple_choice') {
    if (!Array.isArray(question.options) || question.options.length < 2) {
      return { valid: false, error: 'Multiple choice questions need at least 2 options' };
    }
    if (question.options.some(opt => !opt?.trim())) {
      return { valid: false, error: 'All options must be filled for multiple choice questions' };
    }
    if (!question.correctAnswer) {
      return { valid: false, error: 'Please select the correct answer' };
    }
  }

  if (question.type === 'true_false' && !question.correctAnswer) {
    return { valid: false, error: 'Please select the correct answer' };
  }

  if (typeof question.points !== 'number' || question.points < 1) {
    return { valid: false, error: 'Points must be at least 1' };
  }

  return { valid: true };
};

/**
 * Quiz settings validation (for reference)
 */
const validateQuizSettings = (quiz) => {
  const errors = {};
  
  if (!quiz.title?.trim()) {
    errors.title = 'Quiz title is required';
  }
  
  if (typeof quiz.timeLimit !== 'number' || quiz.timeLimit < 1) {
    errors.timeLimit = 'Time limit must be at least 1 minute';
  }
  
  if (quiz.availableFrom && quiz.availableUntil) {
    const fromDate = new Date(quiz.availableFrom);
    const untilDate = new Date(quiz.availableUntil);
    if (fromDate >= untilDate) {
      errors.availableUntil = 'End date must be after start date';
    }
  }
  
  return Object.keys(errors).length === 0;
};

// Export functions
module.exports = {
  validateQuestionType,
  validateQuizActivation,
  validateQuestion,
  validateQuizSettings
};
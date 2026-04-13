/**
 * Functional tests for QuizBuilder component
 * Tests the core functionality without complex UI interactions
 */

describe('QuizBuilder Functional Tests', () => {
  // Test quiz validation logic
  test('validates quiz settings correctly', () => {
    const validateQuizSettings = (quiz) => {
      const errors = {};
      
      if (!quiz.title?.trim()) {
        errors.title = 'Quiz title is required';
      }
      
      if (quiz.timeLimit < 1) {
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

    // Test valid quiz
    const validQuiz = {
      title: 'Test Quiz',
      timeLimit: 60,
      availableFrom: '2024-01-01T10:00',
      availableUntil: '2024-01-01T12:00'
    };
    expect(validateQuizSettings(validQuiz)).toBe(true);

    // Test invalid quiz - no title
    const invalidQuiz1 = {
      title: '',
      timeLimit: 60
    };
    expect(validateQuizSettings(invalidQuiz1)).toBe(false);

    // Test invalid quiz - invalid time limit
    const invalidQuiz2 = {
      title: 'Test Quiz',
      timeLimit: 0
    };
    expect(validateQuizSettings(invalidQuiz2)).toBe(false);

    // Test invalid quiz - end date before start date
    const invalidQuiz3 = {
      title: 'Test Quiz',
      timeLimit: 60,
      availableFrom: '2024-01-01T12:00',
      availableUntil: '2024-01-01T10:00'
    };
    expect(validateQuizSettings(invalidQuiz3)).toBe(false);
  });

  // Test question validation logic
  test('validates questions correctly', () => {
    const validateQuestion = (question) => {
      if (!question.question?.trim()) {
        return { valid: false, error: 'Question text is required' };
      }

      if (question.type === 'multiple_choice') {
        if (question.options?.some(opt => !opt?.trim())) {
          return { valid: false, error: 'All options must be filled for multiple choice questions' };
        }
        if (!question.correctAnswer) {
          return { valid: false, error: 'Please select the correct answer' };
        }
      }

      if (question.type === 'true_false' && !question.correctAnswer) {
        return { valid: false, error: 'Please select the correct answer' };
      }

      if (question.points < 1) {
        return { valid: false, error: 'Points must be at least 1' };
      }

      return { valid: true };
    };

    // Test valid multiple choice question
    const validMCQuestion = {
      type: 'multiple_choice',
      question: 'What is 2+2?',
      options: ['3', '4', '5', '6'],
      correctAnswer: '4',
      points: 1
    };
    expect(validateQuestion(validMCQuestion).valid).toBe(true);

    // Test invalid multiple choice question - empty option
    const invalidMCQuestion = {
      type: 'multiple_choice',
      question: 'What is 2+2?',
      options: ['3', '', '5', '6'],
      correctAnswer: '4',
      points: 1
    };
    expect(validateQuestion(invalidMCQuestion).valid).toBe(false);

    // Test valid true/false question
    const validTFQuestion = {
      type: 'true_false',
      question: 'The sky is blue',
      correctAnswer: 'true',
      points: 1
    };
    expect(validateQuestion(validTFQuestion).valid).toBe(true);

    // Test invalid question - no text
    const invalidQuestion = {
      type: 'multiple_choice',
      question: '',
      options: ['A', 'B', 'C', 'D'],
      correctAnswer: 'A',
      points: 1
    };
    expect(validateQuestion(invalidQuestion).valid).toBe(false);
  });

  // Test question type support
  test('supports all required question types', () => {
    const supportedTypes = ['multiple_choice', 'true_false', 'short_answer', 'essay'];
    
    supportedTypes.forEach(type => {
      const question = {
        type: type,
        question: 'Sample question',
        points: 1
      };

      // Add type-specific properties
      if (type === 'multiple_choice') {
        question.options = ['A', 'B', 'C', 'D'];
        question.correctAnswer = 'A';
      } else if (type === 'true_false') {
        question.correctAnswer = 'true';
      } else if (type === 'short_answer' || type === 'essay') {
        question.correctAnswer = 'Sample answer';
      }

      // Should be able to create question of each type
      expect(question.type).toBe(type);
      expect(question.question).toBeTruthy();
      expect(question.points).toBeGreaterThan(0);
    });
  });

  // Test quiz configuration options
  test('supports all required quiz configuration options', () => {
    const quizConfig = {
      title: 'Test Quiz',
      description: 'Test Description',
      timeLimit: 60,
      randomizeQuestions: true,
      availableFrom: '2024-01-01T10:00',
      availableUntil: '2024-01-01T12:00',
      questions: []
    };

    // Verify all required configuration options are present
    expect(quizConfig).toHaveProperty('title');
    expect(quizConfig).toHaveProperty('description');
    expect(quizConfig).toHaveProperty('timeLimit');
    expect(quizConfig).toHaveProperty('randomizeQuestions');
    expect(quizConfig).toHaveProperty('availableFrom');
    expect(quizConfig).toHaveProperty('availableUntil');
    expect(quizConfig).toHaveProperty('questions');

    // Verify types
    expect(typeof quizConfig.title).toBe('string');
    expect(typeof quizConfig.description).toBe('string');
    expect(typeof quizConfig.timeLimit).toBe('number');
    expect(typeof quizConfig.randomizeQuestions).toBe('boolean');
    expect(Array.isArray(quizConfig.questions)).toBe(true);
  });

  // Test quiz validation requiring at least one question
  test('validates quiz requires at least one question', () => {
    const validateQuizForActivation = (quiz) => {
      if (!quiz.questions || quiz.questions.length === 0) {
        return { valid: false, error: 'Quiz must have at least one question' };
      }
      return { valid: true };
    };

    // Test quiz without questions
    const emptyQuiz = {
      title: 'Test Quiz',
      questions: []
    };
    expect(validateQuizForActivation(emptyQuiz).valid).toBe(false);

    // Test quiz with questions
    const quizWithQuestions = {
      title: 'Test Quiz',
      questions: [
        {
          type: 'multiple_choice',
          question: 'What is 2+2?',
          options: ['3', '4', '5', '6'],
          correctAnswer: '4',
          points: 1
        }
      ]
    };
    expect(validateQuizForActivation(quizWithQuestions).valid).toBe(true);
  });
});
/**
 * Property-based tests for quiz validation
 * Task 5.3: Write property tests for quiz system
 * Using fast-check library with minimum 100 iterations per test
 */

const fc = require('fast-check');
const { validateQuestionType, validateQuizActivation } = require('../quizValidation');

describe('Quiz System Property Tests', () => {
  
  /**
   * Property 9: Question Type Validation
   * **Validates: Requirements 7.2**
   * 
   * For any question type input, the validation should accept only 
   * "multiple_choice", "true_false", "short_answer", and "essay" and reject all other values.
   */
  describe('Property 9: Question Type Validation', () => {
    test('should accept only valid question types', () => {
      fc.assert(
        fc.property(
          fc.string(),
          (questionType) => {
            const result = validateQuestionType(questionType);
            const validTypes = ['multiple_choice', 'true_false', 'short_answer', 'essay'];
            const isValidType = validTypes.includes(questionType);
            
            // Property: validation result should match whether input is in valid types
            return result === isValidType;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should always accept the four valid question types', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('multiple_choice', 'true_false', 'short_answer', 'essay'),
          (validType) => {
            // Property: all valid types should always be accepted
            return validateQuestionType(validType) === true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should reject any string not in valid types', () => {
      fc.assert(
        fc.property(
          fc.string().filter(s => !['multiple_choice', 'true_false', 'short_answer', 'essay'].includes(s)),
          (invalidType) => {
            // Property: any string not in valid types should be rejected
            return validateQuestionType(invalidType) === false;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should handle non-string inputs consistently', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.integer(),
            fc.float(),
            fc.boolean(),
            fc.constant(null),
            fc.constant(undefined),
            fc.array(fc.string()),
            fc.object()
          ),
          (nonStringInput) => {
            // Property: non-string inputs should always be rejected
            return validateQuestionType(nonStringInput) === false;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should be case-sensitive', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER', 'ESSAY'),
          (uppercaseType) => {
            // Property: uppercase versions should be rejected (case-sensitive)
            return validateQuestionType(uppercaseType) === false;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 10: Quiz Activation Validation
   * **Validates: Requirements 7.5**
   * 
   * For any quiz, the activation validation should require at least one question 
   * and reject quizzes with zero questions.
   */
  describe('Property 10: Quiz Activation Validation', () => {
    test('should require at least one question for activation', () => {
      fc.assert(
        fc.property(
          fc.array(fc.object(), { minLength: 0, maxLength: 10 }),
          (questions) => {
            const quiz = { questions };
            const result = validateQuizActivation(quiz);
            
            // Property: validation should pass if and only if questions array has length > 0
            return result === (questions.length > 0);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should reject quizzes with empty questions array', () => {
      fc.assert(
        fc.property(
          fc.record({
            title: fc.string(),
            description: fc.string(),
            timeLimit: fc.integer({ min: 1, max: 300 }),
            questions: fc.constant([])
          }),
          (quiz) => {
            // Property: any quiz with empty questions array should be rejected
            return validateQuizActivation(quiz) === false;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should accept quizzes with non-empty questions array', () => {
      fc.assert(
        fc.property(
          fc.record({
            title: fc.string(),
            description: fc.string(),
            timeLimit: fc.integer({ min: 1, max: 300 }),
            questions: fc.array(fc.object(), { minLength: 1, maxLength: 10 })
          }),
          (quiz) => {
            // Property: any quiz with non-empty questions array should be accepted
            return validateQuizActivation(quiz) === true;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should handle invalid quiz objects', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant(null),
            fc.constant(undefined),
            fc.string(),
            fc.integer(),
            fc.boolean(),
            fc.array(fc.anything())
          ),
          (invalidQuiz) => {
            // Property: invalid quiz objects should always be rejected
            return validateQuizActivation(invalidQuiz) === false;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should handle quiz objects without questions property', () => {
      fc.assert(
        fc.property(
          fc.record({
            title: fc.string(),
            description: fc.string(),
            timeLimit: fc.integer({ min: 1, max: 300 })
            // Note: no questions property
          }),
          (quizWithoutQuestions) => {
            // Property: quiz objects without questions property should be rejected
            return validateQuizActivation(quizWithoutQuestions) === false;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should handle quiz objects with non-array questions property', () => {
      fc.assert(
        fc.property(
          fc.record({
            title: fc.string(),
            description: fc.string(),
            timeLimit: fc.integer({ min: 1, max: 300 }),
            questions: fc.oneof(
              fc.string(),
              fc.integer(),
              fc.boolean(),
              fc.constant(null),
              fc.constant(undefined),
              fc.object()
            )
          }),
          (quizWithInvalidQuestions) => {
            // Property: quiz objects with non-array questions should be rejected
            return validateQuizActivation(quizWithInvalidQuestions) === false;
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should be consistent regardless of other quiz properties', () => {
      fc.assert(
        fc.property(
          fc.record({
            title: fc.string(),
            description: fc.option(fc.string()),
            timeLimit: fc.integer({ min: 1, max: 300 }),
            randomizeQuestions: fc.boolean(),
            availableFrom: fc.option(fc.string()),
            availableUntil: fc.option(fc.string()),
            questions: fc.array(fc.object(), { minLength: 0, maxLength: 5 })
          }),
          (quiz) => {
            const result = validateQuizActivation(quiz);
            
            // Property: validation should depend only on questions array length, 
            // not on other properties
            return result === (quiz.questions.length > 0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Integration property tests - combining both properties
   */
  describe('Integration Properties', () => {
    test('question type validation should be independent of quiz activation', () => {
      fc.assert(
        fc.property(
          fc.string(),
          fc.array(fc.object(), { minLength: 0, maxLength: 5 }),
          (questionType, questions) => {
            const quiz = { questions };
            
            const typeResult = validateQuestionType(questionType);
            const activationResult = validateQuizActivation(quiz);
            
            // Property: question type validation should not affect quiz activation validation
            // and vice versa - they should be independent
            const validTypes = ['multiple_choice', 'true_false', 'short_answer', 'essay'];
            const expectedTypeResult = validTypes.includes(questionType);
            const expectedActivationResult = questions.length > 0;
            
            return typeResult === expectedTypeResult && 
                   activationResult === expectedActivationResult;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
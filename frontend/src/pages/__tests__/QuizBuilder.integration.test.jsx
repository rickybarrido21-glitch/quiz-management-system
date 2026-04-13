import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import QuizBuilder from '../QuizBuilder';
import api from '../../services/api';

// Mock the API service
jest.mock('../../services/api');
const mockedApi = api;

const theme = createTheme();

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        {component}
      </ThemeProvider>
    </BrowserRouter>
  );
};

// Mock useSearchParams and useParams
const mockSearchParams = new URLSearchParams('?classId=test-class-id');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useSearchParams: () => [mockSearchParams],
  useParams: () => ({ id: null }),
  useNavigate: () => jest.fn(),
}));

describe('QuizBuilder Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful class info fetch
    mockedApi.get.mockImplementation((url) => {
      if (url.includes('/classes/')) {
        return Promise.resolve({
          data: {
            _id: 'test-class-id',
            courseCode: 'CS101',
            courseDescription: 'Introduction to Computer Science',
          }
        });
      }
      return Promise.reject(new Error('Not found'));
    });
  });

  test('loads class information on mount', async () => {
    renderWithProviders(<QuizBuilder />);
    
    await waitFor(() => {
      expect(screen.getByText('CS101 - Introduction to Computer Science')).toBeInTheDocument();
    });
    
    expect(mockedApi.get).toHaveBeenCalledWith('/classes/test-class-id');
  });

  test('creates new quiz with API call', async () => {
    // Mock successful quiz creation
    mockedApi.post.mockResolvedValue({
      data: {
        _id: 'new-quiz-id',
        title: 'Test Quiz',
        description: 'Test Description',
        questions: [
          {
            type: 'multiple_choice',
            question: 'What is 2+2?',
            options: ['3', '4', '5', '6'],
            correctAnswer: '4',
            points: 1
          }
        ]
      }
    });

    renderWithProviders(<QuizBuilder />);
    
    // Wait for class info to load
    await waitFor(() => {
      expect(screen.getByText('CS101 - Introduction to Computer Science')).toBeInTheDocument();
    });

    // Fill quiz settings
    const titleInput = screen.getByLabelText(/quiz title/i);
    fireEvent.change(titleInput, { target: { value: 'Test Quiz' } });
    
    const descriptionInput = screen.getByLabelText(/description/i);
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });

    // Go to questions step
    fireEvent.click(screen.getByText('Next'));

    // Add a question
    fireEvent.click(screen.getByText('Add Question'));
    
    const questionInput = screen.getByLabelText(/question/i);
    fireEvent.change(questionInput, { target: { value: 'What is 2+2?' } });

    // Fill options for multiple choice
    const optionInputs = screen.getAllByLabelText(/option \d/i);
    fireEvent.change(optionInputs[0], { target: { value: '3' } });
    fireEvent.change(optionInputs[1], { target: { value: '4' } });
    fireEvent.change(optionInputs[2], { target: { value: '5' } });
    fireEvent.change(optionInputs[3], { target: { value: '6' } });

    // Set correct answer
    const correctAnswerSwitches = screen.getAllByRole('checkbox');
    fireEvent.click(correctAnswerSwitches[1]); // Select option 2 (4) as correct

    // Add the question
    fireEvent.click(screen.getByText('Add Question'));

    // Go to preview step
    fireEvent.click(screen.getByText('Next'));

    // Save the quiz
    fireEvent.click(screen.getByText('Create Quiz'));

    await waitFor(() => {
      expect(mockedApi.post).toHaveBeenCalledWith('/quizzes', expect.objectContaining({
        title: 'Test Quiz',
        description: 'Test Description',
        classId: 'test-class-id',
        questions: expect.arrayContaining([
          expect.objectContaining({
            question: 'What is 2+2?',
            type: 'multiple_choice',
            options: ['3', '4', '5', '6'],
            correctAnswer: '4'
          })
        ])
      }));
    });
  });

  test('handles API errors gracefully', async () => {
    // Mock API error
    mockedApi.get.mockRejectedValue(new Error('Network error'));

    renderWithProviders(<QuizBuilder />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load class information')).toBeInTheDocument();
    });
  });

  test('validates quiz data before submission', async () => {
    renderWithProviders(<QuizBuilder />);
    
    // Wait for class info to load
    await waitFor(() => {
      expect(screen.getByText('CS101 - Introduction to Computer Science')).toBeInTheDocument();
    });

    // Try to save without title
    fireEvent.click(screen.getByText('Next')); // Should show validation error
    
    await waitFor(() => {
      expect(screen.getByText('Quiz title is required')).toBeInTheDocument();
    });

    // Should not make API call
    expect(mockedApi.post).not.toHaveBeenCalled();
  });
});
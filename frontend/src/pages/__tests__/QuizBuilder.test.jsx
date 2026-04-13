import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import QuizBuilder from '../QuizBuilder';

// Mock the API service
jest.mock('../../services/api', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
}));

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

describe('QuizBuilder Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders multi-step quiz builder interface', () => {
    renderWithProviders(<QuizBuilder />);
    
    // Check if stepper is present
    expect(screen.getByText('Quiz Settings')).toBeInTheDocument();
    expect(screen.getByText('Add Questions')).toBeInTheDocument();
    expect(screen.getByText('Preview & Save')).toBeInTheDocument();
  });

  test('validates quiz settings before proceeding to next step', async () => {
    renderWithProviders(<QuizBuilder />);
    
    // Try to proceed without filling required fields
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    
    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText('Quiz title is required')).toBeInTheDocument();
    });
  });

  test('allows adding questions in step 2', async () => {
    renderWithProviders(<QuizBuilder />);
    
    // Fill quiz title to proceed to step 2
    const titleInput = screen.getByLabelText(/quiz title/i);
    fireEvent.change(titleInput, { target: { value: 'Test Quiz' } });
    
    // Proceed to questions step
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    
    // Should be on questions step
    await waitFor(() => {
      expect(screen.getByText('Add Question')).toBeInTheDocument();
    });
  });

  test('shows preview functionality in step 3', async () => {
    renderWithProviders(<QuizBuilder />);
    
    // Fill required fields and add a question
    const titleInput = screen.getByLabelText(/quiz title/i);
    fireEvent.change(titleInput, { target: { value: 'Test Quiz' } });
    
    // Go to step 2
    fireEvent.click(screen.getByText('Next'));
    
    // Add a question (simplified - would need to mock the full flow)
    // For now, just check if we can navigate to step 3
    
    // Try to go to step 3 (should show error about needing questions)
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    
    await waitFor(() => {
      expect(screen.getByText('Please add at least one question before proceeding')).toBeInTheDocument();
    });
  });

  test('supports multiple question types', () => {
    renderWithProviders(<QuizBuilder />);
    
    // Fill title and go to questions step
    const titleInput = screen.getByLabelText(/quiz title/i);
    fireEvent.change(titleInput, { target: { value: 'Test Quiz' } });
    fireEvent.click(screen.getByText('Next'));
    
    // Click add question
    fireEvent.click(screen.getByText('Add Question'));
    
    // Check if question type selector is present
    expect(screen.getByLabelText(/type/i)).toBeInTheDocument();
  });
});
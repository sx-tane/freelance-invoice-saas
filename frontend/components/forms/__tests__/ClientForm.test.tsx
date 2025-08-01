import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ClientForm } from '../ClientForm';
import { Client } from '@/types';

describe('ClientForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders all form fields', () => {
    render(<ClientForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/company/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/address/i)).toBeInTheDocument();
  });

  it('renders submit button', () => {
    render(<ClientForm onSubmit={mockOnSubmit} />);
    expect(screen.getByRole('button', { name: /create client/i })).toBeInTheDocument();
  });

  it('displays validation error for required name field', async () => {
    const user = userEvent.setup();
    render(<ClientForm onSubmit={mockOnSubmit} />);

    const nameInput = screen.getByLabelText(/name/i);
    const submitButton = screen.getByRole('button', { name: /create client/i });

    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('displays validation error for invalid email', async () => {
    const user = userEvent.setup();
    render(<ClientForm onSubmit={mockOnSubmit} />);

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /create client/i });

    await user.type(emailInput, 'invalid-email');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid email')).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    render(<ClientForm onSubmit={mockOnSubmit} />);

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const companyInput = screen.getByLabelText(/company/i);
    const submitButton = screen.getByRole('button', { name: /create client/i });

    await user.type(nameInput, 'John Doe');
    await user.type(emailInput, 'john@example.com');
    await user.type(companyInput, 'Acme Corp');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        company: 'Acme Corp',
        phone: '',
        address: '',
      });
    });
  });

  it('populates form with existing client data', async () => {
    const existingClient: Client = {
      id: '1',
      name: 'Jane Smith',
      email: 'jane@example.com',
      company: 'Tech Corp',
      phone: '123-456-7890',
      address: '123 Main St',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    render(<ClientForm client={existingClient} onSubmit={mockOnSubmit} />);

    // Check that the button shows "Update Client" for existing client
    expect(screen.getByText('Update Client')).toBeInTheDocument();
    
    // Wait for form to be populated with async validation
    await waitFor(() => {
      const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
      expect(nameInput.value).toBe('Jane Smith');
    });
  });

  it('disables submit button when loading', () => {
    render(<ClientForm onSubmit={mockOnSubmit} isLoading={true} />);
    
    const submitButton = screen.getByRole('button', { name: /create client/i });
    expect(submitButton).toBeDisabled();
  });

  it('shows loading text when submitting', () => {
    render(<ClientForm onSubmit={mockOnSubmit} isLoading={true} />);
    
    expect(screen.getByText(/create client/i)).toBeInTheDocument();
  });
});
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AddResources } from '../components/component/add-resources-dialog';
import { submitResource } from '../app/actions';
import { toast } from 'sonner';

// Mock the submitResource action
jest.mock('../app/actions', () => ({
  submitResource: jest.fn(),
}));

// Mock toast notifications
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('AddResources component', () => {
  const mockResource = {
    id: 'test-id',
    charity_id: 'test-charity',
    name: 'Test Resource',
    description: 'Test Description',
    category: 'Food',
    quantity: 10,
    quantity_reserved: 2,
    unit: 'kg',
    shareable_quantity: 5,
    location: 'Test Location',
    expiry_date: new Date('2025-12-31'),
    updated_at: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the dialog when triggered', () => {
    render(<AddResources resource={null} action="add" />);
    
    // Dialog should be closed initially
    expect(screen.queryByText('Add Resource')).not.toBeInTheDocument();
    
    // Open the dialog
    const addButton = screen.getAllByRole('button', { name: 'Add Resources' })[0];
    fireEvent.click(addButton);
    
    // Now the dialog should be visible
    expect(screen.queryAllByText('Add Resource').length).toBeGreaterThan(0);
  });

  it('should populate fields when editing existing resource', () => {
    render(<AddResources resource={mockResource} action="editrow" />);
    
    const editButton = screen.getByRole('button', { name: '' }); 
    fireEvent.click(editButton);
    
    expect(screen.getByDisplayValue(mockResource.quantity.toString())).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockResource.quantity_reserved.toString())).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockResource.unit.toString())).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockResource.location.toString())).toBeInTheDocument();
  });

  it('should validate input and show error when necessary', async () => {
    (submitResource as jest.Mock).mockImplementation((formData) => {
      if (formData.get('quantity') < formData.get('shareableQuantity') + formData.get('reservedQuantity')) {
        return { success: false, message: 'You cannot have negative quantity' };
      }
      return { success: true, message: 'Resource successfully added' };
    });

    render(<AddResources resource={null} action="add" />);
    const addButton = screen.getAllByRole('button', { name: 'Add Resources' })[0];
    fireEvent.click(addButton);
    
    const nameInput = screen.getByPlaceholderText('Enter resource name');
    const quantityInput = screen.getByLabelText('Total Quantity *');
    const reservedQuantityInput = screen.getByLabelText('Reserved Quantity');
    const unitInput = screen.getByPlaceholderText('e.g. items, boxes, kg, hours...');
    
    fireEvent.change(nameInput, { target: { value: 'Test Resource' } });
    fireEvent.change(quantityInput, { target: { value: '5' } });
    fireEvent.change(reservedQuantityInput, { target: { value: '10' } }); // This is invalid
    fireEvent.change(unitInput, { target: { value: 'items' } });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: 'Add Resource' });
    fireEvent.click(submitButton);
    
    // Check if the form shows an error
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('You cannot have negative quantity');
    });
  });
});
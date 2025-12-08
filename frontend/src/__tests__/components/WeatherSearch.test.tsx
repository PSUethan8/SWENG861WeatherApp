import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import WeatherSearch from '../../components/WeatherSearch';

describe('WeatherSearch Component', () => {
  const mockOnSearch = vi.fn();

  beforeEach(() => {
    mockOnSearch.mockClear();
  });

  it('renders all location type tabs', () => {
    render(<WeatherSearch onSearch={mockOnSearch} isLoading={false} />);
    
    expect(screen.getByText('City')).toBeInTheDocument();
    expect(screen.getByText('Coordinates')).toBeInTheDocument();
    expect(screen.getByText('ZIP Code')).toBeInTheDocument();
  });

  it('shows city input by default', () => {
    render(<WeatherSearch onSearch={mockOnSearch} isLoading={false} />);
    
    expect(screen.getByPlaceholderText(/London, GB/i)).toBeInTheDocument();
  });

  it('switches to coordinates input when tab clicked', () => {
    render(<WeatherSearch onSearch={mockOnSearch} isLoading={false} />);
    
    fireEvent.click(screen.getByText('Coordinates'));
    
    expect(screen.getByPlaceholderText(/40.7128/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/-74.0060/)).toBeInTheDocument();
  });

  it('switches to ZIP code input when tab clicked', () => {
    render(<WeatherSearch onSearch={mockOnSearch} isLoading={false} />);
    
    fireEvent.click(screen.getByText('ZIP Code'));
    
    expect(screen.getByPlaceholderText(/10001,US/i)).toBeInTheDocument();
  });

  it('calls onSearch with city data when form submitted', () => {
    render(<WeatherSearch onSearch={mockOnSearch} isLoading={false} />);
    
    const input = screen.getByPlaceholderText(/London, GB/i);
    fireEvent.change(input, { target: { value: 'New York' } });
    
    const button = screen.getByRole('button', { name: /Get Weather/i });
    fireEvent.click(button);
    
    expect(mockOnSearch).toHaveBeenCalledWith({
      locationType: 'city',
      city: 'New York',
      units: 'metric',
    });
  });

  it('toggles between metric and imperial units', () => {
    render(<WeatherSearch onSearch={mockOnSearch} isLoading={false} />);
    
    const imperialButton = screen.getByText('°F');
    fireEvent.click(imperialButton);
    
    const input = screen.getByPlaceholderText(/London, GB/i);
    fireEvent.change(input, { target: { value: 'London' } });
    
    const submitButton = screen.getByRole('button', { name: /Get Weather/i });
    fireEvent.click(submitButton);
    
    expect(mockOnSearch).toHaveBeenCalledWith(
      expect.objectContaining({ units: 'imperial' })
    );
  });

  it('disables submit button when loading', () => {
    render(<WeatherSearch onSearch={mockOnSearch} isLoading={true} />);
    
    const button = screen.getByRole('button', { name: '' });
    expect(button).toBeDisabled();
  });

  it('shows use my location button for coordinates', () => {
    render(<WeatherSearch onSearch={mockOnSearch} isLoading={false} />);
    
    fireEvent.click(screen.getByText('Coordinates'));
    
    expect(screen.getByText(/Use my current location/i)).toBeInTheDocument();
  });
});


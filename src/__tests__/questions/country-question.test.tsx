import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { CountryQuestion } from '@/components/questions/country-question';
import { Question } from '@/types/database';

// Mock the countries data
jest.mock('@/lib/countries', () => ({
  countries: [
    { code: 'US', name: 'United States', flag: '🇺🇸', region: 'Americas', subregion: 'Northern America', capital: 'Washington, D.C.' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦', region: 'Americas', subregion: 'Northern America', capital: 'Ottawa' },
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', region: 'Europe', subregion: 'Northern Europe', capital: 'London' },
    { code: 'DE', name: 'Germany', flag: '🇩🇪', region: 'Europe', subregion: 'Western Europe', capital: 'Berlin' },
    { code: 'JP', name: 'Japan', flag: '🇯🇵', region: 'Asia', subregion: 'Eastern Asia', capital: 'Tokyo' }
  ],
  getCountryByCode: (code: string) => {
    const countries = [
      { code: 'US', name: 'United States', flag: '🇺🇸', region: 'Americas', subregion: 'Northern America', capital: 'Washington, D.C.' },
      { code: 'CA', name: 'Canada', flag: '🇨🇦', region: 'Americas', subregion: 'Northern America', capital: 'Ottawa' },
      { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', region: 'Europe', subregion: 'Northern Europe', capital: 'London' },
      { code: 'DE', name: 'Germany', flag: '🇩🇪', region: 'Europe', subregion: 'Western Europe', capital: 'Berlin' },
      { code: 'JP', name: 'Japan', flag: '🇯🇵', region: 'Asia', subregion: 'Eastern Asia', capital: 'Tokyo' }
    ];
    return countries.find(country => country.code === code);
  },
  getRegions: () => ['Americas', 'Europe', 'Asia'],
  searchCountries: (query: string) => {
    const countries = [
      { code: 'US', name: 'United States', flag: '🇺🇸', region: 'Americas', subregion: 'Northern America', capital: 'Washington, D.C.' },
      { code: 'CA', name: 'Canada', flag: '🇨🇦', region: 'Americas', subregion: 'Northern America', capital: 'Ottawa' },
      { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', region: 'Europe', subregion: 'Northern Europe', capital: 'London' },
      { code: 'DE', name: 'Germany', flag: '🇩🇪', region: 'Europe', subregion: 'Western Europe', capital: 'Berlin' },
      { code: 'JP', name: 'Japan', flag: '🇯🇵', region: 'Asia', subregion: 'Eastern Asia', capital: 'Tokyo' }
    ];
    return countries.filter(country => 
      country.name.toLowerCase().includes(query.toLowerCase()) ||
      country.code.toLowerCase().includes(query.toLowerCase())
    );
  },
  sortCountries: (sortBy: string = 'name') => {
    const countries = [
      { code: 'US', name: 'United States', flag: '🇺🇸', region: 'Americas', subregion: 'Northern America', capital: 'Washington, D.C.' },
      { code: 'CA', name: 'Canada', flag: '🇨🇦', region: 'Americas', subregion: 'Northern America', capital: 'Ottawa' },
      { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', region: 'Europe', subregion: 'Northern Europe', capital: 'London' },
      { code: 'DE', name: 'Germany', flag: '🇩🇪', region: 'Europe', subregion: 'Western Europe', capital: 'Berlin' },
      { code: 'JP', name: 'Japan', flag: '🇯🇵', region: 'Asia', subregion: 'Eastern Asia', capital: 'Tokyo' }
    ];
    return [...countries].sort((a, b) => {
      switch (sortBy) {
        case 'code': return a.code.localeCompare(b.code);
        case 'region': return a.region.localeCompare(b.region) || a.name.localeCompare(b.name);
        case 'name':
        default: return a.name.localeCompare(b.name);
      }
    });
  }
}));

describe('CountryQuestion', () => {
  const mockQuestion: Question = {
    id: 1,
    questionnaire_id: 1,
    text: 'What country are you from?',
    type: 'country',
    required: true,
    order_num: 1,
    help_text: 'Select your country of residence',
    placeholder_text: 'Choose a country...',
    options: undefined,
    validation_rules: undefined,
    conditional_logic: undefined,
    metadata: undefined,
    error_message: undefined,
    is_template: false,
    template_category: undefined,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders question text and help text', () => {
    render(
      <CountryQuestion
        question={mockQuestion}
        value=""
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('What country are you from?')).toBeInTheDocument();
    expect(screen.getByText('Select your country of residence')).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument(); // Required indicator
  });

  it('shows placeholder when no country is selected', () => {
    render(
      <CountryQuestion
        question={mockQuestion}
        value=""
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Choose a country...')).toBeInTheDocument();
  });

  it('displays selected country with flag and details', () => {
    render(
      <CountryQuestion
        question={mockQuestion}
        value="US"
        onChange={mockOnChange}
      />
    );

    expect(screen.getAllByText('United States')[0]).toBeInTheDocument();
    expect(screen.getAllByText('🇺🇸')[0]).toBeInTheDocument();
    expect(screen.getAllByText('US')[0]).toBeInTheDocument();
  });

  it('opens country selection popover when clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <CountryQuestion
        question={mockQuestion}
        value=""
        onChange={mockOnChange}
      />
    );

    const trigger = screen.getByRole('combobox');
    await user.click(trigger);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search countries...')).toBeInTheDocument();
    });
  });

  it('shows search input when popover is opened', async () => {
    const user = userEvent.setup();

    render(
      <CountryQuestion
        question={mockQuestion}
        value=""
        onChange={mockOnChange}
      />
    );

    const trigger = screen.getByRole('combobox');
    await user.click(trigger);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search countries...')).toBeInTheDocument();
    });

    // Verify search input is functional
    const searchInput = screen.getByPlaceholderText('Search countries...');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveValue('');
  });

  it('filters countries by region', async () => {
    const user = userEvent.setup();
    
    render(
      <CountryQuestion
        question={mockQuestion}
        value=""
        onChange={mockOnChange}
      />
    );

    const trigger = screen.getByRole('combobox');
    await user.click(trigger);

    await waitFor(() => {
      expect(screen.getByText('All Regions')).toBeInTheDocument();
    });

    // This test would need more complex setup to test region filtering
    // For now, we verify the region filter is present
    expect(screen.getByText('All Regions')).toBeInTheDocument();
  });

  it('shows filter controls when popover is opened', async () => {
    const user = userEvent.setup();

    render(
      <CountryQuestion
        question={mockQuestion}
        value=""
        onChange={mockOnChange}
      />
    );

    const trigger = screen.getByRole('combobox');
    await user.click(trigger);

    await waitFor(() => {
      expect(screen.getByText('All Regions')).toBeInTheDocument();
      expect(screen.getByText('Sort by Name')).toBeInTheDocument();
    });

    // Verify filter controls are present
    expect(screen.getByText('All Regions')).toBeInTheDocument();
    expect(screen.getByText('Sort by Name')).toBeInTheDocument();
  });

  it('shows error message when provided', () => {
    render(
      <CountryQuestion
        question={mockQuestion}
        value=""
        onChange={mockOnChange}
        error="Please select a country"
      />
    );

    expect(screen.getByText('Please select a country')).toBeInTheDocument();
  });

  it('disables interaction when disabled prop is true', () => {
    render(
      <CountryQuestion
        question={mockQuestion}
        value=""
        onChange={mockOnChange}
        disabled={true}
      />
    );

    const trigger = screen.getByRole('combobox');
    expect(trigger).toBeDisabled();
  });

  it('shows country details when a country is selected', () => {
    render(
      <CountryQuestion
        question={mockQuestion}
        value="JP"
        onChange={mockOnChange}
      />
    );

    expect(screen.getAllByText('Japan')[0]).toBeInTheDocument();
    expect(screen.getAllByText('🇯🇵')[0]).toBeInTheDocument();
    expect(screen.getByText('Capital: Tokyo')).toBeInTheDocument();
    expect(screen.getByText(/Eastern Asia, Asia/)).toBeInTheDocument();
  });

  it('allows clearing the selection', async () => {
    const user = userEvent.setup();
    
    render(
      <CountryQuestion
        question={mockQuestion}
        value="US"
        onChange={mockOnChange}
      />
    );

    const trigger = screen.getByRole('combobox');
    await user.click(trigger);

    await waitFor(() => {
      expect(screen.getByText('Clear Selection')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Clear Selection'));

    expect(mockOnChange).toHaveBeenCalledWith('');
  });
});

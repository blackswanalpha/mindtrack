'use client';

import React, { useState, useMemo } from 'react';
import { Check, ChevronsUpDown, Search, Globe, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { countries, getCountryByCode, getRegions, Country, searchCountries, sortCountries } from '@/lib/countries';
import { Question } from '@/types/database';

interface CountryQuestionProps {
  question: Question;
  value?: string; // Country code
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export const CountryQuestion: React.FC<CountryQuestionProps> = ({
  question,
  value = '',
  onChange,
  error,
  disabled = false
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'code' | 'region'>('name');

  const selectedCountry = value ? getCountryByCode(value) : null;
  const regions = getRegions();

  // Filter and sort countries based on search, region, and sort preferences
  const filteredCountries = useMemo(() => {
    let result = countries;

    // Filter by region
    if (selectedRegion !== 'all') {
      result = result.filter(country => country.region === selectedRegion);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      result = searchCountries(searchQuery).filter(country => 
        selectedRegion === 'all' || country.region === selectedRegion
      );
    }

    // Sort countries
    return sortCountries(sortBy).filter(country => result.includes(country));
  }, [searchQuery, selectedRegion, sortBy]);

  const handleSelect = (countryCode: string) => {
    onChange(countryCode);
    setOpen(false);
    setSearchQuery('');
  };

  const clearSelection = () => {
    onChange('');
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2">
        <Globe className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
        <div className="flex-1">
          <label className="text-base font-medium text-gray-900 leading-relaxed block">
            {question.text}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {question.help_text && (
            <p className="text-sm text-gray-600 mt-1">{question.help_text}</p>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {/* Country Selection Popover */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={cn(
                "w-full justify-between h-auto min-h-[40px] px-3 py-2",
                !selectedCountry && "text-muted-foreground",
                error && "border-red-500 focus:border-red-500 focus:ring-red-500"
              )}
              disabled={disabled}
            >
              {selectedCountry ? (
                <div className="flex items-center gap-2">
                  <span className="text-lg">{selectedCountry.flag}</span>
                  <span className="font-medium">{selectedCountry.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {selectedCountry.code}
                  </Badge>
                </div>
              ) : (
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {question.placeholder_text || 'Select a country...'}
                </span>
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <div className="p-3 border-b space-y-2">
              {/* Search and Filters */}
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search countries..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-8 pl-9 pr-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                {/* Region Filter */}
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="All Regions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    {regions.map(region => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Sort Options */}
                <Select value={sortBy} onValueChange={(value: 'name' | 'code' | 'region') => setSortBy(value)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Sort by Name</SelectItem>
                    <SelectItem value="code">Sort by Code</SelectItem>
                    <SelectItem value="region">Sort by Region</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Selection */}
              {selectedCountry && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSelection}
                  className="h-6 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Clear Selection
                </Button>
              )}
            </div>

            <div className="max-h-64 overflow-y-auto">
              {filteredCountries.length === 0 ? (
                <div className="py-6 text-center text-sm text-gray-500">
                  {searchQuery ? 'No countries found.' : 'Start typing to search countries...'}
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {filteredCountries.map((country) => (
                    <button
                      key={country.code}
                      onClick={() => handleSelect(country.code)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-left hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === country.code ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span className="text-lg">{country.flag}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{country.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {country.code}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {country.capital && `${country.capital} • `}
                          {country.subregion}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Selected Country Details */}
        {selectedCountry && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{selectedCountry.flag}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-blue-900">{selectedCountry.name}</h4>
                  <Badge variant="secondary">{selectedCountry.code}</Badge>
                </div>
                <div className="text-sm text-blue-700 space-y-1">
                  {selectedCountry.capital && (
                    <div>Capital: {selectedCountry.capital}</div>
                  )}
                  <div>Region: {selectedCountry.subregion}, {selectedCountry.region}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600 flex items-center gap-1">
        <span className="w-4 h-4">⚠️</span>
        {error}
      </p>}
    </div>
  );
};

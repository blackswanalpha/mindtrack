# Enhanced Questionnaire Features Setup Guide

This guide will help you install the required dependencies for the enhanced questionnaire system with all advanced features.

## 🚀 Quick Setup

Run the following command to install all required dependencies:

```bash
npm install @radix-ui/react-popover @radix-ui/react-dialog @radix-ui/react-tabs @radix-ui/react-separator react-day-picker date-fns @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

## 📦 Individual Dependencies

### Core UI Components
```bash
# Radix UI components for enhanced UI
npm install @radix-ui/react-popover
npm install @radix-ui/react-dialog
npm install @radix-ui/react-tabs
npm install @radix-ui/react-separator
```

### Date/Time Components
```bash
# Date picker functionality
npm install react-day-picker
npm install date-fns
```

### Drag & Drop Functionality
```bash
# For visual question builder with drag-and-drop
npm install @dnd-kit/core
npm install @dnd-kit/sortable
npm install @dnd-kit/utilities
```

## 🔧 Current Status

The enhanced questionnaire system includes fallback implementations that work without these dependencies:

### ✅ Working Features (No Dependencies Required)
- **Group Targeting**: Organization/Individual targeting with access controls
- **Template Selection**: Pre-built questionnaire templates
- **Basic Question Builder**: Add, edit, delete, and reorder questions
- **22+ Question Types**: All question types with validation
- **Conditional Logic**: Show/hide logic and branching

### 🔄 Enhanced Features (Require Dependencies)
- **Drag & Drop**: Visual question reordering (requires @dnd-kit packages)
- **Advanced Calendar**: Full calendar with range selection (requires react-day-picker)
- **Advanced Popover**: Rich popover interactions (requires @radix-ui/react-popover)

## 🎯 Enhanced Features Overview

### 1. Group Feature (✅ Ready)
- **Organization Targeting**: Create questionnaires for specific organizations
- **Individual Targeting**: General public questionnaires with demographics
- **Access Controls**: Public/private, authentication, anonymous responses

### 2. Template Feature (✅ Ready)
- **Template Library**: Pre-built questionnaires (GAD-7, PHQ-9, etc.)
- **Template Preview**: Preview before using
- **Customization**: Modify templates after selection

### 3. Enhanced Questions (✅ Ready)
- **Numeric**: Integer and decimal inputs with validation
- **Date/Time**: Date, time, and datetime pickers
- **File Upload**: Document and image uploads with validation
- **Rating Scales**: Likert, NPS, star ratings, sliders
- **Country Selection**: Built-in country dropdown
- **Conditional Logic**: Dynamic questions based on previous answers

## 🚀 Getting Started

1. **Install Dependencies** (optional for enhanced features):
   ```bash
   npm install @radix-ui/react-popover @radix-ui/react-dialog @radix-ui/react-tabs react-day-picker date-fns @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
   ```

2. **Access Enhanced Builder**:
   - Navigate to `/questionnaires/create-enhanced`
   - Or use the regular builder at `/questionnaires/create`

3. **Create Your First Enhanced Questionnaire**:
   - Step 1: Basic Info (title, description, type)
   - Step 2: Group Settings (organization/individual targeting)
   - Step 3: Template Selection (optional)
   - Step 4: Question Building (22+ question types)

## 📋 Question Types Available

### Text Input (3 types)
- `text` - Short text input
- `textarea` - Long text input
- `rich_text` - Rich text with formatting

### Numeric (2 types)
- `number` - Integer numbers
- `decimal` - Decimal numbers with precision

### Date/Time (3 types)
- `date` - Date picker
- `time` - Time picker
- `datetime` - Combined date and time

### Rating Scales (6 types)
- `rating` - Numeric rating scale
- `star_rating` - Interactive star rating
- `likert` - Agreement scale
- `nps` - Net Promoter Score (0-10)
- `semantic_differential` - Bipolar scale
- `slider` - Continuous slider

### Choice (3 types)
- `single_choice` - Radio buttons
- `multiple_choice` - Checkboxes
- `dropdown` - Dropdown selection

### File Upload (2 types)
- `file_upload` - Document upload
- `image_upload` - Image upload with preview

### Geographic (3 types)
- `country` - Country selection
- `state` - State/province selection
- `city` - City selection

### Basic (1 type)
- `boolean` - Yes/No questions

## 🔧 Troubleshooting

### Build Errors
If you encounter build errors related to missing modules:

1. **Install missing dependencies**:
   ```bash
   npm install [missing-package-name]
   ```

2. **Clear cache and restart**:
   ```bash
   npm run build
   # or
   rm -rf .next && npm run dev
   ```

### Fallback Components
The system includes fallback implementations that work without external dependencies:
- Simple popover instead of Radix UI popover
- Basic calendar instead of react-day-picker
- Button-based reordering instead of drag-and-drop

## 📚 Documentation

- **Enhanced Question Types**: See `/demo/enhanced-features` for interactive examples
- **API Documentation**: Check `/api/questionnaires` endpoints
- **Component Documentation**: Review component files in `/components/question-builder/`

## 🎉 Ready to Go!

Your enhanced questionnaire system is ready to use! The fallback implementations ensure everything works even without the optional dependencies, while installing them unlocks the full feature set.

For the best experience, install all dependencies and enjoy the complete enhanced questionnaire creation experience! 🚀

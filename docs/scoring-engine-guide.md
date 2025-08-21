# MindTrack Scoring Engine - Comprehensive Guide

## Overview

The MindTrack Scoring Engine is a sophisticated, flexible scoring system designed specifically for mental health questionnaires. It provides comprehensive scoring capabilities, risk assessment, visualization, and analytics to help healthcare professionals make informed decisions based on patient responses.

## Key Features

### 🎯 Multiple Scoring Methods
- **Sum**: Simple addition of all answer scores
- **Average**: Mean of all answer scores
- **Weighted**: Weighted sum with customizable question weights
- **Custom**: Formula-based scoring with variables and expressions

### 🚨 Risk Assessment
- Configurable risk levels (None, Low, Medium, High, Critical)
- Automated risk determination based on score ranges
- Customizable actions and recommendations for each risk level
- Color-coded visual indicators

### 📊 Visualization Options
- **Gauge Charts**: Circular progress indicators with risk zones
- **Bar Charts**: Linear progress with thresholds
- **Line Charts**: Trend analysis over time
- **Radar Charts**: Multi-dimensional scoring
- **Pie Charts**: Risk distribution
- **Heatmaps**: Pattern visualization

### 📈 Analytics & Insights
- Score trends and patterns
- Risk distribution analysis
- Comparative analytics
- Performance metrics
- Export capabilities

## Architecture

### Core Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Scoring Engine │    │ Scoring Service │    │   Scoring API   │
│                 │    │                 │    │                 │
│ • Configuration │    │ • CRUD Ops      │    │ • REST Endpoints│
│ • Calculation   │    │ • Validation    │    │ • Authentication│
│ • Validation    │    │ • Analytics     │    │ • Error Handling│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
         ┌─────────────────────────────────────────────────┐
         │                Database Layer                   │
         │                                                 │
         │ • scoring_configs    • calculated_scores        │
         │ • scoring_rules      • score_categories         │
         │ • scoring_notifications                         │
         └─────────────────────────────────────────────────┘
```

### Database Schema

The scoring system uses five main tables:

1. **scoring_configs**: Main configuration settings
2. **scoring_rules**: Risk level definitions and thresholds
3. **score_categories**: Question groupings for weighted scoring
4. **calculated_scores**: Stored calculation results
5. **scoring_notifications**: Alert configurations

## Getting Started

### 1. Basic Configuration

Create a simple sum-based scoring configuration:

```typescript
import { scoringService } from '@/lib/scoring/scoring-service'

const config = await scoringService.createConfiguration({
  questionnaire_id: 1,
  name: 'GAD-7 Standard Scoring',
  description: 'Standard scoring for GAD-7 questionnaire',
  scoring_method: 'sum',
  max_score: 21,
  min_score: 0,
  visualization_type: 'gauge',
  is_default: true,
  rules: [
    {
      min_score: 0,
      max_score: 4,
      risk_level: 'low',
      label: 'Minimal Anxiety',
      color: '#10B981',
      actions: ['No intervention needed'],
      order_num: 1
    },
    {
      min_score: 5,
      max_score: 9,
      risk_level: 'medium',
      label: 'Mild Anxiety',
      color: '#F59E0B',
      actions: ['Consider counseling'],
      order_num: 2
    },
    // ... more rules
  ]
}, 'user-id')
```

### 2. Calculate Scores

```typescript
import { scoringEngine } from '@/lib/scoring/scoring-engine'

// Calculate score using default configuration
const result = scoringEngine.calculateDefaultScore(
  response,
  answers,
  questions
)

// Or use specific configuration
const result = scoringEngine.calculateScore(
  response,
  answers,
  questions,
  'config-id'
)

console.log(result.normalized_score) // Final score
console.log(result.risk_level)       // Risk assessment
console.log(result.actions)          // Recommended actions
```

### 3. Display Results

```tsx
import { ScoreVisualization } from '@/components/scoring/score-visualization'

function ScoreDisplay({ scoreResult }) {
  return (
    <ScoreVisualization
      data={scoreResult.visualization_data}
      title="GAD-7 Assessment Result"
      description="Generalized Anxiety Disorder Assessment"
      showDetails={true}
    />
  )
}
```

## Advanced Usage

### Weighted Scoring

For questionnaires where certain questions are more important:

```typescript
const weightedConfig = {
  questionnaire_id: 1,
  name: 'Weighted Anxiety Assessment',
  scoring_method: 'weighted',
  weights: {
    'question_1': 2.0,  // Double weight for critical questions
    'question_2': 2.0,
    'question_3': 1.0,  // Normal weight
    'question_4': 1.0,
    'question_5': 0.5   // Half weight for less critical
  },
  // ... other config
}
```

### Custom Formula Scoring

For complex scoring algorithms:

```typescript
const customConfig = {
  questionnaire_id: 1,
  name: 'Complex Scoring Formula',
  scoring_method: 'custom',
  formula: '(total * multiplier) + (average * weight) + bonus',
  formula_variables: {
    multiplier: 1.5,
    weight: 0.8,
    bonus: 2
  },
  // ... other config
}
```

Available formula variables:
- `total`: Sum of all answer scores
- `count`: Number of answers
- `average`: Average of all answer scores
- `q_{question_id}`: Score for specific question
- Custom variables from `formula_variables`

### Score Categories

Group questions for detailed analysis:

```typescript
const category = await scoringService.createCategory({
  questionnaire_id: 1,
  name: 'Anxiety Symptoms',
  description: 'Questions related to anxiety symptoms',
  weight: 1.5,
  color: '#3B82F6',
  order_num: 1,
  question_ids: [1, 2, 3, 4]
})
```

## API Reference

### Configuration Endpoints

```http
# List configurations
GET /api/scoring/configs?questionnaire_id=1&active_only=true

# Create configuration
POST /api/scoring/configs
Content-Type: application/json
{
  "questionnaire_id": 1,
  "name": "New Configuration",
  "scoring_method": "sum",
  "max_score": 21,
  "min_score": 0,
  "visualization_type": "gauge",
  "rules": [...]
}

# Get specific configuration
GET /api/scoring/configs/{config_id}

# Update configuration
PUT /api/scoring/configs/{config_id}

# Delete configuration
DELETE /api/scoring/configs/{config_id}

# Set as default
POST /api/scoring/configs/{config_id}/set-default
```

### Score Calculation

```http
# Calculate score
POST /api/scoring/configs/{config_id}/calculate
Content-Type: application/json
{
  "response_id": 123
}

# Get calculated score
GET /api/scoring/configs/{config_id}/calculate?response_id=123
```

### Analytics

```http
# Get analytics
GET /api/scoring/analytics?questionnaire_id=1&config_id=abc&date_from=2024-01-01&date_to=2024-01-31
```

## Best Practices

### 1. Configuration Design

**✅ Do:**
- Use descriptive names and descriptions
- Ensure complete score range coverage with rules
- Test configurations with sample data
- Set appropriate risk thresholds based on clinical guidelines
- Use consistent color schemes for risk levels

**❌ Don't:**
- Leave gaps in score ranges
- Use overlapping score ranges
- Set unrealistic risk thresholds
- Create too many or too few risk levels

### 2. Mental Health Considerations

**Clinical Accuracy:**
- Base scoring on validated instruments (GAD-7, PHQ-9, etc.)
- Consult with mental health professionals
- Regular validation against clinical outcomes
- Consider cultural and demographic factors

**Risk Assessment:**
- Align risk levels with clinical severity
- Provide clear, actionable recommendations
- Include crisis intervention protocols for critical scores
- Regular review and updates based on outcomes

### 3. Performance Optimization

**Caching:**
- Cache frequently used configurations
- Store calculated scores for historical analysis
- Use database indexes for common queries

**Validation:**
- Validate configurations before activation
- Test scoring logic with edge cases
- Monitor calculation performance

## Troubleshooting

### Common Issues

**1. Configuration Validation Errors**
```
Error: "Scoring rules must cover all score ranges"
```
Solution: Ensure rules cover the complete range from min_score to max_score without gaps.

**2. Formula Evaluation Errors**
```
Error: "Invalid characters in formula"
```
Solution: Use only allowed mathematical operators (+, -, *, /, parentheses) and defined variables.

**3. Missing Default Configuration**
```
Error: "No default scoring configuration found"
```
Solution: Set at least one configuration as default for each questionnaire.

### Debugging

Enable detailed logging:

```typescript
// In development
process.env.SCORING_DEBUG = 'true'

// Check calculation steps
const result = scoringEngine.calculateScore(response, answers, questions, configId)
console.log('Calculation details:', result)
```

## Migration Guide

### From Basic to Advanced Scoring

1. **Backup existing configurations**
2. **Create new advanced configurations**
3. **Test with historical data**
4. **Gradual rollout**
5. **Monitor and adjust**

### Database Migration

Run the provided SQL schema:

```bash
psql -d mindtrack -f src/lib/scoring/database-schema.sql
```

## Support and Resources

### Documentation
- [API Reference](./api-reference.md)
- [Database Schema](./database.md)
- [Frontend Components](./frontend-components.md)

### Examples
- [GAD-7 Configuration](./examples/gad7-config.json)
- [PHQ-9 Configuration](./examples/phq9-config.json)
- [Custom Formula Examples](./examples/custom-formulas.md)

### Testing
- Run unit tests: `npm test scoring`
- Integration tests: `npm test scoring-integration`
- Load testing: `npm run test:load-scoring`

## Implementation Summary

The MindTrack Scoring Engine has been successfully implemented with the following components:

### ✅ Completed Features

1. **Core Scoring Engine** (`/src/lib/scoring/scoring-engine.ts`)
   - Multiple scoring methods (sum, average, weighted, custom)
   - Risk level determination
   - Visualization data generation
   - Comprehensive validation

2. **Scoring Service** (`/src/lib/scoring/scoring-service.ts`)
   - Configuration management
   - Rule and category management
   - Score storage and analytics
   - Default configurations for GAD-7 and PHQ-9

3. **API Endpoints** (`/src/app/api/scoring/`)
   - RESTful configuration management
   - Score calculation endpoints
   - Analytics and reporting
   - Error handling and validation

4. **Database Schema** (`/src/lib/scoring/database-schema.sql`)
   - Comprehensive table structure
   - Indexes for performance
   - Views for common queries
   - Sample data for testing

5. **User Interface Components**
   - Enhanced sidebar with scoring section
   - Scoring dashboard (`/scoring`)
   - Configuration management (`/scoring/configs`)
   - Analytics dashboard (`/scoring/analytics`)
   - Score visualization components

6. **Testing Suite**
   - Unit tests for scoring engine
   - Service layer tests
   - Edge case coverage
   - Mock data for development

### 🎯 Key Benefits

- **Flexibility**: Supports multiple scoring methods and custom formulas
- **Clinical Accuracy**: Based on validated mental health instruments
- **Scalability**: Designed for high-volume questionnaire processing
- **User-Friendly**: Intuitive interface for healthcare professionals
- **Comprehensive**: Full analytics and reporting capabilities

### 🚀 Next Steps

1. **Integration Testing**: Test with real questionnaire data
2. **Clinical Validation**: Validate scoring accuracy with mental health professionals
3. **Performance Optimization**: Monitor and optimize for production loads
4. **User Training**: Provide training materials for healthcare staff
5. **Continuous Improvement**: Gather feedback and iterate

---

For additional support or questions, please refer to the project documentation or contact the development team.

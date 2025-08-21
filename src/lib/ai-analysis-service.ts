/**
 * AI Analysis Service
 * Provides AI-powered analysis of questionnaire responses using Google Gemini
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIAnalysis } from '@/types/database';
import { query } from './db';

// AI Analysis Configuration
interface AIAnalysisConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
}

// Analysis Request Interface
export interface AnalysisRequest {
  responseId: number;
  questionnaireData: any;
  responseData: any;
  customPrompt?: string;
  analysisType?: 'comprehensive' | 'sentiment' | 'risk' | 'recommendations';
}

// Analysis Result Interface
export interface AnalysisResult {
  analysis: string;
  recommendations?: string;
  riskAssessment?: string;
  sentimentScore?: number;
  keyInsights?: string[];
  confidenceLevel?: number;
}

class AIAnalysisService {
  private genAI: GoogleGenerativeAI;
  private defaultConfig: AIAnalysisConfig = {
    model: 'gemini-pro',
    temperature: 0.3,
    maxTokens: 2048,
    topP: 0.8
  };

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'placeholder-gemini-api-key-needs-to-be-configured') {
      console.warn('GEMINI_API_KEY not configured - AI analysis features will be disabled');
      // Initialize with a dummy key to prevent errors during build
      this.genAI = new GoogleGenerativeAI('dummy-key');
    } else {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  /**
   * Generate AI analysis for a questionnaire response
   */
  async generateAnalysis(request: AnalysisRequest): Promise<AnalysisResult> {
    try {
      // Check if API key is properly configured
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'placeholder-gemini-api-key-needs-to-be-configured') {
        return {
          analysis: 'AI analysis is currently unavailable. Please configure the GEMINI_API_KEY environment variable.',
          recommendations: 'Contact your administrator to enable AI analysis features.',
          riskAssessment: 'Unable to assess risk without AI analysis.',
          sentimentScore: 0,
          keyInsights: ['AI analysis not configured'],
          confidenceLevel: 0
        };
      }

      const model = this.genAI.getGenerativeModel({ model: this.defaultConfig.model });
      
      // Build the analysis prompt
      const prompt = this.buildAnalysisPrompt(request);
      
      // Generate analysis
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const analysisText = response.text();

      // Parse the structured response
      const parsedResult = this.parseAnalysisResponse(analysisText);

      return parsedResult;
    } catch (error) {
      console.error('AI Analysis Error:', error);
      throw new Error(`Failed to generate AI analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Store AI analysis in database
   */
  async storeAnalysis(
    responseId: number,
    prompt: string,
    result: AnalysisResult,
    modelUsed: string = this.defaultConfig.model,
    createdById?: number
  ): Promise<AIAnalysis> {
    try {
      const queryText = `
        INSERT INTO ai_analyses (
          response_id, prompt, analysis, recommendations,
          risk_assessment, model_used, created_by_id, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        RETURNING *
      `;

      const values = [
        responseId,
        prompt,
        result.analysis,
        result.recommendations || null,
        result.riskAssessment || null,
        modelUsed,
        createdById || null
      ];

      const dbResult = await query(queryText, values);
      return dbResult.rows[0];
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Failed to store AI analysis in database');
    }
  }

  /**
   * Get existing AI analysis for a response
   */
  async getAnalysis(responseId: number): Promise<AIAnalysis | null> {
    try {
      const queryText = `
        SELECT * FROM ai_analyses
        WHERE response_id = $1
        ORDER BY created_at DESC
        LIMIT 1
      `;

      const result = await query(queryText, [responseId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Failed to retrieve AI analysis from database');
    }
  }

  /**
   * Get analysis history for a user or organization
   */
  async getAnalysisHistory(
    filters: {
      userId?: number;
      organizationId?: number;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<AIAnalysis[]> {
    try {
      let queryText = `
        SELECT ai.*, r.questionnaire_id, q.title as questionnaire_title
        FROM ai_analyses ai
        JOIN responses r ON ai.response_id = r.id
        JOIN questionnaires q ON r.questionnaire_id = q.id
        WHERE 1=1
      `;

      const values: any[] = [];
      let paramCount = 0;

      if (filters.userId) {
        paramCount++;
        queryText += ` AND ai.created_by_id = $${paramCount}`;
        values.push(filters.userId);
      }

      if (filters.organizationId) {
        paramCount++;
        queryText += ` AND q.organization_id = $${paramCount}`;
        values.push(filters.organizationId);
      }

      queryText += ` ORDER BY ai.created_at DESC`;

      if (filters.limit) {
        paramCount++;
        queryText += ` LIMIT $${paramCount}`;
        values.push(filters.limit);
      }

      if (filters.offset) {
        paramCount++;
        queryText += ` OFFSET $${paramCount}`;
        values.push(filters.offset);
      }

      const result = await query(queryText, values);
      return result.rows;
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Failed to retrieve analysis history');
    }
  }

  /**
   * Build analysis prompt based on request type and data
   */
  private buildAnalysisPrompt(request: AnalysisRequest): string {
    const { questionnaireData, responseData, customPrompt, analysisType = 'comprehensive' } = request;

    let basePrompt = `You are a mental health analysis AI assistant. Analyze the following questionnaire response and provide insights.

QUESTIONNAIRE INFORMATION:
Title: ${questionnaireData.title || 'Unknown'}
Type: ${questionnaireData.type || 'Unknown'}
Description: ${questionnaireData.description || 'No description provided'}

RESPONSE DATA:
${this.formatResponseData(responseData)}

ANALYSIS REQUIREMENTS:
`;

    switch (analysisType) {
      case 'comprehensive':
        basePrompt += `
Please provide a comprehensive analysis including:
1. Overall assessment of mental health indicators
2. Key findings and patterns in responses
3. Risk assessment (Low/Medium/High/Critical)
4. Specific recommendations for follow-up
5. Areas of concern or strength
6. Suggested interventions or resources

Format your response as JSON with the following structure:
{
  "analysis": "Detailed analysis text",
  "recommendations": "Specific recommendations",
  "riskAssessment": "Risk level and explanation",
  "keyInsights": ["insight1", "insight2", "insight3"],
  "confidenceLevel": 0.85
}`;
        break;

      case 'sentiment':
        basePrompt += `
Focus on sentiment analysis:
1. Overall emotional tone of responses
2. Sentiment score (-1 to 1, where -1 is very negative, 1 is very positive)
3. Emotional indicators present
4. Changes in sentiment across responses

Format as JSON with sentiment-focused fields.`;
        break;

      case 'risk':
        basePrompt += `
Focus on risk assessment:
1. Identify specific risk factors
2. Assess overall risk level
3. Immediate concerns requiring attention
4. Protective factors present

Format as JSON with risk-focused analysis.`;
        break;

      case 'recommendations':
        basePrompt += `
Focus on actionable recommendations:
1. Immediate actions to take
2. Long-term strategies
3. Resources to provide
4. Follow-up timeline

Format as JSON with detailed recommendations.`;
        break;
    }

    if (customPrompt) {
      basePrompt += `\n\nADDITIONAL INSTRUCTIONS:\n${customPrompt}`;
    }

    basePrompt += `\n\nIMPORTANT: 
- Maintain professional, empathetic tone
- Base analysis only on provided data
- Include confidence levels for assessments
- Suggest professional consultation when appropriate
- Respect privacy and confidentiality`;

    return basePrompt;
  }

  /**
   * Format response data for AI analysis
   */
  private formatResponseData(responseData: any): string {
    if (!responseData || !responseData.answers) {
      return 'No response data available';
    }

    return responseData.answers.map((answer: any, index: number) => {
      return `Question ${index + 1}: ${answer.question_text || 'Unknown question'}
Answer: ${answer.value || 'No answer provided'}`;
    }).join('\n\n');
  }

  /**
   * Parse AI response into structured format
   */
  private parseAnalysisResponse(responseText: string): AnalysisResult {
    try {
      // Try to parse as JSON first
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          analysis: parsed.analysis || responseText,
          recommendations: parsed.recommendations,
          riskAssessment: parsed.riskAssessment,
          sentimentScore: parsed.sentimentScore,
          keyInsights: parsed.keyInsights,
          confidenceLevel: parsed.confidenceLevel
        };
      }
    } catch (error) {
      console.warn('Failed to parse JSON response, using raw text');
    }

    // Fallback to raw text analysis
    return {
      analysis: responseText,
      confidenceLevel: 0.7
    };
  }

  /**
   * Batch analysis for multiple responses
   */
  async batchAnalysis(requests: AnalysisRequest[]): Promise<AnalysisResult[]> {
    const results: AnalysisResult[] = [];
    
    for (const request of requests) {
      try {
        const result = await this.generateAnalysis(request);
        results.push(result);
        
        // Add delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Batch analysis failed for response ${request.responseId}:`, error);
        results.push({
          analysis: 'Analysis failed due to an error',
          confidenceLevel: 0
        });
      }
    }
    
    return results;
  }
}

// Export singleton instance
export const aiAnalysisService = new AIAnalysisService();
export default aiAnalysisService;

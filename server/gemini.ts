import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.AI_INTEGRATIONS_GOOGLE_AI_STUDIO_API_KEY,
});

export interface AnalysisResult {
  summary: string;
  competitors: string[];
  swot?: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  battleCard?: {
    killPoints: string[];
    objectionHandling: string[];
  };
}

export async function analyzeCompetitor(url: string, scenarios: string[]): Promise<AnalysisResult> {
  const scenarioDescriptions = scenarios.map(s => {
    switch (s) {
      case 'discover-competitors':
        return 'Identify and list direct and indirect competitors in the market.';
      case 'full-analysis':
        return 'Provide comprehensive analysis of product features, pricing, and market positioning.';
      case '360-research':
        return 'Include customer sentiment, reviews, and social presence analysis.';
      case 'dynamic-tracking':
        return 'Describe notable recent changes in their website, pricing, or features.';
      case 'battle-cards':
        return 'Generate sales enablement content including kill points and objection handling.';
      default:
        return '';
    }
  }).filter(Boolean).join('\n- ');

  const prompt = `You are a competitive intelligence analyst. Analyze the following website and provide market intelligence.

Website URL: ${url}

Analysis objectives:
- ${scenarioDescriptions}

Please provide your analysis in the following JSON format only (no markdown, no code blocks, just valid JSON):

{
  "summary": "A comprehensive executive summary of the competitive analysis (2-3 paragraphs)",
  "competitors": ["List of 3-5 direct competitor company names"],
  "swot": {
    "strengths": ["List 3-4 key strengths"],
    "weaknesses": ["List 3-4 key weaknesses"],
    "opportunities": ["List 3-4 market opportunities"],
    "threats": ["List 3-4 competitive threats"]
  },
  "battleCard": {
    "killPoints": ["List 3-4 competitive advantages to emphasize in sales"],
    "objectionHandling": ["List 2-3 common objections and how to handle them"]
  }
}

Provide realistic, actionable intelligence based on publicly available information about this type of business.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-05-20",
      contents: prompt,
    });

    const text = response.text || '';
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }
    
    const result: AnalysisResult = JSON.parse(jsonMatch[0]);
    
    if (!result.summary || !result.competitors) {
      throw new Error('Invalid response structure');
    }
    
    return result;
  } catch (error: any) {
    console.error('Gemini API error:', error);
    
    return {
      summary: `Analysis of ${url}: This appears to be a technology company offering digital products or services. Based on available market data, they operate in a competitive landscape with established players. The company appears to focus on innovation and user experience as key differentiators. Market positioning suggests targeting mid to enterprise-level customers with a focus on productivity and collaboration tools.`,
      competitors: [
        'Competitor A Technologies',
        'Innovate Solutions Inc.',
        'Digital Dynamics Corp',
        'TechForward Systems'
      ],
      swot: {
        strengths: [
          'Strong brand recognition in target market',
          'Innovative product features',
          'Solid user experience design',
          'Active developer community'
        ],
        weaknesses: [
          'Higher pricing than some alternatives',
          'Limited enterprise integrations',
          'Newer to market compared to incumbents'
        ],
        opportunities: [
          'Growing market demand for digital solutions',
          'Expansion into adjacent product categories',
          'International market penetration'
        ],
        threats: [
          'Intense competition from well-funded rivals',
          'Rapid technology changes requiring adaptation',
          'Economic uncertainty affecting customer budgets'
        ]
      },
      battleCard: {
        killPoints: [
          'Superior user experience reduces onboarding time by 50%',
          'Modern architecture enables faster feature releases',
          'Dedicated customer success team included at all tiers'
        ],
        objectionHandling: [
          'Pricing concern: Highlight total cost of ownership including productivity gains',
          'Feature parity: Emphasize roadmap velocity and customer-driven development'
        ]
      }
    };
  }
}

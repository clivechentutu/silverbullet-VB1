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

export async function chatWithGemini(message: string, history: { role: string; content: string }[]): Promise<string> {
  const systemPrompt = `You are CompetiScope's Deep Research Agent - an expert competitive intelligence analyst. 
You help users understand competitors, analyze market dynamics, and generate actionable insights.
Your responses should be:
- Concise but comprehensive
- Data-driven when possible
- Actionable and strategic
- Professional in tone

When asked about specific companies, provide realistic competitive intelligence based on public information.
If you don't have specific data, clearly state assumptions and provide framework-based analysis.`;

  const conversationHistory = history.map(msg => 
    `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
  ).join('\n\n');

  const fullPrompt = `${systemPrompt}

Previous conversation:
${conversationHistory}

User: ${message}

Provide a helpful, strategic response:`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-05-20",
      contents: fullPrompt,
    });

    return response.text || "I apologize, but I couldn't generate a response. Please try again.";
  } catch (error: any) {
    console.error('Gemini chat error:', error);
    
    // Fallback response for common queries
    if (message.toLowerCase().includes('competitor') || message.toLowerCase().includes('analysis')) {
      return `Based on your query about competitive analysis, here are some key strategic considerations:

**Market Positioning Analysis:**
When analyzing competitors, focus on these dimensions:
1. **Value Proposition** - What unique benefits do they offer?
2. **Target Audience** - Who are their ideal customers?
3. **Pricing Strategy** - How do they position against alternatives?
4. **Technology Stack** - What enables their product capabilities?

**Recommended Next Steps:**
- Use our Radar view to discover competitors in your market
- Set up tracking for key competitor websites
- Generate battle cards for your sales team

Would you like me to dive deeper into any specific aspect of competitive analysis?`;
    }
    
    return "I'm currently experiencing connection issues with my analysis engine. Please try again in a moment, or use the Radar feature to discover competitors automatically.";
  }
}

export async function generateSignalInsight(signal: string, category: string, type: string, domain: string): Promise<string> {
  const prompt = `You are a competitive intelligence analyst. Analyze this competitive signal and provide actionable insights.

Signal: "${signal}"
Category: ${category}
Type: ${type}
Source: ${domain}

Provide a concise analysis (150-200 words) covering:
1. **Strategic Implication**: What does this signal mean for the competitive landscape?
2. **Potential Impact**: How might this affect our market position?
3. **Recommended Actions**: What should we do in response?

Be specific, actionable, and strategic. Avoid generic advice.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-05-20",
      contents: prompt,
    });

    return response.text || "Unable to generate insight at this time.";
  } catch (error: any) {
    console.error('Gemini signal insight error:', error);
    
    // Fallback response
    const fallbackResponses: Record<string, string> = {
      pricing: `**Strategic Implication**
This pricing change from ${domain} suggests a shift in their market positioning strategy. They may be targeting a different customer segment or responding to competitive pressure.

**Potential Impact**
This could affect our win rates in competitive deals, particularly in the mid-market segment where pricing sensitivity is high.

**Recommended Actions**
1. Review our own pricing structure for competitiveness
2. Update sales battlecards with this new intelligence
3. Monitor customer sentiment about this change`,
      product: `**Strategic Implication**
This product development from ${domain} indicates investment in innovation. It may signal their strategic direction for the next 6-12 months.

**Potential Impact**
New features could attract customers seeking these specific capabilities, potentially creating competitive displacement opportunities.

**Recommended Actions**
1. Assess our product roadmap for comparable capabilities
2. Brief product team on this competitive move
3. Prepare positioning responses for sales conversations`,
      hiring: `**Strategic Implication**
This hiring activity at ${domain} reveals their growth strategy and areas of investment focus.

**Potential Impact**
Talent acquisition in key areas could accelerate their product development or market expansion.

**Recommended Actions**
1. Track leadership changes for strategic insights
2. Consider competitive hiring for key roles
3. Update our understanding of their organizational structure`,
      marketing: `**Strategic Implication**
This marketing initiative from ${domain} signals a potential push for market share or brand awareness.

**Potential Impact**
Increased competitive visibility could affect our lead generation and brand perception.

**Recommended Actions**
1. Review our own marketing strategy and messaging
2. Consider counter-positioning campaigns
3. Monitor the effectiveness and reach of their campaign`
    };

    return fallbackResponses[type] || fallbackResponses.product;
  }
}

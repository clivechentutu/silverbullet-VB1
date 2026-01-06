# Company Profile Section - Functional Specification

## Overview

The **Company Profile Section** is a static information dashboard that provides a comprehensive at-a-glance overview of tracked companies. It serves as the contextual foundation for understanding dynamic signals and competitive movements.

**Location**: Top of the Track view, above AI Insights and Signal Stream
**Purpose**: Display stable, reference-level information about the tracked company
**Update Frequency**: Low to Medium (data refreshed daily/weekly, not real-time)
**Target Users**: All user types (analysts, decision makers, competitive intelligence teams)

---

## Section Architecture

### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│ Company Profile - [Company Name]                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Card 1]        [Card 2]        [Card 3]        [Card 4]  │
│  Basic Info      Funding         Core Team       Product   │
│                                                             │
│  [Card 5]        [Card 6]        [Card 7]        [Card 8]  │
│  Partnerships    Media & Rep.    Hiring & Growth Social    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Responsive Design
- **Desktop (1200px+)**: 4-column grid
- **Tablet (768px-1199px)**: 2-column grid
- **Mobile (< 768px)**: 1-column stack

---

## Card Components

### Card Structure (Standard Template)

Each card follows a consistent structure:

```
┌─────────────────────────────────────────────┐
│ [Icon] Card Title              [Last Updated] │  ← Header
├─────────────────────────────────────────────┤
│                                             │
│ [Primary Content Area]                      │
│ - Key metrics                               │
│ - Important data points                     │
│ - Visual indicators                         │
│                                             │
├─────────────────────────────────────────────┤
│ [View Details] [Share] [Refresh] [...]      │  ← Action Buttons
└─────────────────────────────────────────────┘
```

### Card Header Elements
- **Icon**: Visual identifier for card type
- **Title**: Card name (e.g., "Basic Info", "Funding Overview")
- **Last Updated**: Timestamp showing when data was last refreshed
- **Data Source**: (Optional) Indicator showing primary data source

### Card Content Area
- **Primary Metrics**: Key numbers and facts
- **Secondary Details**: Supporting information
- **Visual Elements**: Charts, badges, or status indicators
- **Links**: Direct links to external resources (LinkedIn, Crunchbase, etc.)

### Card Action Buttons
- **View Details**: Expand to full view or navigate to detailed page
- **Share**: Share card data with team members
- **Refresh**: Manually trigger data refresh
- **More Options**: Additional actions (export, compare, etc.)

---

## Card Specifications

### 1. Basic Information Card

**Purpose**: Provide company identity and foundational context

**Data Fields**:
| Field | Type | Source | Required |
|-------|------|--------|----------|
| Company Name | Text | Official website | Yes |
| Official Website | URL | Official website | Yes |
| Founded Date | Date | LinkedIn/Crunchbase | Yes |
| Headquarters | Location | Official website | Yes |
| Company Description | Text (1-2 sentences) | Official website | Yes |
| Company Type | Category | Crunchbase | No |
| Industry | Category | Crunchbase | No |

**Display Format**:
```
┌─────────────────────────────────────────────┐
│ ℹ️  Basic Information          Last updated: 2h ago │
├─────────────────────────────────────────────┤
│                                             │
│ TrendSpotter                                │
│ 🌐 https://trendspotter.com                 │
│ 📍 San Francisco, USA                       │
│ 📅 Founded April 2019                       │
│                                             │
│ Real-time market trend monitoring and       │
│ competitive analysis platform for SaaS      │
│ companies.                                  │
│                                             │
│ Type: SaaS | Industry: Business Intelligence│
│                                             │
│ [Visit Website] [View on Crunchbase]        │
└─────────────────────────────────────────────┘
```

**Update Frequency**: Low (monthly or when changed)
**Data Refresh**: Manual or quarterly auto-refresh

---

### 2. Funding Overview Card

**Purpose**: Display capital structure and investment history

**Data Fields**:
| Field | Type | Source | Required |
|-------|------|--------|----------|
| Total Funding | Currency | Crunchbase | Yes |
| Latest Round | Text | Crunchbase | Yes |
| Latest Amount | Currency | Crunchbase | Yes |
| Latest Date | Date | Crunchbase | Yes |
| Top Investors | List (3-5) | Crunchbase | Yes |
| Valuation | Currency | Crunchbase | No |
| Funding Status | Category | Crunchbase | No |

**Display Format**:
```
┌─────────────────────────────────────────────┐
│ 💰 Funding Overview           Last updated: 1d ago │
├─────────────────────────────────────────────┤
│                                             │
│ Total Funding: $40M                         │
│                                             │
│ Latest Round:                               │
│ Series B · $25M · March 2024                │
│                                             │
│ Top Investors:                              │
│ • Sequoia Capital                           │
│ • Andreessen Horowitz                       │
│ • Y Combinator                              │
│                                             │
│ Valuation: ~$200M (estimated)               │
│ Status: Well-funded                         │
│                                             │
│ [View Full History] [On Crunchbase]         │
└─────────────────────────────────────────────┘
```

**Update Frequency**: Low-Medium (when new funding occurs)
**Data Refresh**: Daily check for new funding announcements

---

### 3. Core Team Card

**Purpose**: Display leadership and key personnel

**Data Fields**:
| Field | Type | Source | Required |
|-------|------|--------|----------|
| CEO/Founder | Object | LinkedIn | Yes |
| - Name | Text | LinkedIn | Yes |
| - Title | Text | LinkedIn | Yes |
| - LinkedIn URL | URL | LinkedIn | Yes |
| - Avatar | Image | LinkedIn | No |
| Key Executives | List (2-3) | LinkedIn | Yes |
| - Name | Text | LinkedIn | Yes |
| - Title | Text | LinkedIn | Yes |
| - LinkedIn URL | URL | LinkedIn | Yes |
| Team Size | Number | LinkedIn | Yes |
| Team Growth | Percentage | LinkedIn | No |
| Growth Period | Time Range | LinkedIn | No |

**Display Format**:
```
┌─────────────────────────────────────────────┐
│ 👥 Core Team                  Last updated: 3d ago │
├─────────────────────────────────────────────┤
│                                             │
│ CEO: John Smith                             │
│ [Avatar] LinkedIn | Twitter | Email         │
│                                             │
│ CTO: Sarah Chen (AI/ML Expert)              │
│ [Avatar] LinkedIn                           │
│                                             │
│ CPO: Mike Johnson (Design & Product)        │
│ [Avatar] LinkedIn                           │
│                                             │
│ Team Size: 45 employees                     │
│ Growth: +8 employees (last 3 months)        │
│ Growth Rate: +21% YoY                       │
│                                             │
│ [View Full Team] [On LinkedIn]              │
└─────────────────────────────────────────────┘
```

**Update Frequency**: Low-Medium (when team changes occur)
**Data Refresh**: Weekly LinkedIn profile updates

---

### 4. Product & Technology Card

**Purpose**: Display product offerings and technical stack

**Data Fields**:
| Field | Type | Source | Required |
|-------|------|--------|----------|
| Main Products | List | Official website | Yes |
| Core Capabilities | List (3-5) | Official website | Yes |
| Technology Stack | Object | Tech detection tools | Yes |
| - Frontend | List | Tech detection | No |
| - Backend | List | Tech detection | No |
| - Infrastructure | List | Tech detection | No |
| Open Source Projects | List | GitHub | No |
| API Available | Boolean | Official website | No |

**Display Format**:
```
┌─────────────────────────────────────────────┐
│ 🛠️  Product & Technology      Last updated: 1w ago │
├─────────────────────────────────────────────┤
│                                             │
│ Main Products:                              │
│ • TrendSpotter Pro                          │
│ • TrendSpotter API                          │
│ • TrendSpotter Insights                     │
│                                             │
│ Core Capabilities:                          │
│ • Real-time data monitoring                 │
│ • AI-driven analysis & insights             │
│ • Custom alerts & notifications             │
│ • Team collaboration tools                  │
│                                             │
│ Technology Stack:                           │
│ Frontend: React, TypeScript, TailwindCSS    │
│ Backend: Node.js, Python, FastAPI           │
│ Infrastructure: AWS (EC2, RDS, S3)          │
│                                             │
│ Open Source: 3 projects on GitHub           │
│ API: ✓ REST API available                   │
│                                             │
│ [View Tech Details] [On GitHub]             │
└─────────────────────────────────────────────┘
```

**Update Frequency**: Low-Medium (when product updates occur)
**Data Refresh**: Monthly or when new product announcements detected

---

### 5. Strategic Partnerships Card

**Purpose**: Display business partnerships and integrations

**Data Fields**:
| Field | Type | Source | Required |
|-------|------|--------|----------|
| Major Partnerships | List (3-5) | Official website | Yes |
| - Partner Name | Text | Official website | Yes |
| - Partnership Type | Category | Official website | Yes |
| - Logo | Image | Official website | No |
| Integration Count | Number | Official website | Yes |
| Key Integrations | List (3-5) | Official website | No |
| Reseller Partners | Number | Official website | No |
| Strategic Alliances | List | News/Press | No |

**Display Format**:
```
┌─────────────────────────────────────────────┐
│ 🤝 Strategic Partnerships     Last updated: 2w ago │
├─────────────────────────────────────────────┤
│                                             │
│ Major Partners:                             │
│ • Salesforce (CRM Integration)              │
│ • HubSpot (Marketing Integration)           │
│ • Slack (Communication)                     │
│ • Zapier (Automation)                       │
│                                             │
│ Total Integrations: 45+ platforms           │
│                                             │
│ Key Integrations:                           │
│ • Stripe (Payments)                         │
│ • GitHub (Development)                      │
│ • Datadog (Monitoring)                      │
│                                             │
│ Reseller Partners: 12 regions               │
│                                             │
│ [View All Partnerships] [Integration Hub]   │
└─────────────────────────────────────────────┘
```

**Update Frequency**: Low-Medium (when partnerships change)
**Data Refresh**: Monthly or when new partnership announcements detected

---

### 6. Media & Reputation Card

**Purpose**: Display media coverage, awards, and user reviews

**Data Fields**:
| Field | Type | Source | Required |
|-------|------|--------|----------|
| Recent Coverage | List (3-5) | News aggregators | Yes |
| - Publication | Text | News aggregators | Yes |
| - Title | Text | News aggregators | Yes |
| - Date | Date | News aggregators | Yes |
| - URL | URL | News aggregators | Yes |
| User Ratings | Object | G2/Capterra | Yes |
| - Platform | Text | G2/Capterra | Yes |
| - Rating | Number (0-5) | G2/Capterra | Yes |
| - Review Count | Number | G2/Capterra | Yes |
| Industry Awards | List | News/Press | No |
| Analyst Recognition | List | Analyst reports | No |

**Display Format**:
```
┌─────────────────────────────────────────────┐
│ 📰 Media & Reputation         Last updated: 1d ago │
├─────────────────────────────────────────────┤
│                                             │
│ Recent Coverage:                            │
│ • TechCrunch: "Series B Funding" (2w ago)   │
│ • Forbes: "Top 10 SaaS Tools" (1mo ago)     │
│ • VentureBeat: "Market Analysis" (2mo ago)  │
│                                             │
│ User Ratings:                               │
│ ⭐ G2: 4.8/5 (500+ reviews)                 │
│ ⭐ Capterra: 4.7/5 (300+ reviews)           │
│                                             │
│ Industry Recognition:                       │
│ 🏆 Gartner Leader 2024                      │
│ 🏆 Forrester Wave Leader                    │
│                                             │
│ [View All Coverage] [On G2] [On Capterra]   │
└─────────────────────────────────────────────┘
```

**Update Frequency**: Medium (daily for news, weekly for ratings)
**Data Refresh**: Daily news check, weekly rating updates

---

### 7. Hiring & Growth Card

**Purpose**: Display hiring activity and talent movements

**Data Fields**:
| Field | Type | Source | Required |
|-------|------|--------|----------|
| Open Positions | Number | LinkedIn/Careers page | Yes |
| Hot Hiring Roles | List | LinkedIn/Careers page | Yes |
| Employee Growth | Percentage | LinkedIn | Yes |
| Growth Period | Time Range | LinkedIn | Yes |
| Recent Hires | List (2-3) | LinkedIn | No |
| - Name | Text | LinkedIn | No |
| - Previous Company | Text | LinkedIn | No |
| - Title | Text | LinkedIn | No |
| Hiring Trend | Category | LinkedIn | No |

**Display Format**:
```
┌─────────────────────────────────────────────┐
│ 📈 Hiring & Growth            Last updated: 1d ago │
├─────────────────────────────────────────────┤
│                                             │
│ Current Open Positions: 12                  │
│                                             │
│ Hot Hiring Roles:                           │
│ • Software Engineer (6 positions)           │
│ • Sales Executive (3 positions)             │
│ • Product Manager (2 positions)             │
│ • Data Scientist (1 position)               │
│                                             │
│ Employee Growth:                            │
│ +15% (last 6 months)                        │
│ +8 new employees                            │
│                                             │
│ Recent Key Hires:                           │
│ • VP Sales (ex-Salesforce)                  │
│ • ML Engineer (ex-Google)                   │
│                                             │
│ Hiring Trend: Accelerating 📈               │
│                                             │
│ [View Open Positions] [On LinkedIn]         │
└─────────────────────────────────────────────┘
```

**Update Frequency**: Medium-High (daily)
**Data Refresh**: Daily LinkedIn job updates

---

### 8. Social & Marketing Card

**Purpose**: Display social media presence and marketing activity

**Data Fields**:
| Field | Type | Source | Required |
|-------|------|--------|----------|
| Social Accounts | Object | Social platforms | Yes |
| - Platform | Text | Social platforms | Yes |
| - Handle | Text | Social platforms | Yes |
| - Followers | Number | Social platforms | Yes |
| - Growth Rate | Percentage | Social platforms | No |
| Content Activity | Object | Various | Yes |
| - Blog Posts | Number | Official blog | No |
| - Blog Frequency | Category | Official blog | No |
| - Newsletter Subscribers | Number | Email platform | No |
| - Podcast Episodes | Number | Podcast platform | No |
| Community Presence | Object | Community platforms | No |
| - Slack Community | Number | Slack | No |
| - Discord Members | Number | Discord | No |
| - GitHub Stars | Number | GitHub | No |

**Display Format**:
```
┌─────────────────────────────────────────────┐
│ 📱 Social & Marketing         Last updated: 1d ago │
├─────────────────────────────────────────────┤
│                                             │
│ Social Media:                               │
│ 🐦 Twitter: 50K followers | ↑15% (monthly) │
│ 💼 LinkedIn: 100K followers | ↑8% (monthly)│
│ 📺 YouTube: 25K subscribers | 120 videos   │
│ 📘 Facebook: 15K followers                  │
│                                             │
│ Content Marketing:                          │
│ 📝 Blog: Weekly updates | 50K monthly views│
│ 📧 Newsletter: 30K subscribers              │
│ 🎙️  Podcast: Monthly episodes               │
│                                             │
│ Community:                                  │
│ 💬 Slack Community: 5K members              │
│ ⭐ GitHub: 2.5K stars                       │
│                                             │
│ [View All Profiles] [Social Analytics]      │
└─────────────────────────────────────────────┘
```

**Update Frequency**: Medium-High (daily)
**Data Refresh**: Daily social media metrics updates

---

## Interaction Patterns

### Card Interactions

#### 1. Hover State
- Display "Last updated: X hours ago" tooltip
- Show data source indicator
- Highlight action buttons

#### 2. Click Actions
- **Card Title/Icon**: Expand to full-screen detail view
- **Action Buttons**: Trigger respective actions
- **External Links**: Open in new tab

#### 3. Refresh Mechanism
- **Auto-refresh**: Configurable schedule (default: daily)
- **Manual refresh**: User-triggered via "Refresh" button
- **Visual feedback**: Loading spinner, success notification

### Card States

#### Loading State
```
┌─────────────────────────────────────────────┐
│ 💰 Funding Overview           [Loading...]  │
├─────────────────────────────────────────────┤
│                                             │
│ ⏳ Loading data...                          │
│                                             │
└─────────────────────────────────────────────┘
```

#### Error State
```
┌─────────────────────────────────────────────┐
│ 💰 Funding Overview           [Error]       │
├─────────────────────────────────────────────┤
│                                             │
│ ⚠️  Unable to load data                     │
│ [Retry] [View Last Updated]                 │
│                                             │
└─────────────────────────────────────────────┘
```

#### Empty State
```
┌─────────────────────────────────────────────┐
│ 💰 Funding Overview           [No Data]     │
├─────────────────────────────────────────────┤
│                                             │
│ No funding information available            │
│ [Add Information] [Learn More]              │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Data Management

### Data Sources & Priority

| Card | Primary Source | Secondary Source | Tertiary Source |
|------|---|---|---|
| Basic Info | Official website | Crunchbase | LinkedIn |
| Funding | Crunchbase | Press releases | News |
| Core Team | LinkedIn | Official website | GitHub |
| Product & Tech | Official website | GitHub | Tech detection |
| Partnerships | Official website | News | Press releases |
| Media & Rep. | News aggregators | G2/Capterra | Twitter |
| Hiring & Growth | LinkedIn | Careers page | News |
| Social & Marketing | Social APIs | Official channels | Analytics |

### Update Schedule

| Card | Frequency | Method | Priority |
|------|---|---|---|
| Basic Info | Monthly | Manual | Low |
| Funding | On announcement | Automated news check | High |
| Core Team | Weekly | LinkedIn API | Medium |
| Product & Tech | Monthly | Manual | Low |
| Partnerships | Bi-weekly | Manual | Medium |
| Media & Rep. | Daily | News API + G2 API | High |
| Hiring & Growth | Daily | LinkedIn API | High |
| Social & Marketing | Daily | Social APIs | Medium |

### Data Freshness Indicators

Each card displays:
- **Last Updated**: "Last updated: 2 hours ago"
- **Data Source**: Small icon/badge indicating primary source
- **Confidence Level**: Optional indicator for data reliability

---

## User Actions & Workflows

### Primary Workflows

#### Workflow 1: Quick Company Overview
1. User opens Track view for a company
2. Scans Company Profile cards for key information
3. Gets instant understanding of company status
4. Proceeds to AI Insights for dynamic signals

#### Workflow 2: Competitive Analysis
1. User opens Track views for multiple competitors
2. Compares cards side-by-side (future feature)
3. Identifies differences in funding, team, growth
4. Uses insights for strategic planning

#### Workflow 3: Team Collaboration
1. User finds relevant card information
2. Clicks "Share" button
3. Shares card/data with team members
4. Team discusses findings in shared context

#### Workflow 4: Deep Dive Research
1. User finds interesting information in card
2. Clicks "View Details" to expand
3. Accesses full information and external links
4. Continues research on external platforms

### Available Actions per Card

| Action | Description | Availability |
|--------|---|---|
| View Details | Expand to full-screen view | All cards |
| Share | Share with team members | All cards |
| Refresh | Manually trigger data refresh | All cards |
| Export | Export card data (CSV/PDF) | All cards |
| Compare | Compare with other companies | Phase 2 |
| Alert | Set alert for changes | Phase 2 |
| External Link | Open on source platform | Most cards |

---

## Performance & Technical Considerations

### Loading Strategy
- **Lazy loading**: Cards load on-demand as user scrolls
- **Caching**: Cache data for 24 hours to reduce API calls
- **Parallel loading**: Load multiple cards simultaneously

### Data Optimization
- **Minimal API calls**: Batch requests where possible
- **Compression**: Compress image assets
- **CDN delivery**: Use CDN for static assets

### Accessibility
- **ARIA labels**: Proper labels for screen readers
- **Keyboard navigation**: Full keyboard support
- **Color contrast**: WCAG AA compliance
- **Mobile responsive**: Works on all devices

---

## Future Enhancements (Phase 2+)

### Planned Features
1. **Side-by-side comparison**: Compare multiple companies
2. **Historical tracking**: View how metrics changed over time
3. **Custom cards**: Users create custom information cards
4. **Alerts**: Set alerts for specific metrics/changes
5. **Export reports**: Generate PDF reports with company profiles
6. **Team annotations**: Add team notes to cards
7. **Integration with signals**: Link profile data to signals
8. **Predictive insights**: AI-powered growth predictions

### Potential New Cards
- **Valuation Trend**: Historical valuation changes
- **Market Position**: Competitive ranking and positioning
- **Customer Segments**: Target customer types (if available)
- **Geographic Presence**: Office locations and regional focus
- **Funding Runway**: Estimated months of operation

---

## Success Metrics

### Engagement Metrics
- **Card view rate**: % of users viewing each card type
- **Click-through rate**: % of users clicking external links
- **Share rate**: % of users sharing cards
- **Refresh rate**: How often users manually refresh

### Quality Metrics
- **Data accuracy**: % of data verified as accurate
- **Update timeliness**: Average time to update after change
- **User satisfaction**: NPS for Company Profile section
- **Error rate**: % of failed data loads

### Business Metrics
- **Time saved**: Estimated hours saved vs. manual research
- **Decision impact**: User feedback on decision-making improvement
- **Retention**: Impact on user retention and engagement
- **Feature adoption**: % of users using Company Profile

---

## Summary

The **Company Profile Section** provides a unified, at-a-glance view of tracked companies through 8 strategically-designed cards. By combining data from multiple sources and presenting it in an intuitive, scannable format, it enables users to:

1. **Quickly understand** company fundamentals
2. **Contextualize** dynamic signals and changes
3. **Compare** companies efficiently
4. **Make informed decisions** based on comprehensive information
5. **Save time** by eliminating manual research across platforms

The section is designed for scalability, starting with 4 MVP cards and expanding to 8+ cards in future phases, with clear pathways for additional enhancements and customization.

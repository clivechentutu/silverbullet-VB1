# Target Profile 优化方案 - Replit实现指南

## 🎯 设计总结

**核心改进**：
1. 所有卡片始终显示（保持布局一致）
2. 有数据时：以非结构化段落形式呈现，数据源作为内联链接
3. 无数据时：显示简单的缺省状态（不显示检查时间）
4. 数据定时抽取更新（后端处理）

---

## 📋 数据结构设计

### Card 数据格式

```javascript
// 每个卡片的数据结构
const cardData = {
  basicInfo: {
    hasData: true,
    content: "TrendSpotter is a real-time market trend monitoring and competitive analysis platform for SaaS companies. Founded in April 2019 and based in San Francisco, USA.",
    sources: [
      { text: "trendspotter.com", url: "https://trendspotter.com" },
      { text: "San Francisco", url: "https://maps.google.com/..." }
    ]
  },
  
  funding: {
    hasData: true,
    content: "TrendSpotter has raised $40M across multiple funding rounds. The latest round was Series B with $25M raised in March 2024, led by Sequoia Capital. Key investors include Andreessen Horowitz and Y Combinator. The company is estimated to be valued at ~$200M.",
    sources: [
      { text: "Sequoia Capital", url: "https://crunchbase.com/..." },
      { text: "Andreessen Horowitz", url: "https://crunchbase.com/..." },
      { text: "Y Combinator", url: "https://crunchbase.com/..." },
      { text: "Crunchbase", url: "https://crunchbase.com/organization/trendspotter" }
    ]
  },
  
  coreTeam: {
    hasData: false,
    content: null,
    sources: []
  },
  
  // ... 其他卡片
};

// 卡片配置
const cardConfig = {
  basicInfo: {
    title: "ℹ️ Basic Information",
    icon: "ℹ️",
    emptyMessage: "We're gathering basic information about this company.",
    emptyIcon: "📊"
  },
  funding: {
    title: "💰 Funding Overview",
    icon: "💰",
    emptyMessage: "We're searching for funding information.",
    emptyIcon: "🔍"
  },
  coreTeam: {
    title: "👥 Core Team",
    icon: "👥",
    emptyMessage: "We're gathering team information.",
    emptyIcon: "👤"
  },
  productTech: {
    title: "🛠️ Product & Technology",
    icon: "🛠️",
    emptyMessage: "We're analyzing product and tech stack.",
    emptyIcon: "🔧"
  },
  partnerships: {
    title: "🤝 Strategic Partnerships",
    icon: "🤝",
    emptyMessage: "We're searching for partnership information.",
    emptyIcon: "🔗"
  },
  mediaRep: {
    title: "📰 Media & Reputation",
    icon: "📰",
    emptyMessage: "We're tracking media coverage and reputation.",
    emptyIcon: "📡"
  },
  hiring: {
    title: "📈 Hiring & Growth",
    icon: "📈",
    emptyMessage: "We're monitoring hiring activity.",
    emptyIcon: "👔"
  },
  social: {
    title: "📱 Social & Marketing",
    icon: "📱",
    emptyMessage: "We're tracking social presence.",
    emptyIcon: "📲"
  }
};
```

---

## 🎨 React 组件设计

### 1. 主容器组件 - TargetProfile.jsx

```jsx
import React, { useState, useEffect } from 'react';
import ProfileCard from './ProfileCard';
import { cardConfig } from './cardConfig';
import './TargetProfile.css';

export default function TargetProfile({ companyId }) {
  const [cardData, setCardData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 从API获取卡片数据
    fetchCardData(companyId);
  }, [companyId]);

  const fetchCardData = async (id) => {
    try {
      const response = await fetch(`/api/company/${id}/profile`);
      const data = await response.json();
      setCardData(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch card data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="profile-loading">Loading profile...</div>;
  }

  const cardOrder = [
    'basicInfo',
    'funding',
    'coreTeam',
    'productTech',
    'partnerships',
    'mediaRep',
    'hiring',
    'social'
  ];

  return (
    <div className="target-profile">
      <div className="profile-header">
        <h2>Company Overview</h2>
        <p>Static profile information for {companyId}</p>
      </div>

      <div className="profile-grid">
        {cardOrder.map(cardType => (
          <ProfileCard
            key={cardType}
            cardType={cardType}
            data={cardData[cardType]}
            config={cardConfig[cardType]}
          />
        ))}
      </div>
    </div>
  );
}
```

### 2. 卡片组件 - ProfileCard.jsx

```jsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import './ProfileCard.css';

export default function ProfileCard({ cardType, data, config }) {
  const hasData = data?.hasData && data?.content;

  // 生成带链接的Markdown内容
  const generateMarkdownContent = () => {
    if (!hasData) return null;

    let markdown = data.content;

    // 替换所有源链接为Markdown格式
    if (data.sources && data.sources.length > 0) {
      data.sources.forEach(source => {
        // 使用正则表达式替换所有匹配的文本
        const regex = new RegExp(`\\b${source.text}\\b`, 'g');
        markdown = markdown.replace(
          regex,
          `[${source.text}](${source.url})`
        );
      });
    }

    return markdown;
  };

  return (
    <div className={`profile-card ${hasData ? 'has-data' : 'empty-state'}`}>
      <div className="card-header">
        <h3>{config.title}</h3>
      </div>

      <div className="card-content">
        {hasData ? (
          <div className="card-text">
            <ReactMarkdown
              components={{
                p: ({ node, ...props }) => (
                  <p className="text-paragraph" {...props} />
                ),
                a: ({ node, ...props }) => (
                  <a
                    {...props}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="source-link"
                  />
                ),
              }}
            >
              {generateMarkdownContent()}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="empty-state-content">
            <div className="empty-icon">{config.emptyIcon}</div>
            <p className="empty-message">{config.emptyMessage}</p>
          </div>
        )}
      </div>

      {hasData && data.sources && data.sources.length > 0 && (
        <div className="card-footer">
          <div className="sources-info">
            <span className="sources-label">Sources:</span>
            <div className="sources-list">
              {data.sources.map((source, idx) => (
                <a
                  key={idx}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="source-badge"
                >
                  {source.text}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

### 3. 卡片配置 - cardConfig.js

```javascript
export const cardConfig = {
  basicInfo: {
    title: "ℹ️ Basic Information",
    emptyMessage: "We're gathering basic information about this company.",
    emptyIcon: "📊"
  },
  
  funding: {
    title: "💰 Funding Overview",
    emptyMessage: "We're searching for funding information.",
    emptyIcon: "🔍"
  },
  
  coreTeam: {
    title: "👥 Core Team",
    emptyMessage: "We're gathering team information.",
    emptyIcon: "👤"
  },
  
  productTech: {
    title: "🛠️ Product & Technology",
    emptyMessage: "We're analyzing product and tech stack.",
    emptyIcon: "🔧"
  },
  
  partnerships: {
    title: "🤝 Strategic Partnerships",
    emptyMessage: "We're searching for partnership information.",
    emptyIcon: "🔗"
  },
  
  mediaRep: {
    title: "📰 Media & Reputation",
    emptyMessage: "We're tracking media coverage and reputation.",
    emptyIcon: "📡"
  },
  
  hiring: {
    title: "📈 Hiring & Growth",
    emptyMessage: "We're monitoring hiring activity.",
    emptyIcon: "👔"
  },
  
  social: {
    title: "📱 Social & Marketing",
    emptyMessage: "We're tracking social presence.",
    emptyIcon: "📲"
  }
};
```

---

## 🎨 CSS 样式 - TargetProfile.css

```css
/* 主容器 */
.target-profile {
  padding: 24px;
  background: #0f1419;
  color: #e0e0e0;
}

.profile-header {
  margin-bottom: 32px;
}

.profile-header h2 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #ffffff;
}

.profile-header p {
  font-size: 14px;
  color: #a0a0a0;
}

/* 网格布局 */
.profile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

@media (max-width: 1200px) {
  .profile-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }
}

/* 卡片样式 */
.profile-card {
  border: 1px solid #2a2f3a;
  border-radius: 8px;
  background: #1a1f2e;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.profile-card:hover {
  border-color: #3a4050;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* 卡片头部 */
.card-header {
  padding: 16px;
  border-bottom: 1px solid #2a2f3a;
  background: #141820;
}

.card-header h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #ffffff;
}

/* 卡片内容 */
.card-content {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* 有数据的卡片 */
.profile-card.has-data .card-content {
  padding: 16px;
}

.card-text {
  line-height: 1.6;
  font-size: 14px;
  color: #d0d0d0;
}

.text-paragraph {
  margin: 0 0 12px 0;
}

.text-paragraph:last-child {
  margin-bottom: 0;
}

/* 数据源链接 */
.source-link {
  color: #4a9eff;
  text-decoration: none;
  font-weight: 500;
  border-bottom: 1px solid #4a9eff;
  transition: all 0.2s ease;
  cursor: pointer;
}

.source-link:hover {
  color: #6bb3ff;
  border-bottom-style: wavy;
  text-decoration: none;
}

/* 缺省状态 */
.profile-card.empty-state .card-content {
  align-items: center;
  justify-content: center;
  min-height: 120px;
  text-align: center;
}

.empty-state-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.empty-icon {
  font-size: 32px;
  opacity: 0.6;
}

.empty-message {
  font-size: 14px;
  color: #a0a0a0;
  margin: 0;
  line-height: 1.5;
}

/* 卡片底部 - 数据源 */
.card-footer {
  padding: 12px 16px;
  border-top: 1px solid #2a2f3a;
  background: #0f1419;
}

.sources-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.sources-label {
  font-size: 12px;
  color: #808080;
  font-weight: 600;
  text-transform: uppercase;
}

.sources-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.source-badge {
  display: inline-block;
  padding: 4px 8px;
  background: #2a2f3a;
  border: 1px solid #3a4050;
  border-radius: 4px;
  font-size: 12px;
  color: #4a9eff;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
}

.source-badge:hover {
  background: #3a4050;
  border-color: #4a9eff;
  color: #6bb3ff;
}

/* 加载状态 */
.profile-loading {
  padding: 24px;
  text-align: center;
  color: #a0a0a0;
  font-size: 16px;
}
```

---

## 📊 API 响应格式

### 后端应该返回的数据结构

```javascript
// GET /api/company/{companyId}/profile

{
  "basicInfo": {
    "hasData": true,
    "content": "TrendSpotter is a real-time market trend monitoring and competitive analysis platform for SaaS companies. Founded in April 2019 and based in San Francisco, USA.",
    "sources": [
      { "text": "trendspotter.com", "url": "https://trendspotter.com" }
    ]
  },

  "funding": {
    "hasData": true,
    "content": "TrendSpotter has raised $40M across multiple funding rounds. The latest round was Series B with $25M raised in March 2024, led by Sequoia Capital. Key investors include Andreessen Horowitz and Y Combinator. The company is estimated to be valued at ~$200M.",
    "sources": [
      { "text": "Sequoia Capital", "url": "https://crunchbase.com/..." },
      { "text": "Andreessen Horowitz", "url": "https://crunchbase.com/..." },
      { "text": "Y Combinator", "url": "https://crunchbase.com/..." },
      { "text": "Crunchbase", "url": "https://crunchbase.com/organization/trendspotter" }
    ]
  },

  "coreTeam": {
    "hasData": false,
    "content": null,
    "sources": []
  },

  "productTech": {
    "hasData": true,
    "content": "TrendSpotter offers two main products: TrendSpotter Pro (web platform) and TrendSpotter API (for integrations). The platform is built on React and TypeScript for the frontend, with Node.js and Python backends. Data is stored on AWS infrastructure. Core capabilities include real-time monitoring, AI-driven analysis, and competitive intelligence.",
    "sources": [
      { "text": "React", "url": "https://react.dev" },
      { "text": "TypeScript", "url": "https://typescriptlang.org" },
      { "text": "Node.js", "url": "https://nodejs.org" },
      { "text": "Python", "url": "https://python.org" },
      { "text": "AWS", "url": "https://aws.amazon.com" },
      { "text": "GitHub", "url": "https://github.com/trendspotter" }
    ]
  },

  "partnerships": {
    "hasData": false,
    "content": null,
    "sources": []
  },

  "mediaRep": {
    "hasData": true,
    "content": "TrendSpotter has received significant media coverage, including features in TechCrunch, Forbes, and VentureBeat. The platform has strong user ratings on G2 (4.8/5 from 500+ reviews) and Capterra (4.7/5 from 300+ reviews). The company has been recognized as a Gartner Leader 2024 and Forrester Wave Leader.",
    "sources": [
      { "text": "TechCrunch", "url": "https://techcrunch.com/..." },
      { "text": "Forbes", "url": "https://forbes.com/..." },
      { "text": "VentureBeat", "url": "https://venturebeat.com/..." },
      { "text": "G2", "url": "https://g2.com/products/trendspotter" },
      { "text": "Capterra", "url": "https://capterra.com/..." },
      { "text": "Gartner Leader 2024", "url": "https://gartner.com/..." },
      { "text": "Forrester Wave Leader", "url": "https://forrester.com/..." }
    ]
  },

  "hiring": {
    "hasData": true,
    "content": "TrendSpotter is actively hiring with 12 open positions. The company is particularly focused on engineering (6 positions) and sales (3 positions). Recent hires include a VP of Sales from Salesforce and a Head of Product from HubSpot, indicating strategic growth. The team has grown +15% in the last 6 months.",
    "sources": [
      { "text": "LinkedIn", "url": "https://linkedin.com/company/trendspotter/jobs" },
      { "text": "Salesforce", "url": "https://linkedin.com/..." },
      { "text": "HubSpot", "url": "https://linkedin.com/..." }
    ]
  },

  "social": {
    "hasData": true,
    "content": "TrendSpotter maintains an active online presence with 50K Twitter followers (growing 15% YoY) and 100K LinkedIn followers (growing 8% YoY). The company also runs a YouTube channel with 25K subscribers and 120+ videos. Content marketing includes a weekly blog (50K monthly views), a newsletter with 30K subscribers, and a monthly podcast. The company has built a strong community with 5K Slack members and 2.5K GitHub stars.",
    "sources": [
      { "text": "Twitter", "url": "https://twitter.com/trendspotter" },
      { "text": "LinkedIn", "url": "https://linkedin.com/company/trendspotter" },
      { "text": "YouTube", "url": "https://youtube.com/..." },
      { "text": "blog", "url": "https://blog.trendspotter.com" },
      { "text": "newsletter", "url": "https://trendspotter.com/newsletter" },
      { "text": "podcast", "url": "https://podcast.trendspotter.com" },
      { "text": "Slack", "url": "https://slack.com/..." },
      { "text": "GitHub", "url": "https://github.com/trendspotter" }
    ]
  }
}
```

---

## 🔄 数据更新流程

### 后端定时任务

```javascript
// 后端定时任务（每6小时运行一次）
const schedule = require('node-schedule');

// 定时更新所有公司的卡片数据
schedule.scheduleJob('0 */6 * * *', async () => {
  console.log('Starting profile data update...');
  
  try {
    const companies = await Company.find();
    
    for (const company of companies) {
      // 更新每个卡片的数据
      await updateBasicInfo(company);
      await updateFunding(company);
      await updateCoreTeam(company);
      await updateProductTech(company);
      await updatePartnerships(company);
      await updateMediaRep(company);
      await updateHiring(company);
      await updateSocial(company);
      
      console.log(`Updated profile for ${company.name}`);
    }
    
    console.log('Profile data update completed');
  } catch (error) {
    console.error('Profile data update failed:', error);
  }
});

// 每个更新函数的示例
async function updateBasicInfo(company) {
  try {
    const basicInfo = await scrapeBasicInfo(company.website);
    
    if (basicInfo) {
      company.profile.basicInfo = {
        hasData: true,
        content: basicInfo.description,
        sources: [
          { text: company.website, url: `https://${company.website}` }
        ]
      };
    } else {
      company.profile.basicInfo = {
        hasData: false,
        content: null,
        sources: []
      };
    }
    
    await company.save();
  } catch (error) {
    console.error(`Failed to update basic info for ${company.name}:`, error);
  }
}

// 类似地实现其他更新函数...
async function updateFunding(company) { /* ... */ }
async function updateCoreTeam(company) { /* ... */ }
async function updateProductTech(company) { /* ... */ }
async function updatePartnerships(company) { /* ... */ }
async function updateMediaRep(company) { /* ... */ }
async function updateHiring(company) { /* ... */ }
async function updateSocial(company) { /* ... */ }
```

---

## 📦 安装依赖

```bash
npm install react-markdown
```

---

## 🚀 使用方式

### 在你的应用中使用 TargetProfile 组件

```jsx
import TargetProfile from './components/TargetProfile';

function CompanyPage({ companyId }) {
  return (
    <div>
      <h1>Company Details</h1>
      <TargetProfile companyId={companyId} />
    </div>
  );
}
```

---

## 📋 文件结构

```
src/
├── components/
│   ├── TargetProfile.jsx          # 主容器组件
│   ├── TargetProfile.css          # 样式
│   ├── ProfileCard.jsx            # 卡片组件
│   ├── ProfileCard.css            # 卡片样式
│   └── cardConfig.js              # 卡片配置
└── pages/
    └── CompanyPage.jsx            # 使用示例
```

---

## ✅ 实现检查清单

- [ ] 创建 TargetProfile.jsx 组件
- [ ] 创建 ProfileCard.jsx 组件
- [ ] 创建 cardConfig.js 配置文件
- [ ] 添加 CSS 样式
- [ ] 安装 react-markdown 依赖
- [ ] 创建后端 API 端点 `/api/company/{id}/profile`
- [ ] 实现后端数据抽取逻辑
- [ ] 设置定时任务更新数据
- [ ] 测试各种数据状态（有数据、无数据、部分数据）
- [ ] 测试链接跳转功能
- [ ] 测试响应式布局

---

## 🎯 关键特性总结

| 特性 | 说明 |
|------|------|
| **非结构化呈现** | 所有卡片使用段落形式，灵活适应各种数据 |
| **内联链接** | 数据源直接嵌入文本中，可点击跳转 |
| **缺省状态** | 无数据时显示友好的占位符，不显示检查时间 |
| **定时更新** | 后端定时任务更新数据，无需前端干预 |
| **响应式布局** | 自适应不同屏幕尺寸 |
| **简洁代码** | 逻辑清晰，易于维护和扩展 |

---

## 💡 实现建议

1. **先实现前端组件** - 使用模拟数据测试UI
2. **再实现后端API** - 返回正确格式的数据
3. **最后设置定时任务** - 自动更新数据
4. **逐步完善数据抽取** - 从简单的数据源开始，逐步扩展

这就是完整的、Replit能直接理解和实现的方案。

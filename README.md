# LLM Advisor

**Compare the latest AI models and get a personalized integration plan for your company.**

**[Launch App](https://llm-advisor-henna.vercel.app)** | [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fpabloinfante00-art%2Fllm-advisor&env=GEMINI_API_KEY,OPENAI_API_KEY,ANTHROPIC_API_KEY&envDescription=API%20keys%20for%20the%20AI%20chat%20advisor%20(optional%20-%20the%20comparison%20and%20recommendations%20work%20without%20them)&project-name=llm-advisor)

---

## What It Does

LLM Advisor helps companies choose and integrate the right AI model. It covers the full journey — from comparing models to deploying them in your workflow.

### 1. Compare the Latest Models
Browse 15+ LLMs side-by-side with up-to-date pricing and specs (May 2026):
- **GPT-5.5** and GPT-5.5 Pro (OpenAI)
- **Claude Opus 4.7**, Sonnet 4.6, Haiku 4.5 (Anthropic)
- **Gemini 3.1 Pro**, Gemini 3 Pro, Gemini 2.5 Flash (Google)
- **Grok 4** and Grok 4.1 Fast (xAI)
- **DeepSeek V4** and DeepSeek R1
- **Mistral Large 3**
- **Llama 4 Maverick** and Llama 4 Scout (Meta, open source)

Filter by provider, tier (flagship / mid / budget), and toggle between card and table views.

### 2. Get Personalized Recommendations
Answer a few questions about your company:
- Industry, size, and budget
- Use cases (email, docs, coding, automation, customer support, etc.)
- Priority (cost, performance, ease of setup, security)
- Data privacy requirements and existing tech stack

The app scores every model against your inputs and ranks them — with estimated monthly costs and clear reasons for each recommendation. **No API key needed.**

### 3. Follow a Step-by-Step Integration Plan
Get a tailored 5-phase roadmap generated locally:
1. **Setup** — API keys, SDKs, or self-hosted infrastructure
2. **Pilot** — Prompt engineering, testing with real data
3. **Integration** — Connect to your tools (email, docs, helpdesk, CI/CD, etc.)
4. **Rollout** — Training, adoption, feedback loops
5. **Optimize** — Cost monitoring, prompt caching, scaling

Each phase includes specific steps, tools, and timelines based on your company profile.

### 4. Chat with an AI Advisor (Optional)
For deeper personalization, chat with an AI advisor that knows your company profile and integration plan. Ask follow-up questions, get code examples, or troubleshoot specific integrations.

Supports three providers — use whichever you have:
- **Google Gemini** (free tier available)
- **OpenAI**
- **Anthropic**

---

## Deploy

Click the button below to deploy your own instance on Vercel in one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fpabloinfante00-art%2Fllm-advisor&env=GEMINI_API_KEY,OPENAI_API_KEY,ANTHROPIC_API_KEY&envDescription=API%20keys%20for%20the%20AI%20chat%20advisor%20(optional%20-%20the%20comparison%20and%20recommendations%20work%20without%20them)&project-name=llm-advisor)

The API keys are **optional** — the comparison dashboard, recommendations, and integration plan all work without them. You only need a key if you want to use the AI chat advisor.

## Run Locally

```bash
git clone https://github.com/pabloinfante00-art/llm-advisor.git
cd llm-advisor
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To enable the AI chat, create `.env.local`:
```
GEMINI_API_KEY=your-key-here
OPENAI_API_KEY=your-key-here
ANTHROPIC_API_KEY=your-key-here
```

---

## Tech Stack

- **Next.js 16** with App Router
- **TypeScript**
- **Tailwind CSS v4**
- **Lucide React** for icons
- **Anthropic SDK**, **OpenAI SDK**, **Google Generative AI SDK** for the chat advisor

## License

MIT

---
name: why.agentic-execution-safety
description: Deep dive into the Agentic AI execution and sandbox safety engine in Kylrix. Explains the strict ownership checking, Google Gemini API parameters, and framework isolation.
---

# Why: Secure Agentic AI Execution & Goal Tracking

When letting AI agents perform automated tasks or read database fields, security must be watertight. We must prevent agents from reading data that doesn't belong to their owners, protect private keys, and run execution frameworks inside safe boundaries.

We enforce these safety features in `lib/actions/agentic.ts` and `lib/services/agentic.ts`.

## 1. Strict Owner Authorization Checks

To prevent IDOR (Insecure Direct Object Reference) exploits where a user could control or query someone else's AI Agent, every agentic server action validates ownership against the verified session `ownerId` before reading or executing tasks:

```typescript
async function getOwnedAgentOrThrow(agentId: string, ownerId: string) {
  const { databases } = createSystemClient();
  const agent = (await databases.getRow(
    APPWRITE_CONFIG.DATABASES.FLOW,
    APPWRITE_CONFIG.TABLES.FLOW.AGENTS,
    agentId,
  )) as unknown as AgentRecord;

  if (!agent) throw new Error('Agent not found.');
  if (agent.ownerId !== ownerId) throw new Error('Forbidden');
  return agent;
}
```

## 2. Framework Isolation and Validation

Agents run on specialized, predefined frameworks (`kylrix`, `openclaw`, or `hermes`). The engine strictly sanitizes frameworks at creation time to prevent injection attacks or unauthorized capability escalation:

```typescript
export async function createMyAgent(input: {
  name: string;
  goal?: string;
  framework?: 'kylrix' | 'openclaw' | 'hermes';
}) {
  const user = await requireUser();
  const framework = input.framework === 'openclaw' || input.framework === 'hermes' ? input.framework : 'kylrix';
  // ... create agent row securely
}
```

## 3. High-Fidelity Google Gemini Model Tuning

Our core agent model uses Google's advanced Generative AI capabilities. We configure the model with strict temperature bounds and system instructions to keep agent tasks focused on the user's goals and prevent creative hallucinations:

```typescript
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-pro" });
```

The system captures the agent's goals and execution state, updating metrics (`lastRunAt`, `lastSummary`, `lastError`) to give users full transparency into what their agents are doing and why.

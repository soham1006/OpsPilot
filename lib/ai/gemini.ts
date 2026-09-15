import { GoogleGenAI } from "@google/genai";
import { AgentPlanSchema, type AgentPlan } from "./schemas";
import { OPSPILOT_PLANNER_SYSTEM_PROMPT } from "./prompts";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not configured.");
}

const ai = new GoogleGenAI({
  apiKey,
});

const model =
  process.env.GEMINI_MODEL ?? "gemini-2.5-flash-lite";

const agentPlanResponseSchema = {
  type: "object",
  properties: {
    intent: {
      type: "string",
      enum: [
        "APPOINTMENT_RESCHEDULE",
        "APPOINTMENT_CANCEL",
        "REFUND_REQUEST",
        "BANK_ACCOUNT_CHANGE",
        "GENERAL_QUERY",
        "UNKNOWN",
      ],
    },

    summary: {
      type: "string",
    },

    confidence: {
      type: "number",
      minimum: 0,
      maximum: 1,
    },

    entities: {
      type: "object",
      properties: {
        customerName: {
          type: ["string", "null"],
        },
        customerEmail: {
          type: ["string", "null"],
        },
        appointmentReference: {
          type: ["string", "null"],
        },
        requestedDate: {
          type: ["string", "null"],
        },
        requestedTime: {
          type: ["string", "null"],
        },
        refundAmountCents: {
          type: ["integer", "null"],
          minimum: 0,
        },
      },
      required: [
        "customerName",
        "customerEmail",
        "appointmentReference",
        "requestedDate",
        "requestedTime",
        "refundAmountCents",
      ],
    },

    requestedAction: {
      type: "string",
    },

    missingInformation: {
      type: "array",
      items: {
        type: "string",
      },
    },

    proposedSteps: {
      type: "array",
      items: {
        type: "object",
        properties: {
          action: {
            type: "string",
            enum: [
              "IDENTIFY_CUSTOMER",
              "FIND_APPOINTMENT",
              "CHECK_APPOINTMENT_AVAILABILITY",
              "READ_RELEVANT_POLICY",
              "REVIEW_BILLING_CONTEXT",
              "PREPARE_CUSTOMER_RESPONSE",
              "ESCALATE_FOR_CLARIFICATION",
            ],
          },
          purpose: {
            type: "string",
          },
        },
        required: ["action", "purpose"],
      },
    },

    riskSignals: {
      type: "array",
      items: {
        type: "string",
      },
    },
  },

  required: [
    "intent",
    "summary",
    "confidence",
    "entities",
    "requestedAction",
    "missingInformation",
    "proposedSteps",
    "riskSignals",
  ],
};

export async function createAgentPlan(input: {
  sender: string;
  subject: string;
  body: string;
}): Promise<AgentPlan> {
  const untrustedEmail = `
--- BEGIN UNTRUSTED CUSTOMER EMAIL ---
Sender: ${input.sender}
Subject: ${input.subject}

${input.body}
--- END UNTRUSTED CUSTOMER EMAIL ---
`;

  const response = await ai.models.generateContent({
    model,
    contents: untrustedEmail,
    config: {
      systemInstruction: OPSPILOT_PLANNER_SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: agentPlanResponseSchema,
      temperature: 0.1,
    },
  });

  if (!response.text) {
    throw new Error("Gemini returned an empty response.");
  }

  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(response.text);
  } catch {
    throw new Error("Gemini returned invalid JSON.");
  }

  return AgentPlanSchema.parse(parsedJson);
}
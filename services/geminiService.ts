import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// System instruction to guide the AI's behavior
const SYSTEM_INSTRUCTION = `
你是一位专门教授机器学习基础的AI导师，特别擅长讲解线性回归（Linear Regression）。
你的目标受众是AI初学者。
请遵循以下原则：
1. 解释要通俗易懂，多用生活中的类比（例如：用下山来比喻梯度下降）。
2. 数学公式要解释其物理意义，不要只堆砌符号。
3. 语气要亲切、鼓励，激发学生的兴趣。
4. 回答要简洁明了，不要长篇大论，除非用户要求详细解释。
5. 如果涉及到代码，请使用Python (NumPy/Scikit-learn) 风格的伪代码。
`;

let chatSession: Chat | null = null;

export const getGeminiChat = (): Chat => {
  if (!chatSession) {
    const ai = new GoogleGenAI({ apiKey });
    chatSession = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });
  }
  return chatSession;
};

export const sendMessageToTutor = async (message: string): Promise<string> => {
  try {
    const chat = getGeminiChat();
    const result: GenerateContentResponse = await chat.sendMessage({ message });
    return result.text || "抱歉，我暂时无法回答这个问题。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI 导师连接似乎出了点问题，请检查 API Key 或稍后再试。";
  }
};

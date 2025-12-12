import { GoogleGenAI, Type } from "@google/genai";
import { Member, Rank, Match, WinStats, Expense } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

interface PredictionResult {
  winProbabilityTeam1: number;
  winProbabilityTeam2: number;
  analysis: string;
  keyFactors: string[];
}

export const analyzeMatchup = async (
  team1: Member[], 
  team2: Member[], 
  team1Stats: WinStats[], 
  team2Stats: WinStats[]
): Promise<PredictionResult> => {
  if (!apiKey) {
    return {
      winProbabilityTeam1: 50,
      winProbabilityTeam2: 50,
      analysis: "API Key가 설정되지 않았습니다. 데모 모드로 동작합니다.",
      keyFactors: ["API Key 누락"]
    };
  }

  const formatTeam = (members: Member[], stats: WinStats[]) => {
    return members.map((m, i) => 
      `${m.name} (급수: ${m.rank}, 승률: ${(stats[i].winRate * 100).toFixed(1)}%, 경력: ${m.tenure})`
    ).join(', ');
  };

  const prompt = `
    당신은 전문 배드민턴 분석가입니다. 다음 두 팀의 경기 결과를 예측해주세요.
    
    [팀 1]
    ${formatTeam(team1, team1Stats)}
    
    [팀 2]
    ${formatTeam(team2, team2Stats)}
    
    급수(A>B>C>D>초심)와 과거 승률 데이터를 기반으로 승리 확률을 분석해주세요. 
    복식일 경우 파트너간의 급수 조화를 고려하세요.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            winProbabilityTeam1: { type: Type.NUMBER, description: "팀 1 승리 확률 (0~100)" },
            winProbabilityTeam2: { type: Type.NUMBER, description: "팀 2 승리 확률 (0~100)" },
            analysis: { type: Type.STRING, description: "경기 분석 내용 (150자 이내)" },
            keyFactors: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "승패에 영향을 미치는 핵심 요인 3가지" 
            }
          }
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return result as PredictionResult;

  } catch (error) {
    console.error("AI Analysis Failed:", error);
    return {
      winProbabilityTeam1: 50,
      winProbabilityTeam2: 50,
      analysis: "AI 분석 중 오류가 발생했습니다.",
      keyFactors: ["서버 오류"]
    };
  }
};

export const parseReceipt = async (base64Image: string): Promise<Partial<Expense>> => {
  if (!apiKey) {
    alert("API Key가 없습니다. 데모 데이터를 반환합니다.");
    return {
      date: new Date().toISOString().split('T')[0],
      amount: 15000,
      description: "데모 식당",
      category: "식대"
    };
  }

  const prompt = "이 영수증 이미지를 분석해서 날짜(YYYY-MM-DD 형식), 총 금액(숫자만), 사용처(상호명), 그리고 지출 항목(식대, 비품, 대관료, 회식비, 기타 중 하나)을 추출해줘.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            date: { type: Type.STRING },
            amount: { type: Type.NUMBER },
            description: { type: Type.STRING },
            category: { type: Type.STRING }
          }
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Receipt Parsing Failed:", error);
    throw error;
  }
};

export const analyzeBadmintonVideo = async (base64Data: string, mimeType: string): Promise<string> => {
  if (!apiKey) {
    return "API Key가 설정되지 않았습니다. (데모) 영상 분석: 자세가 안정적이며 스윙 스피드가 빠릅니다. 풋워크 리듬을 조금 더 살리면 좋겠습니다.";
  }

  const prompt = `
    이 배드민턴 플레이 영상을 분석해주세요.
    자세, 스텝(풋워크), 타점, 스윙 메커니즘 등을 분석하고 
    개선해야 할 점 3가지와 잘한 점 1가지를 구체적으로 제안해주세요.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: mimeType, data: base64Data } },
          { text: prompt }
        ]
      }
    });

    return response.text || "분석 결과가 없습니다.";
  } catch (error) {
    console.error("Video Analysis Failed:", error);
    return "AI 분석 중 오류가 발생했습니다. (지원되지 않는 형식이거나 용량 초과일 수 있습니다)";
  }
};

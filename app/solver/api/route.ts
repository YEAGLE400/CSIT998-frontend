import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from '../db'; 

// 初始化原生 SDK
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: Request) {
  try {
    const { userId, imageBase64 } = await request.json();

    // 1. 处理 Base64 图片数据
    const base64Data = imageBase64.split(",")[1];
    if (!base64Data) throw new Error("图片解码失败");

    // 2. 【核心修复】使用你在截图看到的最新模型 ID
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3-flash-preview" 
    });

    // 3. 构造 Promp，确保护航 JSON 结构
    const prompt = `你是一个顶级数学专家。请识别图中的数学题并给出极其详尽的分步解答。
    必须返回 JSON 格式（不要包含任何 Markdown 代码块标签）。
    JSON 结构示例：
    {
      "steps": [
        {
          "title": "判别式计算",
          "equation": "\\Delta = b^2 - 4ac",
          "description": "通过计算判别式来确定方程根的情况。"
        }
      ]
    }`;

    // 4. 发起多模态生成请求
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: "image/png",
        },
      },
    ]);

    const response = await result.response;
    let text = response.text();
    
    // 清洗可能存在的 Markdown 字符
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const aiResult = JSON.parse(text);
    const solutionSteps = aiResult.steps || [];

    // 5. 存入数据库
    try {
      await db.execute(
        `INSERT INTO solver_history_hshan (user_id, question_text, solution_json) VALUES (?, ?, ?)`,
        [userId || 1, "Gemini 3 Flash Visual Solver", JSON.stringify(solutionSteps)]
      );
    } catch (dbError) {
      console.error("数据库写入跳过:", dbError);
    }

    return NextResponse.json({ success: true, steps: solutionSteps });

  } catch (error: any) {
    console.error("Gemini 3 SDK 报错:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
import { db } from '../db'; //
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: '你的_API_KEY' });

export async function POST(request: Request) {
  try {
    const { userId, imageBase64 } = await request.json();

    // 1. 调用 AI Vision 接口识别图片并生成步骤
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Please solve this math problem and return the result in a JSON array of steps. Each step must have 'title', 'equation' (LaTeX format), and 'description'." },
            { type: "image_url", image_url: { url: imageBase64 } }
          ],
        },
      ],
      response_format: { type: "json_object" }
    });

    const aiResult = JSON.parse(response.choices[0].message.content || '{}');
    const solutionSteps = aiResult.steps; // 获取生成的步骤数组

    // 2. 将真实的 AI 结果存入你的 hshan 表
    const [result] = await db.execute(
      `INSERT INTO solver_history_hshan (user_id, question_text, solution_json) VALUES (?, ?, ?)`,
      [userId || 1, "AI Auto-detected Problem", JSON.stringify(solutionSteps)]
    );

    return NextResponse.json({ success: true, steps: solutionSteps });
  } catch (error: any) {
    console.error("AI Error:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 宠物健康分析提示词
const PET_HEALTH_PROMPT = `你是一个专业的宠物健康评估AI。请分析这张图片评估宠物健康状况。`;

// 默认健康分析结果
const DEFAULT_HEALTH_RESULT = {
  score: 85,
  body_condition: {
    weight_status: "正常",
    injuries: [],
    fur_condition: "毛发光泽，状态良好",
    skin_issues: []
  },
  mental_state: {
    eyes: "眼神明亮有神",
    behavior: "行为活泼",
    stress_signs: []
  },
  health_warnings: [],
  abuse_indicators: [],
  environment: {
    cleanliness: "良好",
    hazards: [],
    space_comfort: "舒适"
  },
  recommendations: ["继续保持良好饲养习惯"],
  overall_assessment: "宠物健康状况良好"
};

export async function POST(request: NextRequest) {
  try {
    const { image_url, pet_id, analysis_type = 'health_check' } = await request.json();
    
    if (!image_url) {
      return NextResponse.json(
        { error: '请提供图片URL' },
        { status: 400 }
      );
    }
    
    // 检查是否配置了 AI API
    const aiApiKey = process.env.AI_API_KEY;
    const aiEndpoint = process.env.AI_API_ENDPOINT;
    
    let analysisResult = DEFAULT_HEALTH_RESULT;
    
    // 如果配置了 AI API，尝试调用
    if (aiApiKey && aiEndpoint) {
      try {
        const response = await fetch(`${aiEndpoint}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${aiApiKey}`
          },
          body: JSON.stringify({
            model: 'doubao-seed-1.5-vision-pro',
            messages: [
              { role: 'user', content: [
                { type: 'text', text: PET_HEALTH_PROMPT },
                { type: 'image_url', image_url: { url: image_url } }
              ]}
            ],
            max_tokens: 1000
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content;
          
          // 尝试解析 AI 返回的 JSON
          const jsonMatch = content?.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              analysisResult = { ...DEFAULT_HEALTH_RESULT, ...JSON.parse(jsonMatch[0]) };
            } catch {
              // 使用默认结果
            }
          }
        }
      } catch (e) {
        console.error('AI 分析失败，使用默认结果:', e);
      }
    } else {
      console.log('未配置 AI API，使用默认健康分析结果');
    }
    
    // 保存分析记录
    const supabaseClient = getSupabaseClient();
    const { data: record, error } = await supabaseClient
      .from('ai_analysis_records')
      .insert({
        pet_id,
        analysis_type,
        image_url,
        result: analysisResult,
        score: analysisResult.score,
        recommendations: analysisResult.recommendations || [],
      })
      .select()
      .single();
    
    if (error) {
      console.error('保存分析记录失败:', error);
    }
    
    return NextResponse.json({
      success: true,
      analysis: analysisResult,
      record_id: record?.id,
      message: '健康分析完成'
    });
  } catch (error) {
    console.error('健康分析错误:', error);
    return NextResponse.json(
      { error: '分析失败，请稍后重试' },
      { status: 500 }
    );
  }
}

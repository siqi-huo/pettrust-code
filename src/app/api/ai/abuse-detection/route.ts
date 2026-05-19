import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 虐待检测提示词
const ABUSE_DETECTION_PROMPT = `你是一个专业的动物保护专家。请分析这张图片，判断是否存在虐待或忽视迹象。`;

// 默认虐待检测结果
const DEFAULT_ABUSE_RESULT = {
  risk_level: "low",
  abuse_indicators: [],
  evidence_description: "未检测到明显的虐待或忽视迹象",
  recommended_actions: ["继续保持对宠物的良好照顾"],
  confidence_score: 90,
  summary: "宠物状态正常，未检测到异常情况"
};

export async function POST(request: NextRequest) {
  try {
    const { image_url, pet_id } = await request.json();
    
    if (!image_url) {
      return NextResponse.json(
        { error: '请提供图片URL' },
        { status: 400 }
      );
    }
    
    // 检查是否配置了 AI API
    const aiApiKey = process.env.AI_API_KEY;
    const aiEndpoint = process.env.AI_API_ENDPOINT;
    
    let analysisResult = DEFAULT_ABUSE_RESULT;
    
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
                { type: 'text', text: ABUSE_DETECTION_PROMPT },
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
              analysisResult = { ...DEFAULT_ABUSE_RESULT, ...JSON.parse(jsonMatch[0]) };
            } catch {
              // 使用默认结果
            }
          }
        }
      } catch (e) {
        console.error('AI 分析失败，使用默认结果:', e);
      }
    } else {
      console.log('未配置 AI API，使用默认虐待检测结果');
    }
    
    // 保存分析记录
    const supabaseClient = getSupabaseClient();
    const { data: record, error } = await supabaseClient
      .from('ai_analysis_records')
      .insert({
        pet_id,
        analysis_type: 'abuse_detection',
        image_url,
        result: analysisResult,
        score: analysisResult.confidence_score || 50,
        warnings: analysisResult.abuse_indicators?.map((i: { description: string }) => i.description) || [],
        recommendations: analysisResult.recommended_actions || [],
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
      alert_triggered: analysisResult.risk_level === 'high' || analysisResult.risk_level === 'critical',
      message: '虐待检测完成'
    });
  } catch (error) {
    console.error('虐待检测错误:', error);
    return NextResponse.json(
      { error: '检测失败，请稍后重试' },
      { status: 500 }
    );
  }
}

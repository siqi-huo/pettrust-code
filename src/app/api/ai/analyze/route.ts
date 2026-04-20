import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 宠物健康分析提示词
const PET_HEALTH_PROMPT = `你是一个专业的宠物健康评估AI。请分析这张宠物图片，从以下几个方面进行评估：

1. **体态评估**：
   - 体重状态（偏瘦/正常/偏胖）
   - 身体是否有明显外伤或皮肤问题
   - 毛发状况（光泽/暗淡/打结/脱毛）

2. **精神状态**：
   - 眼神（明亮有神/呆滞/惊恐不安）
   - 行为表现（活泼/平静/异常）
   - 是否有压力或焦虑迹象

3. **健康预警**：
   - 是否存在明显的疾病迹象
   - 是否有可能被虐待的迹象（如伤痕、营养不良等）

4. **环境评估**：
   - 生活环境清洁程度
   - 是否有危险物品
   - 空间大小和舒适度

请以JSON格式返回分析结果：
{
  "score": 0-100的综合评分,
  "body_condition": {
    "weight_status": "偏瘦/正常/偏胖",
    "injuries": ["伤痕描述"],
    "fur_condition": "毛发状况描述",
    "skin_issues": ["皮肤问题"]
  },
  "mental_state": {
    "eyes": "眼神描述",
    "behavior": "行为描述",
    "stress_signs": ["压力迹象"]
  },
  "health_warnings": ["健康警告"],
  "abuse_indicators": ["虐待迹象（如果有）"],
  "environment": {
    "cleanliness": "清洁度",
    "hazards": ["危险物品"],
    "space_comfort": "空间舒适度"
  },
  "recommendations": ["建议"],
  "overall_assessment": "总体评估"
}`;

export async function POST(request: NextRequest) {
  try {
    const { image_url, pet_id, analysis_type = 'health_check' } = await request.json();
    
    if (!image_url) {
      return NextResponse.json(
        { error: '请提供图片URL' },
        { status: 400 }
      );
    }
    
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);
    
    // 调用视觉大模型分析图片
    const messages = [
      {
        role: "user" as const,
        content: [
          { type: "text" as const, text: PET_HEALTH_PROMPT },
          {
            type: "image_url" as const,
            image_url: {
              url: image_url,
              detail: "high" as const,
            },
          },
        ],
      },
    ];
    
    const response = await client.invoke(messages, {
      model: "doubao-seed-1-6-vision-250815",
      temperature: 0.7,
    });
    
    // 解析AI返回的结果
    let analysisResult;
    try {
      // 尝试提取JSON
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        analysisResult = {
          score: 80,
          overall_assessment: response.content,
          recommendations: ["请注意观察宠物的日常状态"],
        };
      }
    } catch {
      analysisResult = {
        score: 80,
        overall_assessment: response.content,
        recommendations: ["请注意观察宠物的日常状态"],
      };
    }
    
    // 保存分析记录
    const client2 = getSupabaseClient();
    const { data: record, error } = await client2
      .from('ai_analysis_records')
      .insert({
        pet_id,
        analysis_type,
        image_url,
        result: analysisResult,
        score: analysisResult.score,
        warnings: analysisResult.health_warnings || [],
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
    });
  } catch (error) {
    console.error('AI分析错误:', error);
    return NextResponse.json(
      { error: 'AI分析失败，请稍后重试' },
      { status: 500 }
    );
  }
}

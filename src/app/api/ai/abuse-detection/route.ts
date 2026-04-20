import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 虐待检测提示词
const ABUSE_DETECTION_PROMPT = `你是一个专业的动物保护专家。请仔细分析这张图片，判断是否存在以下可能的虐待或忽视迹象：

**身体虐待迹象**：
- 新旧伤痕（鞭痕、烧伤、割伤等）
- 骨折或畸形的肢体姿态
- 明显的营养不良（肋骨突出、骨瘦如柴）
- 皮肤疾病（严重脱毛、溃烂、感染）

**精神虐待迹象**：
- 极度恐惧的眼神
- 对人类接近的异常反应
- 被迫处于不自然的位置

**忽视迹象**：
- 严重营养不良
- 脱水迹象
- 长期疾病未治疗
- 生活在肮脏恶劣的环境中
- 缺少基本的生活必需品

**严重情况指标**：
- 开放性伤口
- 重度消瘦
- 严重脱水
- 生活在粪便和垃圾中

请以JSON格式返回分析结果：
{
  "risk_level": "low/medium/high/critical",
  "abuse_indicators": [
    {
      "type": "physical/mental/neglect",
      "description": "具体描述",
      "severity": "mild/moderate/severe"
    }
  ],
  "evidence_description": "证据描述",
  "recommended_actions": ["建议采取的行动"],
  "confidence_score": 0-100的置信度,
  "summary": "简要总结"
}`;

export async function POST(request: NextRequest) {
  try {
    const { image_url, pet_id } = await request.json();
    
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
          { type: "text" as const, text: ABUSE_DETECTION_PROMPT },
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
      temperature: 0.5,
    });
    
    // 解析AI返回的结果
    let analysisResult;
    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        analysisResult = {
          risk_level: "unknown",
          summary: response.content,
          recommended_actions: ["请联系专业机构进行进一步评估"],
        };
      }
    } catch {
      analysisResult = {
        risk_level: "unknown",
        summary: response.content,
        recommended_actions: ["请联系专业机构进行进一步评估"],
      };
    }
    
    // 如果风险等级为high或critical，发送预警
    if (analysisResult.risk_level === 'high' || analysisResult.risk_level === 'critical') {
      console.warn('⚠️ 检测到高风险虐待迹象:', analysisResult);
    }
    
    // 保存分析记录
    const client2 = getSupabaseClient();
    const { data: record, error } = await client2
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
    });
  } catch (error) {
    console.error('虐待检测错误:', error);
    return NextResponse.json(
      { error: '检测失败，请稍后重试' },
      { status: 500 }
    );
  }
}

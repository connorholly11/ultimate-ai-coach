import { sbService } from '@/lib/supabase/server'
import { NextResponse, NextRequest } from 'next/server'
import { scoreAssessment } from '@/lib/scoring'
import { assessmentTypeMap } from '@/lib/assessment-templates'
import { getAuthUser, authError } from '@/lib/auth-helpers'
import type { AssessmentResponse } from '@/types/assessments'

export const runtime = 'edge'

// PATCH /api/quests/[id] - Update quest progress or status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req)
    if (!user) return authError()
    
    const { id: questId } = await params
    const body = await req.json()
    const { progress, status } = body
    
    const supabase = sbService()
    
    // Build update data
    const updateData: Record<string, unknown> = {}
    if (progress !== undefined) updateData.progress = progress
    if (status !== undefined) updateData.status = status
    if (status === 'completed') updateData.completed_at = new Date().toISOString()
    
    // Update the quest
    const { data: quest, error } = await supabase
      .from('user_quests')
      .update(updateData)
      .eq('id', questId)
      .eq('uid', user.id)
      .select('*, quest_template:quest_templates(*)')
      .single()
    
    if (error) throw error
    
    // If quest was completed, handle differently for assessments
    if (status === 'completed' && quest) {
      const isAssessment = quest.quest_template?.is_assessment || false
      const questTemplateId = quest.quest_template_id
      
      if (isAssessment && questTemplateId && assessmentTypeMap[questTemplateId]) {
        // Score the assessment
        const assessmentType = assessmentTypeMap[questTemplateId]
        const responses = quest.progress as AssessmentResponse
        const scores = scoreAssessment(assessmentType, responses)
        
        // Update personality profile
        const profileUpdate: Record<string, unknown> = {
          updated_at: new Date().toISOString()
        }
        
        // Map scores to database columns
        if (scores.bigFive) profileUpdate.big_five = scores.bigFive
        if (scores.values) profileUpdate.values_dimensions = scores.values
        if (scores.valuesMeta) profileUpdate.values_meta = scores.valuesMeta
        if (scores.attachment) profileUpdate.attachment_dimensions = scores.attachment
        if (scores.regulatoryFocus) profileUpdate.regulatory_focus = scores.regulatoryFocus
        if (scores.selfEfficacy) profileUpdate.self_efficacy = scores.selfEfficacy
        
        // Also update the legacy fields for backward compatibility
        if (scores.bigFive) profileUpdate.big_five = scores.bigFive
        if (scores.valuesMeta) {
          // Extract top 5 values based on scores
          const valueScores = Object.entries(scores.values || {})
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([name]) => name)
          profileUpdate.values = valueScores
        }
        if (scores.attachment) {
          profileUpdate.attachment_style = scores.attachment.style
        }
        
        // Upsert personality profile
        const profileData = { uid: user.id, ...profileUpdate }
        
        await supabase
          .from('personality_profiles')
          .upsert(profileData, {
            onConflict: 'uid'
          })
      }
      
      // Create achievement record for all completed quests
      const achievementData: Record<string, unknown> = {
        quest_id: questId,
        title: quest.quest_template?.title || quest.custom_quest?.title,
        category: quest.quest_template?.category || quest.custom_quest?.category || 'custom',
        time_taken_days: Math.ceil(
          (new Date().getTime() - new Date(quest.started_at).getTime()) / (1000 * 60 * 60 * 24)
        ),
        points_earned: quest.quest_template?.rewards?.points || 100,
        uid: user.id
      }
      
      await supabase.from('quest_achievements').insert(achievementData)
    }
    
    return NextResponse.json({ quest })
    
  } catch (error) {
    console.error('PATCH /api/quests error:', error)
    return NextResponse.json(
      { error: 'Failed to update quest' },
      { status: 500 }
    )
  }
}

// DELETE /api/quests/[id] - Abandon a quest
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req)
    if (!user) return authError()
    
    const { id: questId } = await params
    const supabase = sbService()
    
    // Update quest status to abandoned
    const { error } = await supabase
      .from('user_quests')
      .update({ status: 'abandoned' })
      .eq('id', questId)
      .eq('uid', user.id)
    
    if (error) throw error
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('DELETE /api/quests error:', error)
    return NextResponse.json(
      { error: 'Failed to abandon quest' },
      { status: 500 }
    )
  }
}
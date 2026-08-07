import pb from '@/lib/pocketbase/client'

export interface CampaignPartial {
  id: string
  campaign_id: string
  campaign_name: string
  partial_number: number
  snapshot_date: string
  participants: Array<{
    participant: string
    goal: number
    realized: number
    percentage: number
    position: number
    projection: number
    remaining: number
    remaining_days: number
  }>
  is_closing_snapshot: boolean
  competencia: string
  company: string
  branch: string
  created_by: string
  created_by_name: string
  created: string
  updated: string
}

export const getPartials = (campaignId?: string) =>
  pb.collection('campaign_partials').getFullList({
    sort: '-snapshot_date',
    filter: campaignId ? `campaign_id = "${campaignId}"` : undefined,
  }) as Promise<CampaignPartial[]>

export const createPartial = (data: Record<string, unknown>) =>
  pb.collection('campaign_partials').create(data) as Promise<CampaignPartial>

export const getClosingSnapshot = async (campaignId: string): Promise<CampaignPartial | null> => {
  try {
    return (await pb
      .collection('campaign_partials')
      .getFirstListItem(
        `campaign_id = "${campaignId}" && is_closing_snapshot = true`,
      )) as CampaignPartial
  } catch {
    return null
  }
}

export async function generatePartial(
  campaignId: string,
  campaignName: string,
  competencia: string,
  isClosing: boolean,
  userId: string,
  userName: string,
): Promise<{ id: string; partial_number: number; participants: number }> {
  return pb.send('/backend/v1/campaigns/partial', {
    method: 'POST',
    body: JSON.stringify({
      campaign_id: campaignId,
      campaign_name: campaignName,
      competencia,
      is_closing: isClosing,
      user_id: userId,
      user_name: userName,
    }),
    headers: { 'Content-Type': 'application/json' },
  })
}

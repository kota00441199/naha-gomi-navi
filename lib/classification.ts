import { isItemId, type ItemId } from './rules';
export type Classification = {
    itemId: ItemId | 'unknown' | 'hazard';
    confidence: 'high' | 'medium' | 'low';
    observation: string;
};
export function isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}
export function parseClassification(value: unknown): Classification | null {
    if (!isRecord(value))
        return null;
    if (!isItemId(value.itemId) && value.itemId !== 'unknown' && value.itemId !== 'hazard')
        return null;
    if (!['high', 'medium', 'low'].includes(String(value.confidence)))
        return null;
    if (typeof value.observation !== 'string' || !value.observation.trim() || [...value.observation].length > 160)
        return null;
    return {
        itemId: value.confidence === 'low' && value.itemId !== 'hazard' ? 'unknown' : value.itemId,
        confidence: value.confidence as Classification['confidence'],
        observation: value.observation.trim(),
    };
}

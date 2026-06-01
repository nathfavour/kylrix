import { formatTime, formatDistanceToNow, toDate } from './time-util';

export const formatPostTimestamp = (
    createdAt: string | number | Date | null | undefined,
    updatedAt?: string | number | Date | null | undefined,
) => {
    const created = toDate(createdAt);
    if (!created) return '';

    const exactCreated = formatTime(created);
    const ageSuffix = formatDistanceToNow(created);
    const relativeWindow = Math.abs(Date.now() - created.getTime()) < 1000 * 60 * 60 * 24 * 30;

    let label = relativeWindow ? `${ageSuffix} · ${exactCreated}` : exactCreated;

    const updated = toDate(updatedAt);
    if (updated && Math.abs(updated.getTime() - created.getTime()) > 60_000) {
        label += ` · Edited ${formatTime(updated)}`;
    }

    return label;
};

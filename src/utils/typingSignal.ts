export interface TypingSignalPayload {
  v: 1;
  kind: 'typing';
  conversationId?: string;
  senderId?: string;
  isTyping: boolean;
  at: string;
}

const TYPING_SIGNAL_PREFIX = '__DG_TYPING__';

const normalizeString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const parseBooleanLike = (value: unknown): boolean | null => {
  if (typeof value === 'boolean') return value;

  if (typeof value === 'number') {
    if (value === 1) return true;
    if (value === 0) return false;
    return null;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (!normalized) return null;

    if (['true', 'typing', 'start', 'started', 'on', '1'].includes(normalized)) {
      return true;
    }

    if (['false', 'stop', 'stopped', 'off', '0'].includes(normalized)) {
      return false;
    }
  }

  return null;
};

const normalizePayload = (value: unknown): TypingSignalPayload | null => {
  if (!value || typeof value !== 'object') return null;

  const raw = value as Record<string, unknown>;
  const kind = normalizeString(raw.kind);
  if (kind !== 'typing') return null;

  const isTyping = parseBooleanLike(raw.isTyping ?? raw.typing ?? raw.status);
  if (isTyping === null) return null;

  const conversationId = normalizeString(raw.conversationId ?? raw.ConversationId ?? raw.roomId);
  const senderId = normalizeString(raw.senderId ?? raw.userId);

  return {
    v: 1,
    kind: 'typing',
    conversationId,
    senderId,
    isTyping,
    at: normalizeString(raw.at) || new Date().toISOString(),
  };
};

export const serializeTypingSignalPayload = (params: {
  conversationId?: string;
  senderId?: string;
  isTyping: boolean;
}) => {
  const payload: TypingSignalPayload = {
    v: 1,
    kind: 'typing',
    conversationId: normalizeString(params.conversationId),
    senderId: normalizeString(params.senderId),
    isTyping: params.isTyping,
    at: new Date().toISOString(),
  };

  return `${TYPING_SIGNAL_PREFIX}${JSON.stringify(payload)}`;
};

export const parseTypingSignalPayload = (rawValue?: string | null): TypingSignalPayload | null => {
  const raw = (rawValue ?? '').trim();
  if (!raw) return null;

  if (raw.startsWith(TYPING_SIGNAL_PREFIX)) {
    try {
      const jsonPart = raw.slice(TYPING_SIGNAL_PREFIX.length);
      return normalizePayload(JSON.parse(jsonPart));
    } catch {
      return null;
    }
  }

  if (raw.startsWith('{') && raw.endsWith('}')) {
    try {
      return normalizePayload(JSON.parse(raw));
    } catch {
      return null;
    }
  }

  return null;
};

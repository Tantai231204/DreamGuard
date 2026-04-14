export interface ChatPayloadAttachment {
  type: 'image' | 'file';
  url: string;
  fileName?: string;
}

export interface ChatPayloadAppointment {
  kind: 'appointment';
  scheduledAt: string;
  location?: string;
  note?: string;
  pinned?: boolean;
}

export interface ChatPayloadMetadata {
  appointment?: ChatPayloadAppointment;
}

interface EncodedChatPayloadV1 {
  v: 1;
  text?: string;
  attachments?: ChatPayloadAttachment[];
  metadata?: ChatPayloadMetadata;
}

export interface ParsedChatPayload {
  text: string;
  attachments: ChatPayloadAttachment[];
  metadata: ChatPayloadMetadata | null;
  isEncoded: boolean;
}

const CHAT_PAYLOAD_PREFIX = '__DG_CHAT__';

const normalizeAttachment = (
  value: unknown,
  index: number,
  idSeed: string,
): ChatPayloadAttachment | null => {
  if (!value || typeof value !== 'object') return null;

  const item = value as Record<string, unknown>;
  const url = typeof item.url === 'string' ? item.url.trim() : '';
  if (!url) return null;

  const type = item.type === 'file' ? 'file' : 'image';
  const fileNameRaw = typeof item.fileName === 'string' ? item.fileName.trim() : '';

  return {
    type,
    url,
    fileName: fileNameRaw || `${type}-${idSeed}-${index + 1}`,
  };
};

const normalizeAttachments = (
  attachments: unknown,
  idSeed: string,
): ChatPayloadAttachment[] => {
  if (!Array.isArray(attachments)) return [];

  const normalized: ChatPayloadAttachment[] = [];
  attachments.forEach((attachment, index) => {
    const parsed = normalizeAttachment(attachment, index, idSeed);
    if (parsed) {
      normalized.push(parsed);
    }
  });
  return normalized;
};

const normalizeAppointment = (value: unknown): ChatPayloadAppointment | null => {
  if (!value || typeof value !== 'object') return null;

  const item = value as Record<string, unknown>;
  const scheduledAt = typeof item.scheduledAt === 'string' ? item.scheduledAt.trim() : '';
  if (!scheduledAt) return null;

  const location = typeof item.location === 'string' ? item.location.trim() : '';
  const note = typeof item.note === 'string' ? item.note.trim() : '';
  const pinned = item.pinned !== false;

  return {
    kind: 'appointment',
    scheduledAt,
    location: location || undefined,
    note: note || undefined,
    pinned,
  };
};

const normalizeMetadata = (value: unknown): ChatPayloadMetadata | null => {
  if (!value || typeof value !== 'object') return null;

  const item = value as Record<string, unknown>;
  const appointment = normalizeAppointment(item.appointment);

  if (!appointment) return null;

  return {
    appointment,
  };
};

export const formatAppointmentTimeLabel = (scheduledAt: string): string => {
  const date = new Date(scheduledAt);
  if (Number.isNaN(date.getTime())) return scheduledAt;

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const buildAppointmentSummaryText = (appointment: ChatPayloadAppointment): string => {
  const base = `Lich hen tham dinh: ${formatAppointmentTimeLabel(appointment.scheduledAt)}`;

  if (appointment.location) {
    return `${base} - ${appointment.location}`;
  }

  return base;
};

export const serializeChatPayload = (input: {
  text?: string;
  attachments?: ChatPayloadAttachment[];
  metadata?: ChatPayloadMetadata | null;
}): string => {
  const text = (input.text ?? '').trim();
  const attachments = normalizeAttachments(input.attachments ?? [], 'outgoing');
  const metadata = normalizeMetadata(input.metadata ?? null);

  if (!attachments.length && !metadata) {
    return text;
  }

  const payload: EncodedChatPayloadV1 = {
    v: 1,
    attachments: attachments.length ? attachments : undefined,
    metadata: metadata || undefined,
  };

  if (text) {
    payload.text = text;
  }

  return `${CHAT_PAYLOAD_PREFIX}${JSON.stringify(payload)}`;
};

const parsePayloadObject = (value: unknown): ParsedChatPayload | null => {
  if (!value || typeof value !== 'object') return null;

  const item = value as Record<string, unknown>;
  const attachments = normalizeAttachments(item.attachments, 'incoming');
  const metadata = normalizeMetadata(item.metadata);
  const text = typeof item.text === 'string' ? item.text.trim() : '';

  if (!attachments.length && !metadata && !text) {
    return null;
  }

  return {
    text,
    attachments,
    metadata,
    isEncoded: true,
  };
};

export const parseChatPayload = (rawValue?: string | null): ParsedChatPayload => {
  const raw = (rawValue ?? '').trim();
  if (!raw) {
    return { text: '', attachments: [], metadata: null, isEncoded: false };
  }

  if (raw.startsWith(CHAT_PAYLOAD_PREFIX)) {
    try {
      const payloadJson = raw.slice(CHAT_PAYLOAD_PREFIX.length);
      const parsed = parsePayloadObject(JSON.parse(payloadJson));
      if (parsed) return parsed;
    } catch {
      // Fall through and treat as plain text.
    }
  }

  if (raw.startsWith('{') && raw.endsWith('}')) {
    try {
      const parsed = parsePayloadObject(JSON.parse(raw));
      if (parsed) return parsed;
    } catch {
      // Fall through and treat as plain text.
    }
  }

  return { text: raw, attachments: [], metadata: null, isEncoded: false };
};

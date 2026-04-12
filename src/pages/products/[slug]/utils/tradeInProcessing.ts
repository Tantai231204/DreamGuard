type UnknownRecord = Record<string, unknown>;

export const toFiniteNumber = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const normalized = value
      .replace(/[^\d.,-]/g, "")
      .replace(/\.(?=\d{3}(\D|$))/g, "")
      .replace(/,/g, "")
      .trim();
    const parsed = Number(normalized);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
};

export const pickFirstNumber = (source: UnknownRecord | undefined, keys: string[]): number | undefined => {
  if (!source) return undefined;
  for (const key of keys) {
    const parsed = toFiniteNumber(source[key]);
    if (typeof parsed === "number") return parsed;
  }
  return undefined;
};

export const toBoolean = (value: unknown): boolean | undefined => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (value === 1) return true;
    if (value === 0) return false;
  }
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes", "y"].includes(normalized)) return true;
    if (["false", "0", "no", "n"].includes(normalized)) return false;
  }
  return undefined;
};

export const pickFirstBoolean = (source: UnknownRecord | undefined, keys: string[]): boolean | undefined => {
  if (!source) return undefined;
  for (const key of keys) {
    const parsed = toBoolean(source[key]);
    if (typeof parsed === "boolean") return parsed;
  }
  return undefined;
};

export const pickVariantTradeInNumber = (variant: unknown, keys: string[]): number | undefined => {
  if (!variant || typeof variant !== "object") return undefined;

  const variantRecord = variant as UnknownRecord;
  const candidates: UnknownRecord[] = [variantRecord];
  const attributes = variantRecord.attributes;

  if (attributes && typeof attributes === "object" && !Array.isArray(attributes)) {
    candidates.push(attributes as UnknownRecord);
  }

  for (const candidate of candidates) {
    const value = pickFirstNumber(candidate, keys);
    if (typeof value === "number") return value;
  }

  return undefined;
};

export const pickVariantTradeInBoolean = (variant: unknown, keys: string[]): boolean | undefined => {
  if (!variant || typeof variant !== "object") return undefined;

  const variantRecord = variant as UnknownRecord;
  const candidates: UnknownRecord[] = [variantRecord];
  const attributes = variantRecord.attributes;

  if (attributes && typeof attributes === "object" && !Array.isArray(attributes)) {
    candidates.push(attributes as UnknownRecord);
  }

  for (const candidate of candidates) {
    const value = pickFirstBoolean(candidate, keys);
    if (typeof value === "boolean") return value;
  }

  return undefined;
};

export const parseTradeInEstimate = (payload: unknown) => {
  if (!payload || typeof payload !== "object") {
    return {
      estimatedTradeInValue: undefined,
      estimatedAmountToPay: undefined,
      depositAmount: undefined,
      minTradeInPrice: undefined,
      currentProductPrice: undefined,
    };
  }

  const root = payload as UnknownRecord;
  const candidates: UnknownRecord[] = [root];

  const dataNode = root.data;
  if (dataNode && typeof dataNode === "object" && !Array.isArray(dataNode)) {
    candidates.push(dataNode as UnknownRecord);
  }

  const resultNode = root.result;
  if (resultNode && typeof resultNode === "object" && !Array.isArray(resultNode)) {
    candidates.push(resultNode as UnknownRecord);
  }

  const mergePick = (keys: string[]) => {
    for (const candidate of candidates) {
      const value = pickFirstNumber(candidate, keys);
      if (typeof value === "number") return value;
    }
    return undefined;
  };

  return {
    estimatedTradeInValue: mergePick([
      "tradeInPrice",
      "estimatedTradeInValue",
      "estimatedCredit",
      "tradeInValue",
      "creditAmount",
      "totalTradeInValue",
      "tradeInAmount",
    ]),
    estimatedAmountToPay: mergePick([
      "amountToPay",
      "estimatedAmountToPay",
    ]),
    depositAmount: mergePick(["depositAmount", "requiredDeposit"]),
    minTradeInPrice: mergePick(["minTradeInPrice", "minimumTradeInPrice", "guaranteedTradeInValue"]),
    currentProductPrice: mergePick(["currentProductPrice", "productPrice", "newProductPrice", "totalProductPrice"]),
  };
};

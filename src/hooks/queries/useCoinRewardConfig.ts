import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { systemConfigService } from "@/api/services";
import type { SystemConfig } from "@/api/types/systemConfig";

const DEFAULT_ORDER_COMPLETION_COIN = 50;
const DEFAULT_FEEDBACK_COIN = 40;

const ORDER_REWARD_PRIORITY_KEYS = [
  "ORDERCOINREWARD",
  "ORDERCOMPLETEDCOINREWARD",
  "ORDERCOMPLETECOINREWARD",
  "ORDERCOMPLETEDCOIN",
  "ORDERCOMPLETECOIN",
  "ORDERCOIN",
  "ORDERCOMPLETIONCOIN",
  "ORDERCOINAMOUNT",
];

const ORDER_REWARD_FALLBACK_KEYS = ["ORDERCOINPERCENT"];

const FEEDBACK_REWARD_PRIORITY_KEYS = [
  "FEEDBACKCOINREWARD",
  "PRODUCTFEEDBACKCOINREWARD",
  "FEEDBACKCOIN",
];

const normalizeKey = (key: string) => key.trim().toUpperCase();

const parsePositiveNumber = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const exactNumber = Number(trimmed);
  if (Number.isFinite(exactNumber) && exactNumber > 0) {
    return exactNumber;
  }

  const matched = trimmed.match(/\d+(?:\.\d+)?/);
  if (!matched) return null;

  const extracted = Number(matched[0]);
  if (!Number.isFinite(extracted) || extracted <= 0) return null;

  return extracted;
};

const resolveCoinValue = (
  configs: SystemConfig[],
  priorityKeys: string[],
  fallback: number,
  fallbackKeys?: string[]
) => {
  const keyMap = new Map(configs.map((config) => [normalizeKey(config.configKey), config]));

  for (const key of priorityKeys) {
    const config = keyMap.get(key);
    if (!config) continue;

    const parsed = parsePositiveNumber(config.configValue);
    if (parsed !== null) return parsed;
  }

  if (fallbackKeys) {
    for (const key of fallbackKeys) {
      const config = keyMap.get(key);
      if (!config) continue;

      const parsed = parsePositiveNumber(config.configValue);
      if (parsed !== null) return parsed;
    }
  }

  return fallback;
};

export const useCoinRewardConfig = () => {
  const query = useQuery({
    queryKey: ["systemConfigs", "coinRewards"],
    queryFn: () => systemConfigService.getConfigs({ pageNumber: 1, pageSize: 200 }),
    staleTime: 60_000,
    retry: false,
    meta: { hideToast: true },
  });

  const resolvedRewards = useMemo(() => {
    const configs = query.data?.items ?? [];

    const orderCompletionCoin = resolveCoinValue(
      configs,
      ORDER_REWARD_PRIORITY_KEYS,
      DEFAULT_ORDER_COMPLETION_COIN,
      ORDER_REWARD_FALLBACK_KEYS
    );

    const feedbackCoin = resolveCoinValue(
      configs,
      FEEDBACK_REWARD_PRIORITY_KEYS,
      DEFAULT_FEEDBACK_COIN
    );

    return {
      orderCompletionCoin,
      feedbackCoin,
    };
  }, [query.data?.items]);

  return {
    ...resolvedRewards,
    isLoading: query.isLoading,
    isFetched: query.isFetched,
  };
};

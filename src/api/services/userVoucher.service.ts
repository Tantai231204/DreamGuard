import apiClient from "../../lib/api";
import type {
  ClaimVoucherRequest,
  UserVoucherPageResponse,
  UserVoucherResponse,
  VoucherType,
} from "../types";

type UserVoucherQueryParams = {
  pageNumber?: number;
  pageSize?: number;
  isUsed?: boolean;
};

const unwrapPayload = <T>(payload: unknown): T => {
  if (payload && typeof payload === "object" && "data" in (payload as Record<string, unknown>)) {
    return (payload as { data: T }).data;
  }

  return payload as T;
};

const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const toBoolean = (value: unknown, fallback = false): boolean => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;
  }
  return fallback;
};

const toText = (value: unknown, fallback = ""): string => {
  return typeof value === "string" ? value : fallback;
};

const toVoucherType = (value: unknown): VoucherType => {
  if (value === "Both" || value === "Product" || value === "Service") {
    return value;
  }
  return "Both";
};

const normalizeUserVoucher = (payload: unknown): UserVoucherResponse => {
  const item = (payload ?? {}) as Record<string, unknown>;
  const nestedVoucher = (item.voucher ?? {}) as Record<string, unknown>;

  const normalizedClaimedAt =
    toText(item.claimedAt) ||
    toText(nestedVoucher.claimedAt);

  const normalizedUsedAt =
    toText(item.usedAt) ||
    toText(nestedVoucher.usedAt);

  const normalizedIsUsed = toBoolean(item.isUsed, toBoolean(nestedVoucher.isUsed, false));

  const rawUserVoucherId = toText(item.userVoucherId) || toText(nestedVoucher.userVoucherId);
  const rawVoucherId = toText(item.voucherId) || toText(nestedVoucher.voucherId);
  const rawId = toText(item.id);

  const hasClaimedFlag = item.isClaimed !== undefined || nestedVoucher.isClaimed !== undefined;
  const isUserVoucherRecord = Boolean(rawUserVoucherId || (rawId && rawVoucherId));

  const normalizedIsClaimed = hasClaimedFlag
    ? toBoolean(item.isClaimed, toBoolean(nestedVoucher.isClaimed, false))
    : Boolean(normalizedClaimedAt || normalizedUsedAt || normalizedIsUsed || isUserVoucherRecord);

  const voucherId =
    toText(item.voucherId) ||
    toText(nestedVoucher.voucherId) ||
    toText(item.id);

  const userVoucherId =
    toText(item.userVoucherId) ||
    toText(item.id) ||
    voucherId ||
    toText(item.code);

  const code = toText(item.code) || toText(nestedVoucher.code);
  const name =
    toText(item.name) ||
    toText(item.voucherName) ||
    toText(nestedVoucher.name) ||
    code;

  const requiredCoinSource = item.requiredCoin ?? nestedVoucher.requiredCoin;
  const normalizedRequiredCoin =
    requiredCoinSource === undefined || requiredCoinSource === null
      ? undefined
      : toNumber(requiredCoinSource, 0);

  const normalizedStartDate = toText(item.startDate) || toText(nestedVoucher.startDate);
  const normalizedEndDate =
    toText(item.endDate) ||
    toText(item.expiredAt) ||
    toText(nestedVoucher.endDate) ||
    toText(nestedVoucher.expiredAt);

  const hasActiveFlag = item.isActive !== undefined || nestedVoucher.isActive !== undefined;
  const normalizedIsActive = hasActiveFlag
    ? toBoolean(item.isActive, toBoolean(nestedVoucher.isActive, true))
    : undefined;

  return {
    userVoucherId,
    voucherId: voucherId || undefined,
    code,
    name,
    description: toText(item.description) || toText(nestedVoucher.description),
    discountValue: toNumber(item.discountValue, toNumber(nestedVoucher.discountValue, 0)),
    maxDiscountAmount: toNumber(item.maxDiscountAmount, toNumber(nestedVoucher.maxDiscountAmount, 0)),
    requiredCoin: normalizedRequiredCoin,
    voucherType: toVoucherType(item.voucherType ?? nestedVoucher.voucherType),
    startDate: normalizedStartDate || undefined,
    endDate: normalizedEndDate || undefined,
    expiredAt: toText(item.expiredAt) || toText(nestedVoucher.expiredAt) || normalizedEndDate || undefined,
    isActive: normalizedIsActive,
    isClaimed: normalizedIsClaimed,
    claimedAt: normalizedClaimedAt || null,
    isUsed: normalizedIsUsed,
    usedAt: normalizedUsedAt || null,
  };
};

const normalizeUserVoucherPage = (payload: unknown, pageNumber: number): UserVoucherPageResponse => {
  const data = unwrapPayload<unknown>(payload);

  if (Array.isArray(data)) {
    return {
      items: data.map(normalizeUserVoucher),
      pageNumber,
      pageSize: data.length,
      totalCount: data.length,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    };
  }

  if (data && typeof data === "object") {
    const page = data as Partial<UserVoucherPageResponse> & Record<string, unknown>;

    const rawItems = Array.isArray(page.items)
      ? page.items
      : Array.isArray(page.data)
        ? (page.data as unknown[])
        : [];

    const items = rawItems.map(normalizeUserVoucher);
    const safePageSize = typeof page.pageSize === "number" ? page.pageSize : items.length;
    const safePageNumber = typeof page.pageNumber === "number" ? page.pageNumber : pageNumber;
    const totalCount = typeof page.totalCount === "number" ? page.totalCount : items.length;

    return {
      items,
      pageNumber: safePageNumber,
      pageSize: safePageSize,
      totalCount,
      totalPages: typeof page.totalPages === "number" ? page.totalPages : 1,
      hasPreviousPage: typeof page.hasPreviousPage === "boolean" ? page.hasPreviousPage : safePageNumber > 1,
      hasNextPage:
        typeof page.hasNextPage === "boolean"
          ? page.hasNextPage
          : safePageNumber * Math.max(safePageSize, 1) < totalCount,
    };
  }

  return {
    items: [],
    pageNumber,
    pageSize: 0,
    totalCount: 0,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  };
};

const normalizeIsUsedParam = (isUsed: UserVoucherQueryParams["isUsed"]): string | undefined => {
  if (typeof isUsed === "boolean") return String(isUsed);
  return undefined;
};

const fetchUserVoucherPage = (
  pageNumber: number,
  params?: Pick<UserVoucherQueryParams, "pageSize" | "isUsed">
) => {
  const normalizedIsUsed = normalizeIsUsedParam(params?.isUsed);

  return apiClient
    .get("/UserVoucher", {
      params: {
        pageNumber,
        pageSize: params?.pageSize ?? 10,
        ...(normalizedIsUsed
          ? { isUsed: normalizedIsUsed }
          : {}),
      },
    })
    .then((res) => normalizeUserVoucherPage(res.data, pageNumber));
};

const userVoucherService = {
  getPage: (params?: UserVoucherQueryParams): Promise<UserVoucherPageResponse> => {
    const pageNumber = params?.pageNumber ?? 1;
    const pageSize = params?.pageSize;
    const isUsed = params?.isUsed;

    return fetchUserVoucherPage(pageNumber, { pageSize, isUsed });
  },

  getAll: async (params?: Pick<UserVoucherQueryParams, "pageSize" | "isUsed">): Promise<UserVoucherPageResponse> => {
    const firstPage = await fetchUserVoucherPage(1, params);

    if (firstPage.totalPages <= 1) {
      return firstPage;
    }

    const remainingPages = Array.from({ length: firstPage.totalPages - 1 }, (_, index) => index + 2);
    const nextPages = await Promise.all(
      remainingPages.map((page) =>
        fetchUserVoucherPage(page, {
          pageSize: firstPage.pageSize || params?.pageSize || 10,
          isUsed: params?.isUsed,
        })
      )
    );

    const mergedItems = [
      ...firstPage.items,
      ...nextPages.flatMap((page) => page.items),
    ];

    return {
      ...firstPage,
      items: mergedItems,
      pageNumber: 1,
      pageSize: mergedItems.length,
      totalCount: mergedItems.length,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    };
  },

  getById: (id: string): Promise<UserVoucherResponse> =>
    apiClient
      .get(`/UserVoucher/${id}`)
      .then((res) => normalizeUserVoucher(unwrapPayload<unknown>(res.data))),

  claimVoucher: (payload: ClaimVoucherRequest): Promise<void> =>
    apiClient.post("/UserVoucher/ClaimVoucher", payload).then(() => undefined),
};

export default userVoucherService;

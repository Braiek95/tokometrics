import { logger } from "@/lib/logger";

// ─── Environment Detection ──────────────────────────────────────────

export function isFeishuEnvironment(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes("lark") || ua.includes("feishu");
}

// ─── Types ──────────────────────────────────────────────────────────

interface FeishuCardElement {
  tag: string;
  text?: { tag: string; content: string };
  content?: string;
  elements?: FeishuCardElement[];
  actions?: FeishuCardElement[];
  url?: { val: string };
  type?: string;
}

interface FeishuCardMessage {
  msg_type: "interactive";
  card: {
    header: {
      title: { tag: string; content: string };
      template: string;
    };
    elements: FeishuCardElement[];
  };
}

type NotificationType =
  | "shop_connected"
  | "shop_disconnected"
  | "daily_report"
  | "target_achieved"
  | "order_alert"
  | "sync_error";

// ─── Feishu Webhook ─────────────────────────────────────────────────

const FEISHU_WEBHOOK_URL = process.env.FEISHU_WEBHOOK_URL;

async function sendWebhook(payload: FeishuCardMessage): Promise<boolean> {
  if (!FEISHU_WEBHOOK_URL) {
    logger.warn("Feishu webhook URL not configured", "feishu");
    return false;
  }

  try {
    const res = await fetch(FEISHU_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      logger.error("Feishu webhook failed", new Error(text), "feishu", { status: res.status });
      return false;
    }

    const data = await res.json();
    if (data.code !== 0) {
      logger.error("Feishu webhook error response", new Error(data.msg), "feishu");
      return false;
    }

    return true;
  } catch (error) {
    logger.error("Feishu webhook request failed", error, "feishu");
    return false;
  }
}

// ─── Card Templates ─────────────────────────────────────────────────

const TEMPLATE_COLORS: Record<NotificationType, string> = {
  shop_connected: "green",
  shop_disconnected: "orange",
  daily_report: "blue",
  target_achieved: "green",
  order_alert: "yellow",
  sync_error: "red",
};

function buildCard(
  type: NotificationType,
  title: string,
  fields: { label: string; value: string }[],
  extraElements?: FeishuCardElement[]
): FeishuCardMessage {
  const elements: FeishuCardElement[] = [];

  const fieldTexts = fields.map((f) => `**${f.label}:** ${f.value}`).join("\n");
  elements.push({ tag: "div", text: { tag: "lark_md", content: fieldTexts } });
  elements.push({ tag: "hr" });
  elements.push({
    tag: "note",
    elements: [
      {
        tag: "plain_text",
        content: `TokoMetrics · ${new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}`,
      },
    ],
  });

  if (extraElements) elements.push(...extraElements);

  return {
    msg_type: "interactive",
    card: {
      header: {
        title: { tag: "plain_text", content: title },
        template: TEMPLATE_COLORS[type],
      },
      elements,
    },
  };
}

// ─── Public Notification Functions ───────────────────────────────────

export async function notifyShopConnected(shopName: string, region: string) {
  return sendWebhook(
    buildCard("shop_connected", "🔗 New Shop Connected / 新店铺已连接", [
      { label: "Shop / 店铺", value: shopName },
      { label: "Region / 地区", value: region },
      { label: "Status / 状态", value: "Active ✅" },
    ])
  );
}

export async function notifyShopDisconnected(shopName: string, reason?: string) {
  return sendWebhook(
    buildCard("shop_disconnected", "⚠️ Shop Disconnected / 店铺已断开", [
      { label: "Shop / 店铺", value: shopName },
      { label: "Reason / 原因", value: reason ?? "User disconnected / 用户主动断开" },
    ])
  );
}

export async function notifyDailyReport(data: {
  shopName: string;
  todayRevenue: number;
  todayOrders: number;
  monthlyRevenue: number;
  monthlyGoal: number;
  currency: string;
}) {
  const progress =
    data.monthlyGoal > 0 ? ((data.monthlyRevenue / data.monthlyGoal) * 100).toFixed(1) : "0";

  return sendWebhook(
    buildCard("daily_report", "📊 Daily Sales Report / 每日销售报告", [
      { label: "Shop / 店铺", value: data.shopName },
      { label: "Today Revenue / 今日营收", value: `${data.currency} ${data.todayRevenue.toLocaleString()}` },
      { label: "Today Orders / 今日订单", value: data.todayOrders.toLocaleString() },
      { label: "Monthly Revenue / 月度营收", value: `${data.currency} ${data.monthlyRevenue.toLocaleString()}` },
      { label: "Monthly Target / 月度目标", value: `${data.currency} ${data.monthlyGoal.toLocaleString()}` },
      { label: "Progress / 进度", value: `${progress}%` },
    ])
  );
}

export async function notifyTargetAchieved(data: {
  shopName: string;
  targetType: "monthly" | "annual";
  revenue: number;
  goal: number;
  currency: string;
}) {
  const label = data.targetType === "monthly" ? "Monthly / 月度" : "Annual / 年度";
  return sendWebhook(
    buildCard("target_achieved", `🎉 ${label} Target Achieved! / 目标已达成!`, [
      { label: "Shop / 店铺", value: data.shopName },
      { label: "Revenue / 营收", value: `${data.currency} ${data.revenue.toLocaleString()}` },
      { label: "Goal / 目标", value: `${data.currency} ${data.goal.toLocaleString()}` },
      { label: "Achievement / 达成率", value: `${((data.revenue / data.goal) * 100).toFixed(1)}%` },
    ])
  );
}

export async function notifySyncError(shopName: string, errorMsg: string) {
  return sendWebhook(
    buildCard("sync_error", "❌ Sync Error / 同步错误", [
      { label: "Shop / 店铺", value: shopName },
      { label: "Error / 错误", value: errorMsg },
      { label: "Action / 操作", value: "Please check connection / 请检查连接" },
    ])
  );
}

// ─── Feishu Open API (Tenant Token) ─────────────────────────────────

const FEISHU_APP_ID = process.env.FEISHU_APP_ID;
const FEISHU_APP_SECRET = process.env.FEISHU_APP_SECRET;

let cachedToken: { token: string; expiresAt: number } | null = null;

export async function getFeishuTenantToken(): Promise<string | null> {
  if (!FEISHU_APP_ID || !FEISHU_APP_SECRET) {
    logger.warn("Feishu App credentials not configured", "feishu");
    return null;
  }

  if (cachedToken && cachedToken.expiresAt > Date.now() + 5 * 60 * 1000) {
    return cachedToken.token;
  }

  try {
    const res = await fetch(
      "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ app_id: FEISHU_APP_ID, app_secret: FEISHU_APP_SECRET }),
      }
    );

    const data = await res.json();
    if (data.code !== 0) {
      logger.error("Failed to get Feishu tenant token", new Error(data.msg), "feishu");
      return null;
    }

    cachedToken = { token: data.tenant_access_token, expiresAt: Date.now() + data.expire * 1000 };
    return cachedToken.token;
  } catch (error) {
    logger.error("Feishu token request failed", error, "feishu");
    return null;
  }
}

// ─── Feishu Spreadsheet Sync ────────────────────────────────────────

export async function writeToFeishuSheet(
  spreadsheetToken: string,
  sheetId: string,
  range: string,
  values: (string | number)[][]
): Promise<boolean> {
  const token = await getFeishuTenantToken();
  if (!token) return false;

  try {
    const res = await fetch(
      `https://open.feishu.cn/open-apis/sheets/v2/spreadsheets/${spreadsheetToken}/values`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ valueRange: { range: `${sheetId}!${range}`, values } }),
      }
    );

    const data = await res.json();
    if (data.code !== 0) {
      logger.error("Failed to write to Feishu sheet", new Error(data.msg), "feishu");
      return false;
    }

    return true;
  } catch (error) {
    logger.error("Feishu sheet write failed", error, "feishu");
    return false;
  }
}

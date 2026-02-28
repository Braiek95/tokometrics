import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Language } from "./i18n";
import { t } from "./i18n";

interface ShopReportData {
  shopName: string;
  currency: string;
  dateRange: { from: string; to: string };
  metrics?: {
    revenue: number;
    orders: number;
    unitsSold: number;
    aov: number;
    conversionRate: number;
    newCustomers: number;
  };
  channels?: {
    liveStreamRevenue: number;
    shortVideoRevenue: number;
    mallRevenue: number;
    influencerRevenue: number;
  };
  revenueData?: Array<{
    date: string;
    revenue: number;
    orderCount: number;
    liveStreamRevenue?: number;
    shortVideoRevenue?: number;
    mallRevenue?: number;
    influencerRevenue?: number;
  }>;
  language: Language;
}

function formatCurrency(value: number, currency: string): string {
  return `${currency === "USD" ? "$" : currency} ${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatNumber(value: number): string {
  return value.toLocaleString("en-US");
}

export function exportPDF(data: ShopReportData) {
  const { shopName, currency, dateRange, metrics, channels, revenueData, language } = data;
  const isZh = language === "zh";

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // ─── Header ────────────────────────────────
  doc.setFontSize(22);
  doc.setTextColor(30, 30, 30);
  doc.text("TokoMetrics", 14, y);
  
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.text(isZh ? "TikTok Shop 数据分析报告" : "TikTok Shop Analytics Report", 14, y + 8);

  // Date range
  doc.setFontSize(9);
  doc.text(`${dateRange.from} → ${dateRange.to}`, pageWidth - 14, y, { align: "right" });
  doc.text(isZh ? `店铺: ${shopName}` : `Shop: ${shopName}`, pageWidth - 14, y + 8, { align: "right" });

  // Divider line
  y += 16;
  doc.setDrawColor(0, 150, 255);
  doc.setLineWidth(0.8);
  doc.line(14, y, pageWidth - 14, y);
  y += 10;

  // ─── KPI Summary ───────────────────────────
  if (metrics) {
    doc.setFontSize(14);
    doc.setTextColor(30, 30, 30);
    doc.text(isZh ? "核心指标概览" : "Key Performance Indicators", 14, y);
    y += 8;

    const kpiData = [
      [isZh ? "总营收" : "Total Revenue", formatCurrency(metrics.revenue, currency)],
      [isZh ? "总订单数" : "Total Orders", formatNumber(metrics.orders)],
      [isZh ? "销售数量" : "Units Sold", formatNumber(metrics.unitsSold)],
      [isZh ? "平均订单价值" : "Avg. Order Value", formatCurrency(metrics.aov, currency)],
      [isZh ? "转化率" : "Conversion Rate", `${metrics.conversionRate.toFixed(2)}%`],
      [isZh ? "新客户" : "New Customers", formatNumber(metrics.newCustomers)],
    ];

    autoTable(doc, {
      startY: y,
      head: [[isZh ? "指标" : "Metric", isZh ? "数值" : "Value"]],
      body: kpiData,
      theme: "grid",
      headStyles: { fillColor: [0, 120, 255], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 10 },
      bodyStyles: { fontSize: 10 },
      alternateRowStyles: { fillColor: [245, 248, 255] },
      columnStyles: { 0: { fontStyle: "bold", cellWidth: 80 }, 1: { halign: "right" } },
      margin: { left: 14, right: 14 },
    });

    y = (doc as any).lastAutoTable.finalY + 12;
  }

  // ─── Channel Breakdown ─────────────────────
  if (channels) {
    doc.setFontSize(14);
    doc.setTextColor(30, 30, 30);
    doc.text(isZh ? "渠道销售分析" : "Channel Sales Breakdown", 14, y);
    y += 8;

    const total = channels.liveStreamRevenue + channels.shortVideoRevenue + channels.mallRevenue + channels.influencerRevenue;
    const pct = (val: number) => total > 0 ? `${((val / total) * 100).toFixed(1)}%` : "0%";

    const channelRows = [
      [isZh ? "直播" : "Live Stream", formatCurrency(channels.liveStreamRevenue, currency), pct(channels.liveStreamRevenue)],
      [isZh ? "短视频" : "Short Video", formatCurrency(channels.shortVideoRevenue, currency), pct(channels.shortVideoRevenue)],
      [isZh ? "商城" : "Mall", formatCurrency(channels.mallRevenue, currency), pct(channels.mallRevenue)],
      [isZh ? "达人带货" : "Influencer", formatCurrency(channels.influencerRevenue, currency), pct(channels.influencerRevenue)],
      [isZh ? "合计" : "Total", formatCurrency(total, currency), "100%"],
    ];

    autoTable(doc, {
      startY: y,
      head: [[isZh ? "渠道" : "Channel", isZh ? "销售额" : "Revenue", isZh ? "占比" : "Share"]],
      body: channelRows,
      theme: "grid",
      headStyles: { fillColor: [0, 120, 255], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 10 },
      bodyStyles: { fontSize: 10 },
      alternateRowStyles: { fillColor: [245, 248, 255] },
      columnStyles: { 0: { fontStyle: "bold", cellWidth: 60 }, 1: { halign: "right" }, 2: { halign: "center" } },
      margin: { left: 14, right: 14 },
      didParseCell: (data: any) => {
        // Bold the total row
        if (data.row.index === channelRows.length - 1) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fillColor = [230, 240, 255];
        }
      },
    });

    y = (doc as any).lastAutoTable.finalY + 12;
  }

  // ─── Daily Revenue Table ───────────────────
  if (revenueData && revenueData.length > 0) {
    // Check if we need a new page
    if (y > 220) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(14);
    doc.setTextColor(30, 30, 30);
    doc.text(isZh ? "每日销售数据" : "Daily Sales Data", 14, y);
    y += 8;

    const dailyRows = revenueData.map((d) => [
      d.date,
      formatCurrency(d.revenue, currency),
      formatNumber(d.orderCount),
      formatCurrency(d.liveStreamRevenue ?? 0, currency),
      formatCurrency(d.shortVideoRevenue ?? 0, currency),
      formatCurrency(d.mallRevenue ?? 0, currency),
      formatCurrency(d.influencerRevenue ?? 0, currency),
    ]);

    autoTable(doc, {
      startY: y,
      head: [[
        isZh ? "日期" : "Date",
        isZh ? "营收" : "Revenue",
        isZh ? "订单" : "Orders",
        isZh ? "直播" : "Live",
        isZh ? "短视频" : "Video",
        isZh ? "商城" : "Mall",
        isZh ? "达人" : "Influencer",
      ]],
      body: dailyRows,
      theme: "grid",
      headStyles: { fillColor: [0, 120, 255], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8 },
      bodyStyles: { fontSize: 7.5 },
      alternateRowStyles: { fillColor: [245, 248, 255] },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { halign: "right" },
        2: { halign: "center" },
        3: { halign: "right" },
        4: { halign: "right" },
        5: { halign: "right" },
        6: { halign: "right" },
      },
      margin: { left: 14, right: 14 },
    });
  }

  // ─── Footer ────────────────────────────────
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.setTextColor(160, 160, 160);
    doc.text(`TokoMetrics Report • ${shopName}`, 14, pageHeight - 10);
    doc.text(`${isZh ? "第" : "Page"} ${i} / ${pageCount}`, pageWidth - 14, pageHeight - 10, { align: "right" });
    doc.text(new Date().toLocaleDateString(), pageWidth / 2, pageHeight - 10, { align: "center" });
  }

  // ─── Save ──────────────────────────────────
  doc.save(`${shopName}_report_${dateRange.from}_${dateRange.to}.pdf`);
}

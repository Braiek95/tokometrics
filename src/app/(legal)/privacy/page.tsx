"use client";

import { useLanguage } from "@/providers/language-provider";

const LAST_UPDATED = "February 12, 2026";
const CONTACT_EMAIL = "privacy@tokometrics.com";
const APP = "TokoMetrics";
const WEB = "https://tokometrics.com";

export default function PrivacyPolicyPage() {
  const { language: lang } = useLanguage();
  const zh = lang === "zh";

  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none">
      <h1 className="text-3xl font-bold tracking-tight">
        {zh ? "隐私政策" : "Privacy Policy"}
      </h1>
      <p className="text-muted-foreground text-sm mt-1">
        {zh ? "最后更新：" : "Last updated: "}<strong>{LAST_UPDATED}</strong>
      </p>

      <div className="mt-8 rounded-xl border bg-muted/30 p-5 text-sm leading-relaxed">
        <strong>{zh ? "摘要：" : "Summary:"}</strong>{" "}
        {zh
          ? `${APP} 是一个通过 TikTok Shop 官方 API 连接的商户分析仪表盘。我们仅访问您明确授权的数据，绝不出售您的数据，您可以随时撤销访问权限。`
          : `${APP} is a merchant analytics dashboard that connects to TikTok Shop through the official TikTok Shop API. We only access data that you explicitly authorize, we never sell your data, and you can revoke access at any time.`}
      </div>

      {/* 1 */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold">{zh ? "1. 简介" : "1. Introduction"}</h2>
        <p>
          {zh
            ? `${APP}（"我们"）运营 ${APP}（"服务"），这是一个面向 TikTok Shop 商户的商业分析和管理仪表盘。本隐私政策说明了当您使用我们的服务时，我们如何收集、使用、披露和保护您的信息。`
            : `${APP} ("we", "our", or "us") operates ${APP} (the "Service"), a business analytics and management dashboard for TikTok Shop merchants. This Privacy Policy explains how we collect, use, disclose, and safeguard information when you use our Service.`}
        </p>
        <p>
          {zh
            ? `使用 ${APP} 即表示您同意按照本政策收集和使用信息。如果您不同意本政策条款，请不要使用我们的服务。`
            : `By using ${APP}, you agree to the collection and use of information in accordance with this policy. If you do not agree with the terms of this policy, please do not use our Service.`}
        </p>
      </section>

      {/* 2 */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold">{zh ? "2. 我们收集的信息" : "2. Information We Collect"}</h2>

        <h3 className="text-base font-semibold mt-4">{zh ? "2.1 账户信息" : "2.1 Account Information"}</h3>
        <p>{zh ? `注册 ${APP} 时，我们收集：` : `When you register for ${APP}, we collect:`}</p>
        <ul className="list-disc pl-6 space-y-1 text-sm">
          <li>{zh ? "姓名和电子邮件地址" : "Name and email address"}</li>
          <li>{zh ? "密码（以不可逆加密哈希存储，我们绝不存储明文密码）" : "Password (stored as an irreversible cryptographic hash — we never store plain-text passwords)"}</li>
          <li>{zh ? "账户偏好和设置" : "Account preferences and settings"}</li>
        </ul>

        <h3 className="text-base font-semibold mt-4">{zh ? "2.2 TikTok Shop 数据（通过 TikTok Shop API）" : "2.2 TikTok Shop Data (via TikTok Shop API)"}</h3>
        <p>
          {zh
            ? "当您连接 TikTok Shop 账户时，我们通过 TikTok 官方 OAuth 流程，仅代表您并经过您的明确授权访问以下数据："
            : "When you connect your TikTok Shop account, we access the following data solely on your behalf and with your explicit authorization through TikTok's official OAuth flow:"}
        </p>
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="py-2 px-3 text-left font-semibold">{zh ? "数据类别" : "Data Category"}</th>
                <th className="py-2 px-3 text-left font-semibold">{zh ? "API 权限" : "API Scope"}</th>
                <th className="py-2 px-3 text-left font-semibold">{zh ? "用途" : "Purpose"}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="py-2 px-3">{zh ? "店铺资料和设置" : "Shop profile & settings"}</td>
                <td className="py-2 px-3 font-mono text-xs">shop.base.read</td>
                <td className="py-2 px-3">{zh ? "显示店铺名称、状态、货币" : "Display shop name, status, currency"}</td>
              </tr>
              <tr>
                <td className="py-2 px-3">{zh ? "订单数据（ID、金额、状态）" : "Order data (IDs, amounts, status)"}</td>
                <td className="py-2 px-3 font-mono text-xs">order.base.read</td>
                <td className="py-2 px-3">{zh ? "订单分析和报告" : "Order analytics and reporting"}</td>
              </tr>
              <tr>
                <td className="py-2 px-3">{zh ? "商品列表和库存" : "Product listings & inventory"}</td>
                <td className="py-2 px-3 font-mono text-xs">product.base.read</td>
                <td className="py-2 px-3">{zh ? "商品表现排行" : "Product performance ranking"}</td>
              </tr>
              <tr>
                <td className="py-2 px-3">{zh ? "收入和财务指标" : "Revenue and financial metrics"}</td>
                <td className="py-2 px-3 font-mono text-xs">finance.data.read</td>
                <td className="py-2 px-3">{zh ? "营收跟踪和目标监控" : "Revenue tracking and target monitoring"}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          ⚠️ <strong>{zh ? "我们仅请求只读权限。" : "We request read-only permissions only."}</strong>{" "}
          {zh
            ? `${APP} 绝不会修改、删除或向您的 TikTok Shop 账户写入数据。`
            : `${APP} never modifies, deletes, or writes data to your TikTok Shop account.`}
        </p>

        <h3 className="text-base font-semibold mt-4">{zh ? "2.3 使用数据" : "2.3 Usage Data"}</h3>
        <p>{zh ? "当您使用服务时，我们自动收集某些技术信息：" : "We automatically collect certain technical information when you use the Service:"}</p>
        <ul className="list-disc pl-6 space-y-1 text-sm">
          <li>{zh ? "IP 地址、浏览器类型和操作系统" : "IP address, browser type, and operating system"}</li>
          <li>{zh ? "访问页面、使用功能和在每个页面的停留时间" : "Pages visited, features used, and time spent on each page"}</li>
          <li>{zh ? "设备标识符和会话令牌" : "Device identifiers and session tokens"}</li>
        </ul>

        <h3 className="text-base font-semibold mt-4">{zh ? "2.4 Cookie 和跟踪技术" : "2.4 Cookies and Tracking Technologies"}</h3>
        <p>{zh ? "我们仅使用身份验证会话所需的必要 Cookie，不使用广告 Cookie 或跟踪像素。" : "We use strictly necessary cookies for authentication sessions. We do not use advertising cookies or tracking pixels."}</p>
      </section>

      {/* 3 */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold">{zh ? "3. 我们如何使用您的信息" : "3. How We Use Your Information"}</h2>
        <p>{zh ? "我们仅将收集的信息用于：" : "We use the collected information exclusively to:"}</p>
        <ul className="list-disc pl-6 space-y-1 text-sm">
          <li>{zh ? `提供、运营和维护 ${APP} 仪表盘` : `Provide, operate, and maintain the ${APP} dashboard`}</li>
          <li>{zh ? "在您的账户中显示分析数据、绩效指标和报告" : "Display analytics, performance metrics, and reports within your account"}</li>
          <li>{zh ? "验证您的身份并维护安全会话" : "Authenticate your identity and maintain secure sessions"}</li>
          <li>{zh ? "发送事务性电子邮件（密码重置、安全提醒）" : "Send transactional emails (password reset, security alerts)"}</li>
          <li>{zh ? "检测和防止欺诈或未经授权的访问" : "Detect and prevent fraudulent or unauthorized access"}</li>
          <li>{zh ? "遵守法律义务" : "Comply with legal obligations"}</li>
          <li>{zh ? "提高服务的可靠性和性能" : "Improve the reliability and performance of the Service"}</li>
        </ul>
        <p className="mt-3">
          <strong>{zh ? "我们不会：" : "We do not:"}</strong>{" "}
          {zh
            ? "出售、出租、交易或与第三方分享您的个人数据或 TikTok Shop 数据用于营销或广告目的。"
            : "sell, rent, trade, or share your personal data or TikTok Shop data with third parties for marketing or advertising purposes."}
        </p>
      </section>

      {/* 4 */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold">{zh ? "4. TikTok 数据使用政策" : "4. TikTok Data Usage Policy"}</h2>
        <p>
          {zh
            ? `${APP} 严格按照 TikTok Shop 合作伙伴计划条款和 TikTok Shop API 开发者协议访问 TikTok Shop 数据。`
            : `${APP} accesses TikTok Shop data strictly in accordance with TikTok Shop Partner Program Terms and the TikTok Shop API Developer Agreement.`}
        </p>
        <ul className="list-disc pl-6 space-y-1 text-sm mt-3">
          <li>{zh ? `TikTok Shop 数据仅用于提供您在 ${APP} 中请求的功能` : `TikTok Shop data is only used to provide features you requested within ${APP}`}</li>
          <li>{zh ? "TikTok Shop 数据绝不会转移给第三方服务" : "TikTok Shop data is never transferred to third-party services except as required for core Service functionality"}</li>
          <li>{zh ? "我们不使用 TikTok 数据为广告建立用户画像" : "We do not use TikTok data to build user profiles for advertising"}</li>
          <li>{zh ? "我们不将 TikTok 数据与其他来源的数据结合" : "We do not combine TikTok data with data from other sources to infer sensitive information"}</li>
          <li>{zh ? "访问令牌加密存储，并通过 TikTok OAuth 刷新流程更新" : "Access tokens are stored encrypted and refreshed via TikTok's OAuth refresh flow"}</li>
          <li>{zh ? `您可以随时通过 TikTok 授权设置撤销 ${APP} 的访问权限` : `You can revoke ${APP}'s access to your TikTok Shop at any time via TikTok's authorization settings`}</li>
        </ul>
      </section>

      {/* 5 */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold">{zh ? "5. 数据存储和安全" : "5. Data Storage and Security"}</h2>
        <p>{zh ? "您的数据存储在受行业标准保护的安全服务器上：" : "Your data is stored on secured servers with industry-standard protections including:"}</p>
        <ul className="list-disc pl-6 space-y-1 text-sm">
          <li>{zh ? "所有传输中的数据使用 TLS/HTTPS 加密" : "TLS/HTTPS encryption for all data in transit"}</li>
          <li>{zh ? "敏感数据（访问令牌、凭证）使用 AES-256 静态加密" : "AES-256 encryption for sensitive data at rest (access tokens, credentials)"}</li>
          <li>{zh ? "所有密码使用 Bcrypt 哈希" : "Bcrypt hashing for all passwords"}</li>
          <li>{zh ? "定期安全审计和漏洞评估" : "Regular security audits and vulnerability assessments"}</li>
          <li>{zh ? "严格的访问控制——仅授权人员可访问生产系统" : "Strict access controls — only authorized personnel can access production systems"}</li>
        </ul>
      </section>

      {/* 6 */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold">{zh ? "6. 数据保留" : "6. Data Retention"}</h2>
        <ul className="list-disc pl-6 space-y-1 text-sm">
          <li><strong>{zh ? "账户数据：" : "Account data:"}</strong> {zh ? "在您的账户存续期间保留，删除账户后 30 天内删除" : "Retained for the duration of your account, deleted within 30 days of account deletion"}</li>
          <li><strong>{zh ? "TikTok Shop 数据：" : "TikTok Shop data:"}</strong> {zh ? "为分析历史保留（最多 2 年），或直到您断开连接或删除账户" : "Retained for analytics history (up to 2 years), or until you disconnect your shop or delete your account"}</li>
          <li><strong>{zh ? "使用日志：" : "Usage logs:"}</strong> {zh ? "为安全和调试目的保留 90 天" : "Retained for 90 days for security and debugging purposes"}</li>
          <li><strong>{zh ? "OAuth 令牌：" : "OAuth tokens:"}</strong> {zh ? "在店铺断开连接或账户删除后立即删除" : "Deleted immediately upon shop disconnection or account deletion"}</li>
        </ul>
      </section>

      {/* 7 */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold">{zh ? "7. 数据共享和披露" : "7. Data Sharing and Disclosure"}</h2>
        <p>{zh ? "我们不出售您的个人数据。仅在以下有限情况下共享数据：" : "We do not sell your personal data. We may share data only in the following limited circumstances:"}</p>
        <ul className="list-disc pl-6 space-y-1 text-sm">
          <li><strong>{zh ? "服务提供商：" : "Service Providers:"}</strong> {zh ? "我们可能使用可信的第三方公司来运营基础设施（如云托管、电子邮件递送）" : "We may use trusted third-party companies to operate our infrastructure (e.g., cloud hosting, email delivery)"}</li>
          <li><strong>{zh ? "法律要求：" : "Legal Requirements:"}</strong> {zh ? "如果法律、法院命令或政府机关要求，我们可能披露您的信息" : "We may disclose your information if required by law, court order, or governmental authority"}</li>
          <li><strong>{zh ? "业务转让：" : "Business Transfers:"}</strong> {zh ? "在合并、收购或资产出售的情况下，我们会在您的数据转移前通知您" : "In the event of a merger, acquisition, or sale of assets, we will notify you before your data is transferred"}</li>
        </ul>
      </section>

      {/* 8 */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold">{zh ? "8. 您的权利" : "8. Your Rights"}</h2>
        <p>{zh ? "根据您所在司法管辖区，您可能拥有以下权利：" : "Depending on your jurisdiction, you may have the following rights:"}</p>
        <ul className="list-disc pl-6 space-y-1 text-sm">
          <li><strong>{zh ? "访问：" : "Access:"}</strong> {zh ? "请求我们持有的关于您的所有个人数据的副本" : "Request a copy of all personal data we hold about you"}</li>
          <li><strong>{zh ? "更正：" : "Correction:"}</strong> {zh ? "请求更正不准确或不完整的数据" : "Request correction of inaccurate or incomplete data"}</li>
          <li><strong>{zh ? "删除：" : "Deletion:"}</strong> {zh ? '请求删除您的个人数据（"被遗忘权"）' : 'Request deletion of your personal data ("right to be forgotten")'}</li>
          <li><strong>{zh ? "可携带性：" : "Portability:"}</strong> {zh ? "请求以结构化、机器可读的格式获取您的数据" : "Request your data in a structured, machine-readable format"}</li>
          <li><strong>{zh ? "撤回同意：" : "Withdraw Consent:"}</strong> {zh ? "在基于同意的处理中随时撤回同意" : "Withdraw consent at any time where processing is based on consent"}</li>
        </ul>
        <p className="mt-3">
          {zh ? "要行使这些权利，请发送电子邮件至 " : "To exercise any of these rights, email us at "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline">{CONTACT_EMAIL}</a>
          {zh ? "。我们将在 30 天内回复。" : ". We will respond within 30 days."}
        </p>
      </section>

      {/* 9 */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold">{zh ? "9. 儿童隐私" : "9. Children's Privacy"}</h2>
        <p>
          {zh
            ? `${APP} 专为 18 岁及以上的商业商户设计。我们不会故意收集 18 岁以下任何人的个人信息。`
            : `${APP} is intended exclusively for use by business merchants aged 18 and older. We do not knowingly collect personal information from anyone under the age of 18.`}
        </p>
      </section>

      {/* 10 */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold">{zh ? "10. 国际数据传输" : "10. International Data Transfers"}</h2>
        <p>
          {zh
            ? `您的信息可能会被传输到并保存在位于您所在国家以外的服务器上。使用 ${APP} 即表示您同意此传输。我们采取适当的保障措施来保护您的数据。`
            : `Your information may be transferred to and maintained on servers located outside of your country. By using ${APP}, you consent to this transfer. We implement appropriate safeguards to protect your data during such transfers.`}
        </p>
      </section>

      {/* 11 */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold">{zh ? "11. 本政策的变更" : "11. Changes to This Privacy Policy"}</h2>
        <p>
          {zh
            ? "我们可能会不时更新本隐私政策。我们将通过在网站上发布显著通知和/或向与您账户关联的地址发送电子邮件来通知您任何重大变更。"
            : "We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting a prominent notice on our website and/or sending an email to the address associated with your account."}
        </p>
      </section>

      {/* 12 */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold">{zh ? "12. 联系我们" : "12. Contact Us"}</h2>
        <p>{zh ? "如果您对本隐私政策有任何问题，请联系我们：" : "If you have any questions regarding this Privacy Policy, please contact us:"}</p>
        <div className="mt-3 rounded-xl border bg-muted/30 p-5 text-sm space-y-1">
          <p><strong>{APP}</strong></p>
          <p>{zh ? "电子邮件" : "Email"}: <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline">{CONTACT_EMAIL}</a></p>
          <p>{zh ? "网站" : "Website"}: <a href={WEB} className="text-primary underline" target="_blank" rel="noopener noreferrer">{WEB}</a></p>
        </div>
      </section>
    </article>
  );
}

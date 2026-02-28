"use client";

import { useLanguage } from "@/providers/language-provider";

const LAST_UPDATED = "February 12, 2026";
const CONTACT_EMAIL = "support@tokometrics.com";
const APP = "TokoMetrics";
const WEB = "https://tokometrics.com";

export default function TermsOfServicePage() {
  const { language: lang } = useLanguage();
  const zh = lang === "zh";

  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none">
      <h1 className="text-3xl font-bold tracking-tight">
        {zh ? "服务条款" : "Terms of Service"}
      </h1>
      <p className="text-muted-foreground text-sm mt-1">
        {zh ? "最后更新：" : "Last updated: "}<strong>{LAST_UPDATED}</strong>
      </p>

      <div className="mt-8 rounded-xl border bg-muted/30 p-5 text-sm leading-relaxed">
        <strong>{zh ? "请仔细阅读这些条款。" : "Please read these Terms carefully."}</strong>{" "}
        {zh
          ? `访问或使用 ${APP} 即表示您同意受这些服务条款的约束。如果您不同意这些条款，则不得使用本服务。`
          : `By accessing or using ${APP}, you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use the Service.`}
      </div>

      {/* 1 */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold">{zh ? "1. 接受条款" : "1. Acceptance of Terms"}</h2>
        <p>
          {zh
            ? `通过创建账户或使用 ${APP}（"服务"、"平台"），您确认您已年满 18 岁，拥有签订这些条款的法律权限，并同意遵守所有适用法律法规。`
            : `By creating an account or using ${APP} ("Service", "Platform"), you confirm that you are at least 18 years old, have the legal authority to enter into these Terms, and agree to comply with all applicable laws and regulations.`}
        </p>
        <p>
          {zh
            ? `如果您代表商业实体使用 ${APP}，您声明有权使该实体受这些条款的约束，"您"同时指您个人和该实体。`
            : `If you are using ${APP} on behalf of a business entity, you represent that you have authority to bind that entity to these Terms, and "you" refers to both you personally and that entity.`}
        </p>
      </section>

      {/* 2 */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold">{zh ? "2. 服务描述" : "2. Description of Service"}</h2>
        <p>
          {zh
            ? `${APP} 是一个通过 TikTok 官方 Shop API 连接到 TikTok Shop 的商户分析和管理仪表盘。服务使授权的 TikTok Shop 商户能够：`
            : `${APP} is a merchant analytics and management dashboard that connects to TikTok Shop through TikTok's official Shop API. The Service enables authorized TikTok Shop merchants to:`}
        </p>
        <ul className="list-disc pl-6 space-y-1 text-sm">
          <li>{zh ? "查看综合销售、收入和订单分析" : "View consolidated sales, revenue, and order analytics"}</li>
          <li>{zh ? "监控销售目标和绩效指标" : "Monitor sales targets and performance metrics"}</li>
          <li>{zh ? "分析销售渠道贡献（直播、短视频、商城、达人带货）" : "Analyze sales channel contributions (live stream, short video, mall, influencer)"}</li>
          <li>{zh ? "跟踪商品排名和库存表现" : "Track product rankings and inventory performance"}</li>
          <li>{zh ? "比较多个连接店铺的表现" : "Compare performance across multiple connected shops"}</li>
          <li>{zh ? "查看财务数据和 GMV 报告" : "View financial data and GMV reports"}</li>
        </ul>
      </section>

      {/* 3 */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold">{zh ? "3. 账户注册和安全" : "3. Account Registration and Security"}</h2>
        <p>{zh ? "您在使用服务时负有以下责任：" : "When using the Service, you are responsible for:"}</p>
        <ul className="list-disc pl-6 space-y-1 text-sm">
          <li>{zh ? "提供准确、完整和最新的注册信息" : "Providing accurate, complete, and current registration information"}</li>
          <li>{zh ? "维护账户凭证的机密性" : "Maintaining the confidentiality of your account credentials"}</li>
          <li>{zh ? "限制对您账户的访问" : "Restricting access to your account"}</li>
          <li>{zh ? "在您的账户下发生的所有活动" : "All activities that occur under your account"}</li>
          <li>{zh ? "在发现任何未经授权使用时立即通知我们" : "Promptly notifying us of any unauthorized use"}</li>
        </ul>
      </section>

      {/* 4 */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold">{zh ? "4. TikTok Shop 集成" : "4. TikTok Shop Integration"}</h2>
        <p>
          {zh
            ? "连接 TikTok Shop 时，您确认："
            : "By connecting your TikTok Shop, you acknowledge that:"}
        </p>
        <ul className="list-disc pl-6 space-y-1 text-sm">
          <li>{zh ? `您授权 ${APP} 通过 TikTok Shop API 以只读方式访问您的 TikTok Shop 数据` : `You authorize ${APP} to access your TikTok Shop data in read-only mode through the TikTok Shop API`}</li>
          <li>{zh ? `${APP} 不对 TikTok Shop 平台的可用性、准确性或完整性负责` : `${APP} is not responsible for the availability, accuracy, or completeness of TikTok Shop platform data`}</li>
          <li>{zh ? "您仍需遵守 TikTok 的服务条款和合作伙伴协议" : "You remain bound by TikTok's own Terms of Service and Partner Agreement"}</li>
          <li>{zh ? "您可以随时通过 TikTok 的授权设置或从仪表盘断开 TikTok Shop 来撤销访问权限" : "You can revoke access at any time via TikTok's authorization settings or by disconnecting from the dashboard"}</li>
        </ul>
      </section>

      {/* 5 */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold">{zh ? "5. 可接受的使用" : "5. Acceptable Use"}</h2>
        <p>{zh ? "您同意不会：" : "You agree not to:"}</p>
        <ul className="list-disc pl-6 space-y-1 text-sm">
          <li>{zh ? "将服务用于任何非法或未经授权的目的" : "Use the Service for any unlawful or unauthorized purpose"}</li>
          <li>{zh ? "试图获取对其他用户数据或系统的未经授权访问" : "Attempt to gain unauthorized access to other users' data or systems"}</li>
          <li>{zh ? "传输任何恶意软件、病毒或有害代码" : "Transmit any malware, viruses, or harmful code"}</li>
          <li>{zh ? "干扰或破坏服务的完整性或性能" : "Interfere with or disrupt the integrity or performance of the Service"}</li>
          <li>{zh ? "使用自动化方式以超出合理使用限制的速率访问服务" : "Use automated means to access the Service at a rate exceeding reasonable usage limits"}</li>
          <li>{zh ? "将从服务获得的数据转售或再分发给第三方" : "Resell or redistribute data obtained from the Service to third parties"}</li>
        </ul>
      </section>

      {/* 6 */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold">{zh ? "6. 知识产权" : "6. Intellectual Property"}</h2>
        <p>
          {zh
            ? `${APP} 服务、包括所有代码、设计、文本、图形和用户界面，是 ${APP} 的财产，受版权和其他知识产权法的保护。您的 TikTok Shop 数据仍归您所有。`
            : `The ${APP} Service, including all code, design, text, graphics, and user interfaces, is the property of ${APP} and is protected by copyright and other intellectual property laws. Your TikTok Shop data remains your property.`}
        </p>
      </section>

      {/* 7 */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold">{zh ? "7. 数据隐私" : "7. Data Privacy"}</h2>
        <p>
          {zh
            ? `您对数据的使用受我们`
            : "Your use of the Service is also governed by our "}
          <a href="/privacy" className="text-primary underline">{zh ? "隐私政策" : "Privacy Policy"}</a>
          {zh ? "的约束，该政策通过引用纳入这些条款。" : ", which is incorporated into these Terms by reference."}
        </p>
      </section>

      {/* 8 */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold">{zh ? "8. 免责声明" : "8. Disclaimers"}</h2>
        <p>
          {zh
            ? `${APP} 按"原样"和"可用"的基础提供，不做任何形式的明示或暗示保证。我们不保证服务将不间断、安全或无错误。`
            : `${APP} is provided on an "as-is" and "as-available" basis without warranties of any kind, either express or implied. We do not guarantee that the Service will be uninterrupted, secure, or error-free.`}
        </p>
      </section>

      {/* 9 */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold">{zh ? "9. 责任限制" : "9. Limitation of Liability"}</h2>
        <p>
          {zh
            ? `在适用法律允许的最大范围内，${APP} 不对任何间接、附带、特殊、后果性或惩罚性损害负责，包括但不限于利润损失、数据丢失或商誉损失。`
            : `To the maximum extent permitted by applicable law, ${APP} shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or goodwill.`}
        </p>
      </section>

      {/* 10 */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold">{zh ? "10. 终止" : "10. Termination"}</h2>
        <p>
          {zh
            ? "我们可能在以下情况下暂停或终止您对服务的访问：您违反这些条款、从事欺诈活动，或出于任何其他合理原因，恕不另行通知。终止后，您使用服务的权利将立即终止。"
            : "We may suspend or terminate your access to the Service if you violate these Terms, engage in fraudulent activity, or for any other reasonable cause, without prior notice. Upon termination, your right to use the Service ceases immediately."}
        </p>
      </section>

      {/* 11 */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold">{zh ? "11. 条款变更" : "11. Changes to Terms"}</h2>
        <p>
          {zh
            ? "我们保留随时修改这些条款的权利。我们将通过在服务上发布更新后的条款或向您发送电子邮件通知重大变更。在变更生效后继续使用服务即表示接受修订后的条款。"
            : "We reserve the right to modify these Terms at any time. We will notify material changes by posting the updated Terms on the Service or sending you an email. Continued use of the Service after changes become effective constitutes acceptance of the revised Terms."}
        </p>
      </section>

      {/* 12 */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold">{zh ? "12. 适用法律" : "12. Governing Law"}</h2>
        <p>
          {zh
            ? "这些条款受适用法律管辖并按其解释。由这些条款引起的任何争议应通过友好协商解决，协商不成的，提交有管辖权的法院解决。"
            : "These Terms shall be governed by and construed in accordance with applicable laws. Any dispute arising from these Terms shall be resolved through amicable negotiation first, and if unsuccessful, submitted to a court of competent jurisdiction."}
        </p>
      </section>

      {/* 13 */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold">{zh ? "13. 联系我们" : "13. Contact Us"}</h2>
        <p>{zh ? "如果您对这些服务条款有任何问题，请联系我们：" : "If you have any questions about these Terms of Service, please contact us:"}</p>
        <div className="mt-3 rounded-xl border bg-muted/30 p-5 text-sm space-y-1">
          <p><strong>{APP}</strong></p>
          <p>{zh ? "电子邮件" : "Email"}: <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline">{CONTACT_EMAIL}</a></p>
          <p>{zh ? "网站" : "Website"}: <a href={WEB} className="text-primary underline" target="_blank" rel="noopener noreferrer">{WEB}</a></p>
        </div>
      </section>
    </article>
  );
}

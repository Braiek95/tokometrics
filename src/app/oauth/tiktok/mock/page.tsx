"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Music } from "lucide-react";

function MockTikTokOAuthContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const state = searchParams.get("state") || "";
  const redirectUri = searchParams.get("redirect_uri") || "";

  const [shopName, setShopName] = useState("");
  const [region, setRegion] = useState("US");
  const [isLoading, setIsLoading] = useState(false);

  function handleAuthorize() {
    if (!shopName.trim()) return;

    setIsLoading(true);

    const callbackUrl = decodeURIComponent(redirectUri);
    const separator = callbackUrl.includes("?") ? "&" : "?";
    const fullUrl = `${callbackUrl}${separator}code=${encodeURIComponent(
      shopName.trim()
    )}&state=${state}&region=${region}`;

    window.location.href = fullUrl;
  }

  function handleCancel() {
    router.push("/shops");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#121212] p-4">
      <div className="w-full max-w-md">
        {/* TT Shop Header */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FE2C55]">
            <Music className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">TT Shop</h1>
          <p className="text-sm text-gray-400">
            Connect your shop to TokoMetrics
          </p>
        </div>

        {/* Authorization Card */}
        <div className="rounded-2xl border border-gray-800 bg-[#1E1E1E] p-6">
          <h2 className="mb-1 text-lg font-semibold text-white">
            Authorize TokoMetrics
          </h2>
          <p className="mb-6 text-sm text-gray-400">
            TokoMetrics is requesting access to your TikTok Shop data including
            orders, products, and analytics.
          </p>

          {/* Permissions list */}
          <div className="mb-6 space-y-2">
            {[
              "View and manage products",
              "View and manage orders",
              "View shop analytics",
              "Access shop settings",
            ].map((permission) => (
              <div
                key={permission}
                className="flex items-center gap-2 text-sm text-gray-300"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FE2C55]/20">
                  <svg
                    className="h-3 w-3 text-[#FE2C55]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                {permission}
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="shopName"
                className="mb-1.5 block text-sm font-medium text-gray-300"
              >
                Shop Name
              </label>
              <input
                id="shopName"
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="Enter your shop name"
                className="w-full rounded-lg border border-gray-700 bg-[#2A2A2A] px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-[#FE2C55] focus:ring-1 focus:ring-[#FE2C55]"
              />
            </div>

            <div>
              <label
                htmlFor="region"
                className="mb-1.5 block text-sm font-medium text-gray-300"
              >
                Region
              </label>
              <select
                id="region"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-[#2A2A2A] px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-[#FE2C55] focus:ring-1 focus:ring-[#FE2C55]"
              >
                <option value="US">United States</option>
                <option value="GB">United Kingdom</option>
                <option value="SG">Singapore</option>
                <option value="TH">Thailand</option>
                <option value="MY">Malaysia</option>
                <option value="VN">Vietnam</option>
                <option value="PH">Philippines</option>
                <option value="ID">Indonesia</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={handleAuthorize}
              disabled={!shopName.trim() || isLoading}
              className="w-full rounded-lg bg-[#FE2C55] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#E5274D] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Connecting..." : "Authorize TokoMetrics"}
            </button>
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="w-full rounded-lg border border-gray-700 bg-transparent px-4 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-4 text-center text-xs text-gray-600">
          This is a demo OAuth screen for development purposes.
          <br />
          No real TikTok data is accessed.
        </p>
      </div>
    </div>
  );
}

export default function MockTikTokOAuthPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#121212]">
          <div className="text-gray-400">Loading...</div>
        </div>
      }
    >
      <MockTikTokOAuthContent />
    </Suspense>
  );
}

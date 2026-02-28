-- CreateTable
CREATE TABLE "ProductVariant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "totalSold" INTEGER NOT NULL DEFAULT 0,
    "totalRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "imageUrl" TEXT,
    "productId" TEXT NOT NULL,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiveStreamRoom" (
    "id" TEXT NOT NULL,
    "roomName" TEXT NOT NULL,
    "hostName" TEXT,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "viewers" INTEGER NOT NULL DEFAULT 0,
    "revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "orderCount" INTEGER NOT NULL DEFAULT 0,
    "gmv" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dailyMetricId" TEXT NOT NULL,

    CONSTRAINT "LiveStreamRoom_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductVariant_productId_idx" ON "ProductVariant"("productId");

-- CreateIndex
CREATE INDEX "LiveStreamRoom_dailyMetricId_idx" ON "LiveStreamRoom"("dailyMetricId");

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveStreamRoom" ADD CONSTRAINT "LiveStreamRoom_dailyMetricId_fkey" FOREIGN KEY ("dailyMetricId") REFERENCES "DailyMetric"("id") ON DELETE CASCADE ON UPDATE CASCADE;

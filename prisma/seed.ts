import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";
import { subDays, startOfDay, addHours, getDay } from "date-fns";
import type { ProductStatus, OrderStatus } from "../src/generated/prisma/client";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// ─── Product Names by Category ──────────────────────────────────────

const PRODUCT_NAMES: Record<string, string[]> = {
  Beauty: [
    "Glow Serum Vitamin C",
    "Hydrating Face Cream SPF 30",
    "Matte Lipstick Collection",
    "Retinol Night Repair Cream",
    "Lash Extension Mascara",
    "Rose Water Toner Mist",
    "Collagen Sheet Mask Pack",
    "Brow Sculpting Pencil",
    "Under Eye Concealer Duo",
    "Exfoliating Sugar Scrub",
  ],
  Fashion: [
    "Oversized Graphic Tee",
    "High-Waist Cargo Pants",
    "Cropped Denim Jacket",
    "Silk Scrunchie Set (6pc)",
    "Chunky Platform Sneakers",
    "Minimalist Gold Chain Necklace",
    "Crossbody Phone Bag",
    "Wide-Leg Linen Trousers",
    "Y2K Butterfly Hair Clips",
    "Vintage Oversized Sunglasses",
  ],
  Electronics: [
    "Wireless Earbuds Pro",
    "LED Ring Light 10-inch",
    "Portable Phone Tripod",
    "Bluetooth Speaker Mini",
    "USB-C Fast Charging Cable",
    "Selfie Stick with Remote",
    "Laptop Stand Adjustable",
    "Smart Watch Fitness Band",
    "Phone Camera Lens Kit",
    "Wireless Charging Pad",
  ],
  "Home & Living": [
    "Scented Soy Candle Set",
    "Bamboo Organizer Tray",
    "LED String Fairy Lights",
    "Velvet Throw Pillow Cover",
    "Plant Mister Spray Bottle",
    "Acrylic Storage Box",
    "Minimalist Desk Clock",
    "Ceramic Planter Pot Set",
    "Linen Table Runner",
    "Essential Oil Diffuser",
  ],
  "Food & Beverages": [
    "Matcha Green Tea Powder",
    "Organic Honey Sticks",
    "Korean Ramen Variety Pack",
    "Dried Mango Slices",
    "Bubble Tea Kit",
    "Hot Sauce Sampler Set",
    "Protein Energy Bars (12pk)",
    "Freeze-Dried Fruit Mix",
    "Japanese Mochi Assortment",
    "Cold Brew Coffee Concentrate",
  ],
  "Toys & Games": [
    "Fidget Spinner Deluxe",
    "Mini Building Block Set",
    "Squishy Stress Ball Pack",
    "Card Game Party Edition",
    "Magnetic Drawing Board",
    "Puzzle Cube Speed 3x3",
    "Plush Keychain Characters",
    "Slime Making Kit",
    "Pop It Fidget Board",
    "RC Mini Drone",
  ],
};

const CATEGORIES = Object.keys(PRODUCT_NAMES);

// ─── Generator Functions ────────────────────────────────────────────

function generateProducts(shopId: string, count: number, categoryBias?: string[]) {
  const products = [];
  const categories = categoryBias && categoryBias.length > 0 ? categoryBias : CATEGORIES;

  for (let i = 0; i < count; i++) {
    const category = categories[i % categories.length];
    const namesInCategory = PRODUCT_NAMES[category] ?? PRODUCT_NAMES["Beauty"];
    const name = namesInCategory[i % namesInCategory.length];

    const price = parseFloat(
      faker.number.float({ min: 5, max: 200, fractionDigits: 2 }).toFixed(2)
    );
    const stock = faker.number.int({ min: 0, max: 500 });
    const totalSold = faker.number.int({ min: 0, max: 5000 });
    const totalRevenue = parseFloat((totalSold * price).toFixed(2));
    const rating = parseFloat(
      faker.number.float({ min: 3.0, max: 5.0, fractionDigits: 1 }).toFixed(1)
    );

    let status: ProductStatus = "ACTIVE";
    const statusRoll = faker.number.float({ min: 0, max: 1 });
    if (statusRoll > 0.9) {
      status = "OUT_OF_STOCK";
    } else if (statusRoll > 0.8) {
      status = "INACTIVE";
    }

    const skuSuffix = faker.string.alphanumeric({ length: 4 }).toUpperCase();

    products.push({
      shopId,
      name,
      description: faker.commerce.productDescription(),
      sku: `SKU-${skuSuffix}`,
      price,
      stock: status === "OUT_OF_STOCK" ? 0 : stock,
      totalSold,
      totalRevenue,
      rating,
      category,
      imageUrl: null,
      status,
    });
  }

  return products;
}

function generateOrders(
  shopId: string,
  products: { id: string; price: number }[],
  count: number,
  daysBack: number
) {
  const now = new Date();
  const orders = [];

  const statusWeights: { status: OrderStatus; weight: number }[] = [
    { status: "DELIVERED", weight: 0.4 },
    { status: "SHIPPED", weight: 0.2 },
    { status: "PROCESSING", weight: 0.15 },
    { status: "PENDING", weight: 0.1 },
    { status: "CANCELLED", weight: 0.1 },
    { status: "REFUNDED", weight: 0.05 },
  ];

  function pickWeightedStatus(): OrderStatus {
    const roll = faker.number.float({ min: 0, max: 1 });
    let cumulative = 0;
    for (const sw of statusWeights) {
      cumulative += sw.weight;
      if (roll <= cumulative) return sw.status;
    }
    return "DELIVERED";
  }

  for (let i = 0; i < count; i++) {
    const daysAgo = faker.number.int({ min: 0, max: daysBack - 1 });
    let orderDate = subDays(now, daysAgo);
    orderDate = startOfDay(orderDate);
    orderDate = addHours(orderDate, faker.number.int({ min: 6, max: 23 }));

    const orderNumber = `TK-${shopId.slice(-4).toUpperCase()}-${faker.string.numeric({ length: 6 })}`;
    const status = pickWeightedStatus();

    const itemCount = faker.number.int({ min: 1, max: 4 });
    const items = [];
    let totalAmount = 0;

    for (let j = 0; j < itemCount; j++) {
      const product = products[faker.number.int({ min: 0, max: products.length - 1 })];
      const quantity = faker.number.int({ min: 1, max: 3 });
      const unitPrice = product.price;
      const totalPrice = parseFloat((unitPrice * quantity).toFixed(2));
      totalAmount += totalPrice;

      items.push({
        productId: product.id,
        quantity,
        unitPrice,
        totalPrice,
      });
    }

    totalAmount = parseFloat(totalAmount.toFixed(2));

    orders.push({
      shopId,
      orderNumber,
      status,
      totalAmount,
      customerName: faker.person.fullName(),
      customerEmail: faker.internet.email(),
      shippingAddress: `${faker.location.streetAddress()}, ${faker.location.city()}, ${faker.location.state()} ${faker.location.zipCode()}`,
      createdAt: orderDate,
      items,
    });
  }

  return orders;
}

function generateDailyMetrics(shopId: string, daysBack: number, revenueMultiplier: number = 1) {
  const now = new Date();
  const metrics = [];

  for (let i = daysBack - 1; i >= 0; i--) {
    const date = startOfDay(subDays(now, i));
    const dayOfWeek = getDay(date);
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    const trendMultiplier = 1 + ((daysBack - i) / daysBack) * 0.3;
    let baseRevenue =
      faker.number.float({ min: 500, max: 3000 }) * trendMultiplier * revenueMultiplier;

    if (isWeekend) {
      baseRevenue *= 1 + faker.number.float({ min: 0.2, max: 0.4 });
    }

    baseRevenue *= 1 + faker.number.float({ min: -0.2, max: 0.2 });

    if (faker.number.float({ min: 0, max: 1 }) < 0.1) {
      baseRevenue *= 1 + faker.number.float({ min: 0.5, max: 1.0 });
    }

    const revenue = parseFloat(baseRevenue.toFixed(2));
    const aov = parseFloat(
      faker.number.float({ min: 25, max: 75, fractionDigits: 2 }).toFixed(2)
    );
    const orderCount = Math.max(1, Math.round(revenue / aov));
    const unitsSold = Math.round(
      orderCount * faker.number.float({ min: 1.2, max: 2.5 })
    );
    const newCustomers = faker.number.int({ min: 5, max: 30 });
    const conversionRate = parseFloat(
      faker.number.float({ min: 2, max: 8, fractionDigits: 2 }).toFixed(2)
    );

    // Channel breakdown
    const isWeekend2 = dayOfWeek === 0 || dayOfWeek === 6;
    const liveStreamRatio = isWeekend2
      ? faker.number.float({ min: 0.38, max: 0.48 })
      : faker.number.float({ min: 0.30, max: 0.42 });
    const shortVideoRatio = faker.number.float({ min: 0.18, max: 0.28 });
    const mallRatio = faker.number.float({ min: 0.12, max: 0.22 });
    const influencerRatio = Math.max(0, 1 - liveStreamRatio - shortVideoRatio - mallRatio);

    metrics.push({
      shopId,
      date,
      revenue,
      orderCount,
      unitsSold,
      averageOrderValue: aov,
      newCustomers,
      conversionRate,
      liveStreamRevenue: parseFloat((revenue * liveStreamRatio).toFixed(2)),
      shortVideoRevenue: parseFloat((revenue * shortVideoRatio).toFixed(2)),
      mallRevenue: parseFloat((revenue * mallRatio).toFixed(2)),
      influencerRevenue: parseFloat((revenue * influencerRatio).toFixed(2)),
      liveStreamOrders: Math.round(orderCount * liveStreamRatio),
      shortVideoOrders: Math.round(orderCount * shortVideoRatio),
      mallOrders: Math.round(orderCount * mallRatio),
      influencerOrders: Math.max(0, orderCount - Math.round(orderCount * liveStreamRatio) - Math.round(orderCount * shortVideoRatio) - Math.round(orderCount * mallRatio)),
    });
  }

  return metrics;
}

// ─── Product Variant Generator ──────────────────────────────────────

const VARIANT_COLORS = ["Red", "Blue", "Black", "White", "Pink", "Green", "Navy", "Beige"];
const VARIANT_SIZES = ["S", "M", "L", "XL", "One Size"];

function generateVariants(
  products: { id: string; price: number; name: string; totalSold: number; totalRevenue: number }[]
) {
  const variants = [];

  for (const product of products) {
    const variantCount = faker.number.int({ min: 2, max: 5 });
    const colors = faker.helpers.shuffle([...VARIANT_COLORS]).slice(0, variantCount);

    const weights = Array.from({ length: variantCount }, () => faker.number.float({ min: 0.5, max: 3 }));
    const totalWeight = weights.reduce((a, b) => a + b, 0);

    for (let i = 0; i < variantCount; i++) {
      const ratio = weights[i] / totalWeight;
      const size = VARIANT_SIZES[faker.number.int({ min: 0, max: VARIANT_SIZES.length - 1 })];
      const variantName = `${colors[i]} / ${size}`;
      const skuSuffix = faker.string.alphanumeric({ length: 3 }).toUpperCase();
      const variantSold = Math.round(product.totalSold * ratio);
      const priceVariation = product.price * (1 + faker.number.float({ min: -0.1, max: 0.15 }));
      const variantPrice = parseFloat(priceVariation.toFixed(2));
      const variantRevenue = parseFloat((variantSold * variantPrice).toFixed(2));

      variants.push({
        productId: product.id,
        name: variantName,
        sku: `SKU-${skuSuffix}-${colors[i].substring(0, 2).toUpperCase()}`,
        price: variantPrice,
        stock: faker.number.int({ min: 0, max: 200 }),
        totalSold: variantSold,
        totalRevenue: variantRevenue,
        imageUrl: null,
      });
    }
  }

  return variants;
}

// ─── Live Stream Room Generator ─────────────────────────────────────

const ROOM_NAMES = [
  "Main Live Room", "Evening Flash Sale", "Morning Show",
  "Weekend Special", "New Arrivals Live", "VIP Members Room",
  "Brand Showcase", "Holiday Sale Room",
];

const HOST_NAMES = [
  "Sarah Chen", "Mike Li", "Amy Wang", "David Liu",
  "Jenny Zhang", "Chris Wu", "Luna He", "Tom Xu",
];

function generateLiveStreamRooms(
  metric: { id: string; date: Date; liveStreamRevenue: number; liveStreamOrders: number }
) {
  const roomCount = faker.number.int({ min: 1, max: 4 });
  const rooms = [];

  const weights = Array.from({ length: roomCount }, () => faker.number.float({ min: 0.3, max: 2 }));
  const totalWeight = weights.reduce((a, b) => a + b, 0);

  for (let i = 0; i < roomCount; i++) {
    const ratio = weights[i] / totalWeight;
    const roomRevenue = parseFloat((metric.liveStreamRevenue * ratio).toFixed(2));
    const roomOrders = Math.max(1, Math.round(metric.liveStreamOrders * ratio));
    const startHour = faker.number.int({ min: 8, max: 20 });
    const durationHours = faker.number.int({ min: 1, max: 4 });

    const startTime = new Date(metric.date);
    startTime.setHours(startHour, 0, 0, 0);
    const endTime = new Date(startTime);
    endTime.setHours(startHour + durationHours);

    rooms.push({
      dailyMetricId: metric.id,
      roomName: ROOM_NAMES[i % ROOM_NAMES.length],
      hostName: HOST_NAMES[faker.number.int({ min: 0, max: HOST_NAMES.length - 1 })],
      startTime,
      endTime,
      viewers: faker.number.int({ min: 50, max: 5000 }),
      revenue: roomRevenue,
      orderCount: roomOrders,
      gmv: parseFloat((roomRevenue * faker.number.float({ min: 1.0, max: 1.3 })).toFixed(2)),
    });
  }

  return rooms;
}

// ─── Shop Definitions ───────────────────────────────────────────────

interface ShopDefinition {
  name: string;
  region: string;
  currency: string;
  productCount: number;
  orderCount: number;
  monthlyRevenueGoal: number;
  revenueMultiplier: number;
  categoryBias: string[];
  syncInterval: number;
}

const DEMO_SHOPS: ShopDefinition[] = [
  {
    name: "Glamour Beauty Co.",
    region: "US",
    currency: "USD",
    productCount: 15,
    orderCount: 40,
    monthlyRevenueGoal: 25000,
    revenueMultiplier: 1.2,
    categoryBias: ["Beauty", "Fashion"],
    syncInterval: 15,
  },
  {
    name: "TechGadgets Asia",
    region: "SG",
    currency: "SGD",
    productCount: 15,
    orderCount: 40,
    monthlyRevenueGoal: 50000,
    revenueMultiplier: 1.5,
    categoryBias: ["Electronics", "Toys & Games"],
    syncInterval: 30,
  },
  {
    name: "CozyHome London",
    region: "GB",
    currency: "GBP",
    productCount: 12,
    orderCount: 30,
    monthlyRevenueGoal: 18000,
    revenueMultiplier: 0.9,
    categoryBias: ["Home & Living", "Beauty"],
    syncInterval: 30,
  },
  {
    name: "BKK Style 曼谷潮牌",
    region: "TH",
    currency: "THB",
    productCount: 15,
    orderCount: 40,
    monthlyRevenueGoal: 200000,
    revenueMultiplier: 2.0,
    categoryBias: ["Fashion", "Beauty", "Toys & Games"],
    syncInterval: 15,
  },
  {
    name: "YummyBites MY",
    region: "MY",
    currency: "MYR",
    productCount: 12,
    orderCount: 35,
    monthlyRevenueGoal: 35000,
    revenueMultiplier: 1.3,
    categoryBias: ["Food & Beverages", "Home & Living"],
    syncInterval: 60,
  },
  {
    name: "VN SmartTech",
    region: "VN",
    currency: "VND",
    productCount: 10,
    orderCount: 20,
    monthlyRevenueGoal: 80000,
    revenueMultiplier: 0.5,
    categoryBias: ["Electronics"],
    syncInterval: 30,
  },
];

// ─── Main Seed Function ─────────────────────────────────────────────

async function main() {
  console.log("Starting seed...\n");

  // 0. FULL CLEANUP - wipe everything for fresh start
  console.log("[0/3] Cleaning database...");
  try {
    await prisma.liveStreamRoom.deleteMany({});
    await prisma.productVariant.deleteMany({});
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.dailyMetric.deleteMany({});
    await prisma.shopSettings.deleteMany({});
    await prisma.tikTokToken.deleteMany({});
    await prisma.shop.deleteMany({});
    await prisma.user.deleteMany({});
    console.log("  [OK] Database cleaned");
  } catch (e) {
    console.log("  [WARN] Cleanup partial:", (e as Error).message?.slice(0, 60));
  }

  // 1. Create demo user
  console.log("\n[1/3] Creating user...");
  const hashedPassword = await bcrypt.hash("demo123", 10);

  const user = await prisma.user.create({
    data: { email: "demo@tokometrics.com", name: "Demo User", hashedPassword },
  });

  console.log(`  [OK] User: ${user.email}`);

  // 2. Create shops
  console.log("\n[2/3] Creating shops + data...");
  for (const shopDef of DEMO_SHOPS) {
    console.log(`\n── ${shopDef.name} ──`);

    faker.seed(shopDef.name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0));

    // Create shop
    const shop = await prisma.shop.create({
      data: {
        name: shopDef.name,
        status: "ACTIVE",
        region: shopDef.region,
        currency: shopDef.currency,
        userId: user.id,
      },
    });

    // TikTok Token
    await prisma.tikTokToken.create({
      data: {
        shopId: shop.id,
        accessToken: faker.string.alphanumeric({ length: 64 }),
        refreshToken: faker.string.alphanumeric({ length: 64 }),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        scopes: ["shop.read", "order.read", "product.read", "analytics.read"],
      },
    });

    // Settings
    await prisma.shopSettings.create({
      data: {
        shopId: shop.id,
        notificationsEnabled: true,
        emailNotifications: true,
        syncIntervalMinutes: shopDef.syncInterval,
        monthlyRevenueGoal: shopDef.monthlyRevenueGoal,
        annualRevenueGoal: shopDef.monthlyRevenueGoal * 12,
      },
    });

    console.log("  [OK] Shop + token + settings");

    // ★ METRICS FIRST (dashboard needs this most) ★
    try {
      console.log("  Creating 30 days of metrics...");
      const metricsData = generateDailyMetrics(shop.id, 30, shopDef.revenueMultiplier);
      await prisma.dailyMetric.createMany({ data: metricsData });
      console.log("  [OK] 90 daily metrics");
    } catch (e) {
      console.log("  [WARN] Metrics error:", (e as Error).message?.slice(0, 80));
    }

    // ★ LIVE STREAM ROOMS (batched) ★
    try {
      const createdMetrics = await prisma.dailyMetric.findMany({
        where: { shopId: shop.id },
        select: { id: true, date: true, liveStreamRevenue: true, liveStreamOrders: true },
      });

      // Batch all rooms into one createMany call
      const allRooms: ReturnType<typeof generateLiveStreamRooms> = [];
      for (const metric of createdMetrics) {
        allRooms.push(...generateLiveStreamRooms(metric));
      }

      // Insert in chunks of 100
      for (let i = 0; i < allRooms.length; i += 100) {
        const chunk = allRooms.slice(i, i + 100);
        await prisma.liveStreamRoom.createMany({ data: chunk });
      }
      console.log(`  [OK] ${allRooms.length} live stream rooms`);
    } catch (e) {
      console.log("  [WARN] Rooms error:", (e as Error).message?.slice(0, 80));
    }

    // ★ PRODUCTS + VARIANTS ★
    try {
      const productData = generateProducts(shop.id, shopDef.productCount, shopDef.categoryBias);
      await prisma.product.createMany({ data: productData });

      const createdProducts = await prisma.product.findMany({
        where: { shopId: shop.id },
        select: { id: true, price: true, name: true, totalSold: true, totalRevenue: true },
      });

      const variantData = generateVariants(createdProducts);
      await prisma.productVariant.createMany({ data: variantData });
      console.log(`  [OK] ${shopDef.productCount} products + ${variantData.length} variants`);
    } catch (e) {
      console.log("  [WARN] Products error:", (e as Error).message?.slice(0, 80));
    }

    // ★ ORDERS (last, most expensive operation) ★
    try {
      const products = await prisma.product.findMany({
        where: { shopId: shop.id },
        select: { id: true, price: true },
      });

      if (products.length > 0) {
        console.log(`  Creating ${shopDef.orderCount} orders...`);
        const orderData = generateOrders(shop.id, products, shopDef.orderCount, 30);

        // Create orders in small batches
        let done = 0;
        for (const order of orderData) {
          const { items, ...orderFields } = order;
          await prisma.order.create({
            data: { ...orderFields, items: { create: items } },
          });
          done++;
          if (done % 20 === 0) {
            console.log(`    ...${done}/${shopDef.orderCount}`);
          }
        }
        console.log(`  [OK] ${done} orders`);
      }
    } catch (e) {
      console.log("  [WARN] Orders error:", (e as Error).message?.slice(0, 80));
      console.log("  (Dashboard will still work - metrics are loaded)");
    }

    console.log(`  ✅ ${shopDef.name} done!`);
  }

  console.log("\n[3/3] Verifying...");
  const shopCount = await prisma.shop.count();
  const productCount = await prisma.product.count();
  const metricCount = await prisma.dailyMetric.count();
  const orderCount = await prisma.order.count();

  console.log(`  Shops: ${shopCount}`);
  console.log(`  Products: ${productCount}`);
  console.log(`  Daily Metrics: ${metricCount}`);
  console.log(`  Orders: ${orderCount}`);

  console.log("\n╔══════════════════════════════════════╗");
  console.log("║       Seed completed!                ║");
  console.log("╠══════════════════════════════════════╣");
  console.log("║  Email:    demo@tokometrics.com      ║");
  console.log("║  Password: demo123                   ║");
  console.log("╚══════════════════════════════════════╝");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

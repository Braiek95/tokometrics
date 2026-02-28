import { faker } from "@faker-js/faker";
import { subDays, getDay, startOfDay, addHours } from "date-fns";
import { prisma } from "@/lib/prisma";
import type { ProductStatus, OrderStatus } from "@/generated/prisma/client";

// Seed faker for consistent data across runs
faker.seed(42);

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

// ─── Generate Mock Products ─────────────────────────────────────────

export function generateMockProducts(shopId: string, count: number) {
  const products = [];

  for (let i = 0; i < count; i++) {
    const category = CATEGORIES[i % CATEGORIES.length];
    const namesInCategory = PRODUCT_NAMES[category];
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

    // 80% ACTIVE, 10% INACTIVE, 10% OUT_OF_STOCK
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

// ─── Generate Mock Orders ───────────────────────────────────────────

export function generateMockOrders(
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

    const orderNumber = `TK-${faker.string.numeric({ length: 6 })}`;
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

// ─── Generate Mock Daily Metrics ────────────────────────────────────

export function generateMockDailyMetrics(shopId: string, daysBack: number) {
  const now = new Date();
  const metrics = [];

  for (let i = daysBack - 1; i >= 0; i--) {
    const date = startOfDay(subDays(now, i));
    const dayOfWeek = getDay(date);
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    const trendMultiplier = 1 + ((daysBack - i) / daysBack) * 0.3;
    let baseRevenue =
      faker.number.float({ min: 500, max: 3000 }) * trendMultiplier;

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

    // ─── Channel Revenue Breakdown ───────────────────────────────
    const liveStreamRatio = isWeekend
      ? faker.number.float({ min: 0.38, max: 0.48 })
      : faker.number.float({ min: 0.30, max: 0.42 });
    const shortVideoRatio = faker.number.float({ min: 0.18, max: 0.28 });
    const mallRatio = faker.number.float({ min: 0.12, max: 0.22 });
    const influencerRatio = Math.max(
      0,
      1 - liveStreamRatio - shortVideoRatio - mallRatio
    );

    const liveStreamRevenue = parseFloat((revenue * liveStreamRatio).toFixed(2));
    const shortVideoRevenue = parseFloat((revenue * shortVideoRatio).toFixed(2));
    const mallRevenue = parseFloat((revenue * mallRatio).toFixed(2));
    const influencerRevenue = parseFloat(
      (revenue * influencerRatio).toFixed(2)
    );

    const liveStreamOrders = Math.round(orderCount * liveStreamRatio);
    const shortVideoOrders = Math.round(orderCount * shortVideoRatio);
    const mallOrders = Math.round(orderCount * mallRatio);
    const influencerOrders = Math.max(
      0,
      orderCount - liveStreamOrders - shortVideoOrders - mallOrders
    );

    metrics.push({
      shopId,
      date,
      revenue,
      orderCount,
      unitsSold,
      averageOrderValue: aov,
      newCustomers,
      conversionRate,
      liveStreamRevenue,
      shortVideoRevenue,
      mallRevenue,
      influencerRevenue,
      liveStreamOrders,
      shortVideoOrders,
      mallOrders,
      influencerOrders,
    });
  }

  return metrics;
}

// ─── Generate Mock Product Variants (SKU-level) ─────────────────────

const VARIANT_COLORS = ["Red", "Blue", "Black", "White", "Pink", "Green", "Navy", "Beige"];
const VARIANT_SIZES = ["S", "M", "L", "XL", "One Size"];

export function generateMockVariants(
  products: { id: string; price: number; name: string; totalSold: number; totalRevenue: number }[]
) {
  const variants = [];

  for (const product of products) {
    // Each product has 2-5 variants
    const variantCount = faker.number.int({ min: 2, max: 5 });
    const colors = faker.helpers.shuffle([...VARIANT_COLORS]).slice(0, variantCount);

    // Distribute totalSold and totalRevenue across variants (with some randomness)
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

// ─── Generate Mock Live Stream Rooms ────────────────────────────────

const ROOM_NAMES = [
  "Main Live Room", "Evening Flash Sale", "Morning Show",
  "Weekend Special", "New Arrivals Live", "VIP Members Room",
  "Brand Showcase", "Holiday Sale Room",
];

const HOST_NAMES = [
  "Sarah Chen", "Mike Li", "Amy Wang", "David Liu",
  "Jenny Zhang", "Chris Wu", "Luna He", "Tom Xu",
];

export function generateMockLiveStreamRooms(
  metric: { id: string; date: Date; liveStreamRevenue: number; liveStreamOrders: number }
) {
  // 1-4 live stream rooms per day
  const roomCount = faker.number.int({ min: 1, max: 4 });
  const rooms = [];

  // Distribute daily live stream revenue across rooms
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

// ─── Seed Shop Data ─────────────────────────────────────────────────

export async function seedShopData(shopId: string) {
  faker.seed(shopId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0));

  const productData = generateMockProducts(shopId, 20);
  await prisma.product.createMany({ data: productData });

  const createdProducts = await prisma.product.findMany({
    where: { shopId },
    select: { id: true, price: true, name: true, totalSold: true, totalRevenue: true },
  });

  // Generate variants for each product
  const variantData = generateMockVariants(createdProducts);
  await prisma.productVariant.createMany({ data: variantData });

  const orderData = generateMockOrders(shopId, createdProducts, 300, 90);

  for (const order of orderData) {
    const { items, ...orderFields } = order;
    await prisma.order.create({
      data: {
        ...orderFields,
        items: {
          create: items,
        },
      },
    });
  }

  const metricsData = generateMockDailyMetrics(shopId, 90);
  await prisma.dailyMetric.createMany({ data: metricsData });

  // Generate live stream rooms for each daily metric
  const createdMetrics = await prisma.dailyMetric.findMany({
    where: { shopId },
    select: { id: true, date: true, liveStreamRevenue: true, liveStreamOrders: true },
  });

  for (const metric of createdMetrics) {
    const rooms = generateMockLiveStreamRooms(metric);
    if (rooms.length > 0) {
      await prisma.liveStreamRoom.createMany({ data: rooms });
    }
  }
}

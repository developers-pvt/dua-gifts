const fs = require('fs');
const path = require('path');

// Target directories for downloaded media
const MEDIA_DIR = path.join(__dirname, '..', 'data', 'downloaded_photos');
const FRONTEND_MEDIA_DIR = path.join(__dirname, '..', 'frontend-shopco', 'public', 'images', 'giftstudio');
const DATA_DIR = path.join(__dirname, '..', 'data');

for (const d of [MEDIA_DIR, FRONTEND_MEDIA_DIR, DATA_DIR]) {
  if (!fs.existsSync(d)) {
    fs.mkdirSync(d, { recursive: true });
  }
}

// Sanitize any string so it is 100% compatible with WIN1252 / ASCII DB encoding
function sanitizeForDb(str) {
  if (!str) return '';
  return str
    // Remove 4-byte UTF-8 emojis and surrogate pairs
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/gu, '')
    .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '')
    // Replace decorative bullets and symbols with standard ASCII
    .replace(/[•●▪■◆★☆✓✔🔹]/g, '-')
    // Replace smart quotes and dashes
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/\u00A0/g, ' ')
    // Remove any remaining characters outside basic multilingual ASCII/Latin range
    .replace(/[^\x00-\x7F]/g, ' ')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Map product into one of the 6 core business categories
function categorizeProduct(p) {
  const text = (p.title + ' ' + (p.product_type || '') + ' ' + (p.tags || []).join(' ')).toLowerCase();
  
  if (text.includes('nikkah') || text.includes('nikah') || text.includes('wedding') || text.includes('ring tray') || 
      text.includes('dupatta') || text.includes('chadar') || text.includes('thumb board') || text.includes('mehndi') || 
      text.includes('cake topper') || text.includes('invitation')) {
    return 'Nikah & Wedding Specials';
  }
  if (text.includes('car hanging') || text.includes('car decor') || text.includes('car ornament') || 
      text.includes('islamic') || text.includes('calligraphy') || text.includes('quran') || 
      text.includes('ayatul kursi') || text.includes('resin car')) {
    return 'Islamic Art & Car Accessories';
  }
  if (text.includes('mug') || text.includes('bottle') || text.includes('tumbler') || text.includes('cup') || 
      text.includes('water bottle') || text.includes('ceramic mug')) {
    return 'Personalized Drinkware & Bottles';
  }
  if (text.includes('shirt') || text.includes('hoodie') || text.includes('cap') || text.includes('bag') || 
      text.includes('pillow') || text.includes('cufflinks') || text.includes('wallet') || text.includes('jewelry') || 
      text.includes('necklace') || text.includes('bracelet') || text.includes('ring') || text.includes('flag')) {
    return 'Custom Apparel & Keepsakes';
  }
  if (text.includes('frame') || text.includes('lamp') || text.includes('plaque') || text.includes('acrylic') || 
      text.includes('mirror') || text.includes('neon') || text.includes('clock') || text.includes('photo') || 
      text.includes('wall art')) {
    return 'Photo Frames & LED Acrylic Lamps';
  }
  return 'Customized Gift Boxes & Baskets';
}

// Clean and convert Shopify HTML into structured, professional markdown
function cleanDescription(html, title) {
  if (!html) {
    return `Handcrafted customized gift item from Gift Studio PK.\n\n### Product Features:\n- Premium quality handcrafted materials\n- Custom personalization available\n- Safely packed in Gift Studio signature packaging\n- 3-5 business days delivery across Pakistan`;
  }

  let text = html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li[^>]*>/gi, '- ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();

  text = sanitizeForDb(text);

  if (text.length < 50) {
    text = `${sanitizeForDb(title)}\n\nHandmade with luxury craftsmanship by Gift Studio PK.\n\n### Specifications & Highlights:\n- 100% custom personalized with your names, dates, or messages\n- High quality durable construction\n- Gift Studio luxury gift wrap included\n- Nationwide delivery across Pakistan & worldwide shipping available`;
  }

  return text;
}

// Download image locally
async function downloadImage(url, destPath) {
  try {
    const res = await fetch(url);
    if (!res.ok) return false;
    const buffer = await res.arrayBuffer();
    fs.writeFileSync(destPath, Buffer.from(buffer));
    return true;
  } catch (err) {
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Enhanced Gift Studio PK Catalog Import & Inventory Sync...');

  // 1. Authenticate with Medusa Admin API
  const authRes = await fetch('http://127.0.0.1:9000/auth/user/emailpass', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@giftstudio.com', password: 'admin123' })
  });
  const { token } = await authRes.json();
  if (!token) throw new Error('Failed to authenticate as Medusa Admin!');
  console.log('✅ Authenticated with Medusa v2 Admin API');

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  };

  // 2. Fetch all products from Gift Studio online catalog
  console.log('📦 Fetching complete product catalog from Gift Studio store...');
  const [p1, p2] = await Promise.all([
    fetch('https://giftstudio.shop/products.json?limit=250&page=1').then(r => r.json()),
    fetch('https://giftstudio.shop/products.json?limit=250&page=2').then(r => r.json())
  ]);
  const allShopifyProducts = [...(p1.products || []), ...(p2.products || [])];
  console.log(`✅ Fetched ${allShopifyProducts.length} total products from Gift Studio PK`);

  // Save complete JSON archive
  const jsonArchivePath = path.join(DATA_DIR, 'giftstudio_full_catalog.json');
  fs.writeFileSync(jsonArchivePath, JSON.stringify(allShopifyProducts, null, 2));
  console.log(`💾 Saved complete catalog JSON archive to: ${jsonArchivePath}`);

  // 3. Define and ensure categories in Medusa
  const categoryDefinitions = [
    { name: 'Customized Gift Boxes & Baskets', handle: 'gift-boxes-baskets', desc: 'Luxury gift boxes, gourmet chocolate hampers, baby baskets, and corporate hampers customized with ribbons and cards.' },
    { name: 'Nikah & Wedding Specials', handle: 'nikah-wedding-specials', desc: 'Elegant Nikah signature pens, customized ring trays, bridal entrance dupattas, Nikah booklet frames, and wedding keepsakes.' },
    { name: 'Photo Frames & LED Acrylic Lamps', handle: 'photo-frames-led-lamps', desc: 'Custom acrylic Spotify plaques, magic mirror LED photo frames, 3D warm night lamps, and anniversary frames.' },
    { name: 'Islamic Art & Car Accessories', handle: 'islamic-art-car-accessories', desc: 'Handmade resin Islamic car hangings with Arabic calligraphy, Ayatul Kursi ornaments, and Islamic wall decor.' },
    { name: 'Personalized Drinkware & Bottles', handle: 'personalized-drinkware', desc: 'Custom photo ceramic mugs, temperature display bottles, insulated tumblers, and couple mug sets.' },
    { name: 'Custom Apparel & Keepsakes', handle: 'custom-apparel-keepsakes', desc: 'Personalized hoodies, customized printed t-shirts, engraved cufflinks, keychains, and keepsake gift bags.' }
  ];

  const existingCatsRes = await fetch('http://127.0.0.1:9000/admin/product-categories?limit=100', { headers });
  const existingCatsData = await existingCatsRes.json();
  const categoryMap = {};

  for (const c of (existingCatsData.product_categories || [])) {
    categoryMap[c.name] = c.id;
  }

  for (const catDef of categoryDefinitions) {
    if (!categoryMap[catDef.name]) {
      const createCatRes = await fetch('http://127.0.0.1:9000/admin/product-categories', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: catDef.name,
          handle: catDef.handle,
          description: catDef.desc,
          is_active: true
        })
      });
      const resData = await createCatRes.json();
      if (resData.product_category) {
        categoryMap[catDef.name] = resData.product_category.id;
        console.log(`✨ Created Category: ${catDef.name} (${resData.product_category.id})`);
      }
    } else {
      console.log(`ℹ️ Category active: ${catDef.name} (${categoryMap[catDef.name]})`);
    }
  }

  // Fetch currently existing products in Medusa so we don't duplicate
  const existingProdsRes = await fetch('http://127.0.0.1:9000/admin/products?limit=200', { headers });
  const existingProdsData = await existingProdsRes.json();
  const existingTitles = new Set((existingProdsData.products || []).map(p => p.title.toLowerCase().trim()));
  console.log(`ℹ️ Current products in Medusa: ${existingTitles.size}`);

  // 4. Group products by category
  const categorized = {};
  for (const catDef of categoryDefinitions) {
    categorized[catDef.name] = [];
  }

  for (const p of allShopifyProducts) {
    const catName = categorizeProduct(p);
    categorized[catName].push(p);
  }

  // 5. Select 15-18 top products per category
  const toSeed = [];
  for (const [catName, prods] of Object.entries(categorized)) {
    prods.sort((a, b) => (b.images?.length || 0) - (a.images?.length || 0));
    const topForCat = prods.slice(0, 16);
    for (const p of topForCat) {
      toSeed.push({ ...p, _categoryName: catName });
    }
  }

  console.log(`\n📦 Checking and seeding ${toSeed.length} flagship Gift Studio products across all 6 categories into Medusa...`);

  const salesChannelId = 'sc_01M37HWZQQ814P3JBBAKE4D7T5';
  let successCount = 0;
  let downloadedImageCount = 0;
  let skuCounter = 500;

  for (let i = 0; i < toSeed.length; i++) {
    const p = toSeed[i];
    skuCounter++;
    const catId = categoryMap[p._categoryName];
    const cleanTitle = sanitizeForDb(p.title);

    // Skip if already in database
    if (existingTitles.has(cleanTitle.toLowerCase().trim())) {
      console.log(`[${i + 1}/${toSeed.length}] ⏭️ Product already exists: "${cleanTitle.slice(0, 40)}..."`);
      successCount++;
      continue;
    }

    // Download first image locally for offline backup and fast local serving
    if (p.images && p.images.length > 0 && downloadedImageCount < 60) {
      const firstImgUrl = p.images[0].src;
      const cleanSlug = (p.handle || `product-${p.id}`).replace(/[^a-zA-Z0-9_-]/g, '');
      const ext = path.extname(firstImgUrl.split('?')[0]) || '.webp';
      const localFileName = `${cleanSlug}${ext}`;
      const localFrontendPath = path.join(FRONTEND_MEDIA_DIR, localFileName);
      const localMediaPath = path.join(MEDIA_DIR, localFileName);
      
      downloadImage(firstImgUrl, localFrontendPath);
      downloadImage(firstImgUrl, localMediaPath);
      downloadedImageCount++;
    }

    // Build variants & options mathematically consistent
    const rawPrice = parseFloat(p.variants?.[0]?.price || '1500') || 1500;
    const usdPrice = Math.max(5, Math.round((rawPrice / 280) * 100) / 100);

    const rawVariants = (p.variants && p.variants.length > 0) ? p.variants : [{ title: 'Default Edition', price: rawPrice }];
    
    // Create clean variant titles
    const variantTitles = rawVariants.map((v, idx) => {
      const sanitized = sanitizeForDb(v.title || `Option ${idx + 1}`);
      return sanitized.length > 0 ? sanitized : `Option ${idx + 1}`;
    });
    // Unique option values
    const uniqueOptionValues = Array.from(new Set(variantTitles));

    const options = [
      {
        title: 'Option / Style',
        values: uniqueOptionValues
      }
    ];

    const variants = rawVariants.map((v, idx) => {
      const vPrice = parseFloat(v.price) || rawPrice;
      const vUsd = Math.max(5, Math.round((vPrice / 280) * 100) / 100);
      const optVal = variantTitles[idx];
      return {
        title: optVal,
        sku: `GS-${p.id.toString().slice(-4)}-${idx + 1}`,
        options: {
          'Option / Style': optVal
        },
        prices: [
          { currency_code: 'pkr', amount: vPrice },
          { currency_code: 'usd', amount: vUsd }
        ]
      };
    });

    // Format images
    const images = (p.images || []).slice(0, 5).map(img => ({ url: img.src }));
    const thumbnail = images[0]?.url || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800';

    // Unique handle
    const handle = `${(p.handle || cleanTitle.toLowerCase()).replace(/[^a-z0-9]+/g, '-').slice(0, 60)}-${p.id.toString().slice(-4)}`;

    const createPayload = {
      title: cleanTitle,
      subtitle: sanitizeForDb(`${p._categoryName} - Gift Studio PK`),
      description: cleanDescription(p.body_html, cleanTitle),
      handle,
      status: 'published',
      discountable: true,
      thumbnail,
      images,
      options,
      variants,
      sales_channels: [{ id: salesChannelId }],
      categories: catId ? [{ id: catId }] : []
    };

    try {
      const res = await fetch('http://127.0.0.1:9000/admin/products', {
        method: 'POST',
        headers,
        body: JSON.stringify(createPayload)
      });
      const data = await res.json();
      if (res.status === 200 && data.product) {
        successCount++;
        existingTitles.add(cleanTitle.toLowerCase().trim());
        console.log(`[${successCount}/${toSeed.length}] ✅ Added: "${cleanTitle.slice(0, 45)}..." in "${p._categoryName}" (PKR ${rawPrice})`);
      } else {
        console.warn(`[${i + 1}] ⚠️ Product creation notice for "${cleanTitle.slice(0, 35)}":`, data.message || data);
      }
    } catch (err) {
      console.error(`[${i + 1}] ❌ Network error for "${cleanTitle.slice(0, 35)}":`, err.message);
    }
  }

  // Count total products in Medusa now
  const finalProdsRes = await fetch('http://127.0.0.1:9000/admin/products?limit=200', { headers });
  const finalProdsData = await finalProdsRes.json();

  console.log(`\n🎉 INVENTORY SEEDING COMPLETE!`);
  console.log(`✅ Total products now in Medusa JS v2 backend: ${finalProdsData.count}`);
  console.log(`✅ Categories established: 6`);
  console.log(`✅ Local photo files saved to: ${FRONTEND_MEDIA_DIR}`);
  console.log(`✅ Full catalog archive saved to: ${jsonArchivePath}`);
  console.log(`\n👉 Medusa Admin: http://localhost:9000/app/products (admin@giftstudio.com / admin123)`);
}

main().catch(err => {
  console.error('Fatal error in catalog seeder:', err);
  process.exit(1);
});

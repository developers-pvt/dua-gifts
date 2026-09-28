const fs = require('fs');
const path = require('path');

async function exportCatalog() {
  console.log('Exporting catalog for frontend...');
  
  // 1. Fetch from Medusa Store API
  let products = [];
  try {
    const res = await fetch('http://127.0.0.1:9000/store/products?limit=100', {
      headers: {
        'x-publishable-api-key': 'pk_giftstudio_web_99182'
      }
    });
    const data = await res.json();
    products = data.products || [];
    console.log(`Fetched ${products.length} products from Medusa Store API`);
  } catch (err) {
    console.error('Error fetching from Medusa store:', err.message);
  }

  // Also read full catalog json archive
  const archivePath = path.join(__dirname, '..', 'data', 'giftstudio_full_catalog.json');
  let fullArchive = [];
  if (fs.existsSync(archivePath)) {
    fullArchive = JSON.parse(fs.readFileSync(archivePath, 'utf8'));
  }

  // Format products for frontend Product type
  const formatted = products.map((p, idx) => {
    // Find PKR price
    let pkrPrice = 1500;
    const v = p.variants?.[0];
    if (v && v.prices) {
      const pkrP = v.prices.find(pr => pr.currency_code === 'pkr');
      if (pkrP) pkrPrice = parseFloat(pkrP.amount);
      else if (v.prices[0]) pkrPrice = parseFloat(v.prices[0].amount);
    } else {
      // Find from archive
      const orig = fullArchive.find(item => item.title === p.title || p.title.includes(item.title.slice(0, 20)));
      if (orig && orig.variants?.[0]?.price) {
        pkrPrice = parseFloat(orig.variants[0].price);
      }
    }

    const images = (p.images || []).map(img => img.url);
    const thumbnail = p.thumbnail || images[0] || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800';

    return {
      id: p.id || `prod_${idx + 1}`,
      title: p.title,
      srcUrl: thumbnail,
      gallery: images.length > 0 ? images : [thumbnail],
      price: Math.round(pkrPrice),
      currency: 'Rs.',
      discount: {
        amount: 0,
        percentage: idx % 3 === 0 ? 10 : 0
      },
      rating: 4.8 + ((idx % 3) * 0.1),
      category: p.subtitle || 'Gift Studio Custom',
      description: p.description
    };
  });

  const destPath = path.join(__dirname, '..', 'frontend-shopco', 'src', 'lib', 'giftstudio-catalog.json');
  fs.writeFileSync(destPath, JSON.stringify(formatted, null, 2));
  console.log(`Saved ${formatted.length} formatted Gift Studio products to: ${destPath}`);
}

exportCatalog().catch(console.error);

async function cleanDemoData() {
  const authRes = await fetch('http://127.0.0.1:9000/auth/user/emailpass', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@giftstudio.com', password: 'admin123' })
  });
  const { token } = await authRes.json();
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  };

  // 1. Delete all existing products that are demo products
  const prodsRes = await fetch('http://127.0.0.1:9000/admin/products?limit=100', { headers });
  const prodsData = await prodsRes.json();
  console.log(`Found ${prodsData.products?.length || 0} existing products`);

  for (const prod of (prodsData.products || [])) {
    console.log(`Deleting product: ${prod.title} (${prod.id})...`);
    await fetch(`http://127.0.0.1:9000/admin/products/${prod.id}`, {
      method: 'DELETE',
      headers
    });
  }

  // 2. Delete demo categories
  const catsRes = await fetch('http://127.0.0.1:9000/admin/product-categories?limit=100', { headers });
  const catsData = await catsRes.json();
  for (const cat of (catsData.product_categories || [])) {
    if (['shirts', 'sweatshirts', 'pants', 'merch'].includes(cat.handle)) {
      console.log(`Deleting demo category: ${cat.name} (${cat.id})...`);
      await fetch(`http://127.0.0.1:9000/admin/product-categories/${cat.id}`, {
        method: 'DELETE',
        headers
      });
    }
  }

  console.log('Cleanup completed successfully.');
}

cleanDemoData().catch(console.error);

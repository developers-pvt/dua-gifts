async function testCreate() {
  const authRes = await fetch('http://127.0.0.1:9000/auth/user/emailpass', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@giftstudio.com', password: 'admin123' })
  });
  const { token } = await authRes.json();

  // Test payload for Medusa v2
  const payload = {
    title: "Test Gift Studio Frame",
    subtitle: "Custom Engraved Acrylic Frame",
    description: "Beautiful personalized photo frame handcrafted by Gift Studio PK.",
    status: "published",
    options: [
      {
        title: "Size",
        values: ["Standard 6x8", "Large 8x12"]
      }
    ],
    variants: [
      {
        title: "Standard 6x8",
        sku: "TEST-FRAME-STD",
        options: {
          "Size": "Standard 6x8"
        },
        prices: [
          {
            currency_code: "usd",
            amount: 25
          },
          {
            currency_code: "eur",
            amount: 23
          }
        ]
      },
      {
        title: "Large 8x12",
        sku: "TEST-FRAME-LRG",
        options: {
          "Size": "Large 8x12"
        },
        prices: [
          {
            currency_code: "usd",
            amount: 35
          },
          {
            currency_code: "eur",
            amount: 32
          }
        ]
      }
    ],
    sales_channels: [
      { id: "sc_01M37HWZQQ814P3JBBAKE4D7T5" }
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800" }
    ],
    thumbnail: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800"
  };

  const createRes = await fetch('http://127.0.0.1:9000/admin/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify(payload)
  });

  const resData = await createRes.json();
  console.log('Status:', createRes.status);
  console.log('Result:', JSON.stringify(resData, null, 2).slice(0, 1000));
}

testCreate().catch(console.error);

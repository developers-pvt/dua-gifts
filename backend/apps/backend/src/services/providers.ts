// Providers for External Marketplace Scraper / Integrator and AI Studio

export interface MarketplaceProductRef {
  externalProductReference: string;
  productName: string;
  price: number;
  currency: string;
  sourceUrl: string;
  marketplace: string;
  imageUrl: string;
  estimatedDays: number;
}

export class MarketplaceService {
  private static supportedDomains: Record<string, string> = {
    'amazon': 'Amazon',
    'zara': 'Zara',
    'sephora': 'Sephora',
    'etsy': 'Etsy',
    'apple': 'Apple Store',
    'nykaa': 'Nykaa Luxe',
    'nike': 'Nike',
  };

  public static parseProductUrl(urlStr: string): MarketplaceProductRef {
    try {
      const parsedUrl = new URL(urlStr);
      const host = parsedUrl.hostname.toLowerCase();
      let matchedBrand = 'External Partner Store';

      for (const [key, brand] of Object.entries(this.supportedDomains)) {
        if (host.includes(key)) {
          matchedBrand = brand;
          break;
        }
      }

      // Generate realistic product metadata from path/query
      const pathSegments = parsedUrl.pathname.split('/').filter(Boolean);
      const lastSegment = pathSegments[pathSegments.length - 1] || 'luxury-gift-item';
      const cleanName = lastSegment
        .replace(/\.(html|htm|php|aspx)$/, '')
        .replace(/[-_+]/g, ' ')
        .split(' ')
        .filter((w) => w.length > 1 && !w.startsWith('dp') && !w.startsWith('p0'))
        .slice(0, 5)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ') || 'Curated Artisan Product';

      // Estimate price and sample imagery based on brand
      let estimatedPrice = 2499;
      let sampleImage = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600';

      if (matchedBrand === 'Zara') {
        estimatedPrice = 3290;
        sampleImage = 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600';
      } else if (matchedBrand === 'Sephora') {
        estimatedPrice = 4500;
        sampleImage = 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600';
      } else if (matchedBrand === 'Apple Store') {
        estimatedPrice = 19900;
        sampleImage = 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600';
      } else if (matchedBrand === 'Amazon') {
        estimatedPrice = 1899;
        sampleImage = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600';
      }

      return {
        externalProductReference: `EXT-${Math.floor(100000 + Math.random() * 900000)}`,
        productName: `${matchedBrand} — ${cleanName}`,
        price: estimatedPrice,
        currency: 'INR',
        sourceUrl: urlStr,
        marketplace: matchedBrand,
        imageUrl: sampleImage,
        estimatedDays: 2,
      };
    } catch (e) {
      // Fallback for custom or direct text
      return {
        externalProductReference: `EXT-${Math.floor(100000 + Math.random() * 900000)}`,
        productName: 'Custom Procured Gift Item',
        price: 1999,
        currency: 'INR',
        sourceUrl: urlStr,
        marketplace: 'Shop Anywhere Hub',
        imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600',
        estimatedDays: 3,
      };
    }
  }
}

export class AIService {
  public static async generateGiftMessage(params: {
    recipientName: string;
    occasion: string;
    relationship: string;
    tone: 'Elegant' | 'Heartfelt' | 'Humorous' | 'Poetic';
  }): Promise<string> {
    const { recipientName, occasion, relationship, tone } = params;

    if (tone === 'Humorous') {
      return `Dear ${recipientName}, Happy ${occasion}! They say age is merely the number of years the world has been blessed with you... though you're definitely racking up those blessings! Hope you love this surprise hamper.`;
    }
    if (tone === 'Poetic') {
      return `Dearest ${recipientName}, On this beautiful ${occasion}, may every unopened moment bloom with magic and warmth. Handcrafted especially for you with infinite affection.`;
    }
    if (tone === 'Heartfelt') {
      return `Dearest ${recipientName}, Words cannot fully capture how much your presence means in my life. Wishing you a truly magnificent ${occasion}. Handpicked with all my love.`;
    }
    return `Dear ${recipientName}, Wishing you joyous celebrations on this special ${occasion}. May this curated gift bring delight and fond memories. With warmest regards.`;
  }

  public static async getGiftRecommendations(params: {
    occasion: string;
    budget: number;
    recipientType: string;
  }) {
    return [
      {
        title: 'The Royal Indulgence Hamper',
        matchReason: `Curated specifically for ${params.recipientType} celebrating ${params.occasion}`,
        estimatedPrice: Math.min(params.budget, 4500),
        items: [
          'Artisanal Madagascar Vanilla Chocolates',
          'Single-Origin Pour-over Coffee Beans',
          'Handmade Ceramic Tumbler',
          'Custom Velvet Keepsake Box',
        ],
      },
      {
        title: 'Luxe Relax & Rejuvenate Set',
        matchReason: 'A calming self-care blend with external beauty boutique treats',
        estimatedPrice: Math.min(params.budget, 6200),
        items: [
          'Sephora Rose Petal Bath Salts (Procured)',
          'Pure Soy Candle in Frosted Amber Glass',
          'Organic Silk Sleep Mask',
          'Artisanal Lavender Mist',
        ],
      },
    ];
  }

  public static async analyzeProductImage(imageName: string) {
    return {
      title: 'Heritage Brass Pour-Over Coffee Filter & Spoon',
      category: 'Artisanal Home & Kitchen',
      description: 'Hand-cast traditional brass coffee dripper with delicate geometric etching. Engineered for the ultimate slow-brew connoisseur.',
      seoTitle: 'Artisanal Brass Coffee Filter | Luxury Keepsake Gifts',
      seoDescription: 'Handcrafted luxury brass coffee filter set. Perfect for festive and housewarming gift hampers.',
      suggestedPrice: 2850,
      giftTags: ['Coffee Connoisseur', 'Handcrafted', 'Brass', 'Heritage'],
      suitabilityScore: 98,
    };
  }
}

interface ProductJsonLdProps {
  name: string;
  price: number;
  unit: string;
  description?: string;
  url: string;
}

export function ProductJsonLd({ name, price, unit, description, url }: ProductJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${name} (${unit})`,
    description: description || `${name} 농산물 시세 - 오늘 가격 ${price.toLocaleString()}원/${unit}`,
    url,
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'KRW',
      lowPrice: Math.round(price * 0.82),
      highPrice: Math.round(price * 1.05),
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface WebPageJsonLdProps {
  name: string;
  description: string;
  url: string;
}

export function WebPageJsonLd({ name, description, url }: WebPageJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    description,
    url,
    inLanguage: 'ko',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

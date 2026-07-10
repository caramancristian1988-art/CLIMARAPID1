import JsonLd from "./JsonLd";

const BASE = "https://www.climatrapid.md";

export default function ServicePageJsonLd({
  name,
  description,
  slug,
  phone,
}: {
  name: string;
  description: string;
  slug: string;
  phone: string;
}) {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Acasă", "item": BASE },
            { "@type": "ListItem", "position": 2, "name": "Servicii", "item": `${BASE}/servicii` },
            { "@type": "ListItem", "position": 3, "name": name, "item": `${BASE}/${slug}` },
          ],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          "name": name,
          "description": description,
          "url": `${BASE}/${slug}`,
          "provider": {
            "@type": "LocalBusiness",
            "@id": `${BASE}/#business`,
            "name": "Climat Rapid",
            "telephone": phone,
          },
          "areaServed": { "@type": "Country", "name": "Moldova" },
          "serviceType": "HVAC Service",
        }}
      />
    </>
  );
}

import "./globals.css";

export const metadata = {
  title: "Free DMARC, SPF & DKIM Checker — InboxGuard",
  description:
    "Check your domain's email authentication in seconds. Free DMARC checker, SPF record validator, and DKIM lookup with plain-English fixes. Meet Gmail and Yahoo sender requirements.",
  keywords: [
    "dmarc checker", "spf checker", "dkim checker", "email authentication",
    "dmarc record", "spf record lookup", "why are my emails going to spam",
  ],
  openGraph: {
    title: "Free DMARC, SPF & DKIM Checker — InboxGuard",
    description: "Check your domain's email authentication in seconds, with plain-English fixes.",
    type: "website",
  },
};

const appJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "InboxGuard",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description: "Free DMARC, SPF and DKIM checker and DMARC report monitoring dashboard with sender identification, spoofing detection and alerts.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is DMARC?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "DMARC (Domain-based Message Authentication, Reporting & Conformance) is a DNS record that tells email receivers how to handle messages that fail SPF and DKIM authentication, and where to send reports about your domain's email activity. Gmail, Yahoo and Microsoft now require it for bulk senders.",
      },
    },
    {
      "@type": "Question",
      name: "Why are my emails going to spam?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "One of the most common causes is missing or broken email authentication. If your domain lacks valid SPF, DKIM, and DMARC records, Gmail and Yahoo may reject your mail or route it to spam. Run a free check to see exactly what is missing and how to fix it.",
      },
    },
    {
      "@type": "Question",
      name: "Is this checker free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The DMARC, SPF and DKIM checker is completely free with no signup required.",
      },
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,500;0,600;1,500&family=Public+Sans:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}

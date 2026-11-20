// Business facts and the numbers behind the page. Edit these, then rebuild.

export interface SiteConfig {
  /** Production address, used for canonical and language links. */
  url: string;
  phones: { display: string; tel: string }[];
  email: string;
  website: { display: string; href: string };
  address: string;
  mapsUrl: string;
  subsidyPortal: { display: string; href: string };
  copyrightYear: number;
  /**
   * "Our work so far". Leave a figure as null until you have the real one: the page then shows
   * the design's sample figure and labels the numbers as samples while any figure is unset.
   */
  stats: {
    panelsInstalled: number | null;
    rooftops: number | null;
    capacityKw: number | null;
    subsidySecuredLakh: number | null;
    cities: number | null;
    statesServed: number | null;
  };
  /** Price per kW for society and business systems (homes use the price list in src/lib/calc/data.ts). */
  prices: {
    societyPricePerKw: number;
    businessPricePerKw: number;
  };
}

export const site: SiteConfig = {
  url: "https://www.solarneev.com",
  phones: [
    { display: "+91 99973 79346", tel: "+919997379346" },
    { display: "+91 99976 07347", tel: "+919997607347" },
  ],
  email: "solarneev.25@gmail.com",
  website: { display: "www.solarneev.com", href: "https://www.solarneev.com" },
  address: "K-54, First Floor, Dev Complex, near Palhera Park, Pallav Puram Phase-2, Meerut, Uttar Pradesh 250110",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Dev+Complex+Pallav+Puram+Phase+2+Meerut+250110",
  subsidyPortal: { display: "pmsuryaghar.gov.in", href: "https://pmsuryaghar.gov.in" },
  copyrightYear: 2026,
  stats: {
    panelsInstalled: null, // e.g. 1000
    rooftops: null, // e.g. 150
    capacityKw: null, // e.g. 550 (shown as MW from 1,000 kW)
    subsidySecuredLakh: null, // e.g. 100 (shown as crore from 100 lakh)
    cities: null, // e.g. 12
    statesServed: null, // e.g. 3
  },
  prices: {
    societyPricePerKw: 48000,
    businessPricePerKw: 40000,
  },
};

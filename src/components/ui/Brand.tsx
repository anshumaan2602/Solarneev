import logo from "@/assets/logo.png";
import s from "./Brand.module.css";

const RAYS = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];

/** The sun that stands in for the O in the SOLARNEEV wordmark. */
function Sun() {
  return (
    <svg viewBox="0 0 40 40" width="0.92em" height="0.92em" aria-hidden="true" className={s.sun}>
      <g fill="#FC8C0A">
        {RAYS.map((deg) => (
          <path key={deg} d="M20 0.6l2.7 7.1h-5.4z" transform={deg ? `rotate(${deg} 20 20)` : undefined} />
        ))}
      </g>
      <circle cx="20" cy="20" r="10.4" fill="#FFD43B" stroke="#FC8C0A" strokeWidth="1.6" />
    </svg>
  );
}

/** Logo and wordmark, linking to the top of the page. The footer shows it slightly larger. */
export function Brand({ size = "nav" }: { size?: "nav" | "footer" }) {
  const footer = size === "footer";
  return (
    <a href="#top" aria-label="SOLARNEEV, Sustainable Foundations" className={`${s.brand} ${footer ? s.footer : s.nav}`}>
      {/* A plain <img>: the site is a static export, so next/image's optimiser is not available. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={logo.src} alt="" width={footer ? 60 : 52} height={footer ? 53 : 46} className={s.logo} />
      <span aria-hidden="true" className={s.text}>
        <span className={s.wordmark}>
          S<Sun />
          LAR<span className={s.neev}>NEEV</span>
        </span>
        <span className={s.tagline}>SUSTAINABLE FOUNDATIONS</span>
      </span>
    </a>
  );
}

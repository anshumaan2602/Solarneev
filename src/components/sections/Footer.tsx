import { site } from "@/config/site";
import { useLang } from "../providers/LangProvider";
import { Brand } from "../ui/Brand";
import s from "./Footer.module.css";

export function Footer() {
  const { c } = useLang();
  return (
    <footer className={s.footer}>
      <div className={s.inner}>
        <div className={s.top}>
          <Brand size="footer" />
          <p className={s.contacts}>
            {site.phones.map((p) => (
              <a key={p.tel} href={`tel:${p.tel}`} className={s.phone}>{p.display}</a>
            ))}
            <a href={`mailto:${site.email}`} className={s.link}>{site.email}</a>
          </p>
        </div>
        <p className={s.line}>{site.address}</p>
        {/* Each line's text is built as one string: split text nodes shape very slightly differently. */}
        <p className={s.sources}>
          {c.footer.text + " "}
          <a href={site.subsidyPortal.href} className={s.link}>{site.subsidyPortal.display}</a>
        </p>
        <p className={s.line}>
          {`© ${site.copyrightYear} SOLARNEEV · `}
          <a href={site.website.href} className={s.link}>{site.website.display}</a>
        </p>
      </div>
    </footer>
  );
}

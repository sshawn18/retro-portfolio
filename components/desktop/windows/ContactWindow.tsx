import { site } from "@/content/site";

export function ContactWindow() {
  return (
    <div className="text-[12px] leading-[1.55]">
      <fieldset>
        <legend>Send mail</legend>
        <div className="field-row-stacked" style={{ width: "100%" }}>
          <label htmlFor="to">To:</label>
          <input id="to" type="text" readOnly value={site.email} />
        </div>
        <div className="field-row-stacked mt-2" style={{ width: "100%" }}>
          <label htmlFor="subject">Subject:</label>
          <input id="subject" type="text" defaultValue="Hello from your website" />
        </div>
        <div className="field-row-stacked mt-2" style={{ width: "100%" }}>
          <label htmlFor="body">Message:</label>
          <textarea
            id="body"
            rows={5}
            defaultValue={`Hi ${site.name},\n\n`}
          />
        </div>
        <div className="field-row justify-end mt-2">
          <a
            href={`mailto:${site.email}?subject=${encodeURIComponent(
              "Hello from your website"
            )}`}
          >
            <button className="default">Send</button>
          </a>
          <button type="button" disabled>
            Attach…
          </button>
        </div>
      </fieldset>

      <fieldset className="mt-3">
        <legend>Address book</legend>
        <ul className="tree-view">
          {site.socials.map((s) => (
            <li key={s.label}>
              <a href={s.href} target="_blank" rel="noreferrer">
                {s.label} — <b>{s.handle}</b>
              </a>
            </li>
          ))}
        </ul>
      </fieldset>
    </div>
  );
}

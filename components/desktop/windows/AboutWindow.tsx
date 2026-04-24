import { site } from "@/content/site";

export function AboutWindow() {
  return (
    <div className="text-[12px] leading-[1.55]">
      <fieldset>
        <legend>{site.name}</legend>
        <div className="flex items-start gap-3">
          <div aria-hidden className="text-4xl leading-none select-none">
            📄
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold">{site.tagline}</p>
            <p className="text-[11px] opacity-80 mt-0.5">{site.role}</p>
          </div>
        </div>
      </fieldset>

      <div className="mt-3 space-y-2.5">
        {site.bio.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <div className="status-bar mt-3">
        <p className="status-bar-field">File: README.TXT</p>
        <p className="status-bar-field">{site.bio.join(" ").length} chars</p>
        <p className="status-bar-field">UTF-8</p>
      </div>
    </div>
  );
}

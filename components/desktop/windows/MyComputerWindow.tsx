import { site } from "@/content/site";

export function MyComputerWindow() {
  const rows: [string, string][] = [
    ["User", site.name],
    ["Handle", `~/${site.handle}`],
    ["Role", site.role],
    ["Email", site.email],
    ["Runtime", "Next.js · React · TypeScript"],
    ["Theme", "Windows 98 (98.css)"],
    ["Uptime", typeof window !== "undefined" ? "this session" : "—"],
  ];

  return (
    <div className="text-[12px] leading-[1.55]">
      <fieldset>
        <legend>System Properties</legend>
        <div className="flex items-start gap-3">
          <div aria-hidden className="text-4xl leading-none">
            🖥️
          </div>
          <div className="flex-1">
            <p className="font-bold">Microsoft Portfolio 98</p>
            <p className="text-[11px] opacity-80">Second Edition</p>
            <p className="text-[11px] opacity-80">
              Registered to: <b>{site.name}</b>
            </p>
          </div>
        </div>
      </fieldset>

      <fieldset className="mt-3">
        <legend>Drives</legend>
        <ul className="tree-view">
          <li>
            <details open>
              <summary>🖴 Local Disk (C:)</summary>
              <ul>
                <li>📁 Projects [empty — module pending]</li>
                <li>📁 Blog [empty — module pending]</li>
                <li>📄 About.txt</li>
                <li>📄 README.md</li>
              </ul>
            </details>
          </li>
          <li>
            <details>
              <summary>💾 Floppy (A:)</summary>
              <ul>
                <li>📄 resume.doc</li>
                <li>📄 notes.txt</li>
              </ul>
            </details>
          </li>
        </ul>
      </fieldset>

      <fieldset className="mt-3">
        <legend>Info</legend>
        <table className="w-full text-[11px]">
          <tbody>
            {rows.map(([k, v]) => (
              <tr key={k}>
                <td className="pr-4 align-top opacity-70 w-[72px]">{k}</td>
                <td className="align-top">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </fieldset>

      <div className="status-bar mt-3">
        <p className="status-bar-field">C:\&gt; System ready</p>
      </div>
    </div>
  );
}

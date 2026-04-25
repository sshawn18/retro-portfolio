import { site } from "@/content/site";

const links: { icon: string; label: string; sub: string; href: string }[] = [
  {
    icon: "📧",
    label: "Email",
    sub: site.email,
    href: `mailto:${site.email}`,
  },
  {
    icon: "💼",
    label: "LinkedIn",
    sub: site.linkedin.replace("https://", ""),
    href: site.linkedin,
  },
  {
    icon: "🐙",
    label: "GitHub",
    sub: "github.com/sshawn18",
    href: "https://github.com/sshawn18",
  },
];

export function ContactWindow() {
  return (
    <div className="text-[12px] leading-[1.55]">
      <fieldset>
        <legend>Contact Ravi</legend>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "4px 0" }}>
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target={l.href.startsWith("mailto") ? undefined : "_blank"}
              rel="noreferrer"
              style={{ textDecoration: "none", display: "block" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "8px 10px",
                  border: "1px solid",
                  borderColor: "#fff #808080 #808080 #fff",
                  background: "#e4e0d8",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = "#000080";
                  (e.currentTarget as HTMLDivElement).style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = "#e4e0d8";
                  (e.currentTarget as HTMLDivElement).style.color = "";
                }}
              >
                <span style={{ fontSize: 22, lineHeight: 1, flexShrink: 0 }}>{l.icon}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 12 }}>{l.label}</div>
                  <div style={{ fontSize: 11, opacity: 0.75, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {l.sub}
                  </div>
                </div>
                <span style={{ marginLeft: "auto", fontSize: 10, opacity: 0.5, flexShrink: 0 }}>→</span>
              </div>
            </a>
          ))}
        </div>
      </fieldset>
    </div>
  );
}

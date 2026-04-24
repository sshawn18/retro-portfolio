type SoonWindowProps = {
  moduleName: string;
  description: string;
  glyph: string;
};

export function SoonWindow({ moduleName, description, glyph }: SoonWindowProps) {
  return (
    <div className="text-[12px] leading-[1.55]">
      <div className="flex items-start gap-3">
        <div aria-hidden className="text-4xl leading-none select-none">
          ⚠️
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold mb-1">{moduleName} is not installed yet.</p>
          <p>{description}</p>
        </div>
      </div>

      <fieldset className="mt-3">
        <legend>Installer status</legend>
        <div className="flex items-center gap-2">
          <span aria-hidden className="text-2xl">{glyph}</span>
          <div className="flex-1">
            <div className="text-[11px] mb-1">
              Waiting for manual installation…
            </div>
            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={33}
              className="w-full h-[14px]"
              style={{
                border: "1px solid",
                borderColor: "#808080 #fff #fff #808080",
                background: "#c0c0c0",
                padding: "2px",
              }}
            >
              <div
                style={{
                  width: "33%",
                  height: "100%",
                  background:
                    "repeating-linear-gradient(to right, #000080 0 6px, #c0c0c0 6px 8px)",
                }}
              />
            </div>
            <div className="text-[11px] mt-1 opacity-70">
              33% — pending user confirmation.
            </div>
          </div>
        </div>
      </fieldset>

      <div className="status-bar mt-3">
        <p className="status-bar-field">Setup not started</p>
        <p className="status-bar-field">See README.TXT for details</p>
      </div>
    </div>
  );
}

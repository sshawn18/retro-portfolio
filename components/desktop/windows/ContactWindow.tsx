"use client";

import { useState } from "react";
import { site } from "@/content/site";

type Status = "idle" | "sending" | "sent" | "error";

export function ContactWindow() {
  const [name, setName]         = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [subject, setSubject]   = useState("");
  const [message, setMessage]   = useState("");
  const [status, setStatus]     = useState<Status>("idle");
  const [errMsg, setErrMsg]     = useState("");

  const reset = () => {
    setName(""); setFromEmail(""); setSubject(""); setMessage("");
    setStatus("idle"); setErrMsg("");
  };

  const send = async () => {
    if (!name.trim() || !fromEmail.trim() || !message.trim()) {
      setErrMsg("Name, your email and message are required.");
      setStatus("error");
      return;
    }
    setStatus("sending");
    setErrMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, fromEmail, subject, message }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setErrMsg(json.error ?? "Something went wrong. Try again.");
        setStatus("error");
      } else {
        setStatus("sent");
      }
    } catch {
      setErrMsg("Network error. Check your connection and try again.");
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div className="text-[12px] leading-[1.55]">
        <div
          style={{
            border: "1px solid",
            borderColor: "#808080 #fff #fff #808080",
            background: "#fff",
            padding: "20px 16px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 28, marginBottom: 8 }}>✉️</div>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Message sent!</div>
          <div style={{ opacity: 0.7, marginBottom: 16 }}>
            Ravi will reply to <b>{fromEmail}</b> soon.
          </div>
          <button type="button" onClick={reset}>
            Send another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-[12px] leading-[1.55]">
      <fieldset>
        <legend>New message</legend>

        {/* To (read-only — always going to Ravi) */}
        <div className="field-row-stacked" style={{ width: "100%" }}>
          <label htmlFor="ct-to">To:</label>
          <input id="ct-to" type="text" readOnly value={site.email} />
        </div>

        {/* Sender name */}
        <div className="field-row-stacked mt-2" style={{ width: "100%" }}>
          <label htmlFor="ct-name">Your name: <span style={{ color: "#c00" }}>*</span></label>
          <input
            id="ct-name"
            type="text"
            placeholder="e.g. Tanaka Yuki"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={status === "sending"}
          />
        </div>

        {/* Sender email */}
        <div className="field-row-stacked mt-2" style={{ width: "100%" }}>
          <label htmlFor="ct-email">Your email: <span style={{ color: "#c00" }}>*</span></label>
          <input
            id="ct-email"
            type="email"
            placeholder="you@example.com"
            value={fromEmail}
            onChange={(e) => setFromEmail(e.target.value)}
            disabled={status === "sending"}
          />
        </div>

        {/* Subject */}
        <div className="field-row-stacked mt-2" style={{ width: "100%" }}>
          <label htmlFor="ct-subject">Subject:</label>
          <input
            id="ct-subject"
            type="text"
            placeholder="Hello!"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={status === "sending"}
          />
        </div>

        {/* Message */}
        <div className="field-row-stacked mt-2" style={{ width: "100%" }}>
          <label htmlFor="ct-body">Message: <span style={{ color: "#c00" }}>*</span></label>
          <textarea
            id="ct-body"
            rows={5}
            placeholder={`Hi Ravi,\n\n`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={status === "sending"}
            style={{ resize: "vertical" }}
          />
        </div>

        {/* Error message */}
        {status === "error" && (
          <div
            style={{
              marginTop: 6,
              padding: "4px 8px",
              background: "#fff0f0",
              border: "1px solid #c00",
              color: "#c00",
              fontSize: 11,
            }}
          >
            ⚠ {errMsg}
          </div>
        )}

        {/* Buttons */}
        <div className="field-row justify-end mt-2" style={{ gap: 6 }}>
          <button
            type="button"
            className="default"
            onClick={send}
            disabled={status === "sending"}
          >
            {status === "sending" ? "Sending…" : "Send"}
          </button>
          <button
            type="button"
            onClick={reset}
            disabled={status === "sending"}
          >
            Clear
          </button>
        </div>
      </fieldset>

      {/* Address book */}
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

export function RecycleWindow() {
  return (
    <div className="text-[12px] leading-[1.55]">
      <fieldset>
        <legend>Recycle Bin</legend>
        <p className="mt-1 mb-2">The Recycle Bin is empty.</p>
        <ul className="tree-view" aria-label="Recycle Bin contents">
          <li className="opacity-60 italic">(no items)</li>
        </ul>
        <div className="field-row justify-end mt-2">
          <button disabled>Restore</button>
          <button disabled>Empty Bin</button>
        </div>
      </fieldset>
      <div className="status-bar mt-3">
        <p className="status-bar-field">0 object(s)</p>
        <p className="status-bar-field">0 bytes</p>
      </div>
    </div>
  );
}

/**
 * Replace each printable character in `text` with a random
 * extended-Latin / accented character, à la Shift-JIS → Latin-1
 * mis-decoding (what the film calls "mojibake").
 * Whitespace and punctuation are preserved to keep line rhythm.
 */
const MOJIBAKE_POOL =
  "ÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞß" +
  "àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ" +
  "¡¢£¤¥¦§¨©ª«¬®¯°±²³´µ¶·¸¹º»¼½¾¿×÷" +
  "ĀāĂăĄąĆćĈĉĊċČčĎďĐđĒēĔĕĖėĘęĚěĜĝĞğ" +
  "ĠġĢģĤĥĦħĨĩĪīĬĭĮįİıĲĳĴĵĶķĸĹĺĻļĽľŁłŃńŅņŇň";

const PRESERVE = /[\s\d]/;

export function mojibake(text: string): string {
  const pool = MOJIBAKE_POOL;
  let out = "";
  for (const ch of text) {
    if (PRESERVE.test(ch)) {
      out += ch;
      continue;
    }
    out += pool[Math.floor(Math.random() * pool.length)];
  }
  return out;
}

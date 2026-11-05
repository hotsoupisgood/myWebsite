"""Words near a word, for the Bay Area Transit Analysis post (visualizations/bay-area-transit-analysis.md).
Reads only the project's PUBLISHED, redacted transcript export (~/ytpt/docs/data), read-only, with the same word
filters as build_bay_pairs.py. For each word said at least NEAR_MIN times: its total, and the words said within
NEAR words of it on either side (a word counts once per mention). A redaction placeholder ("[name]") ends the
window, as it breaks a pair in build_bay_pairs.py. Only counts leave this script.
Run: ~/ytpt/.venv/bin/python -I scripts/build_bay_near.py"""
import collections, json, re, sys
from pathlib import Path

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_bay_pairs as P  # noqa: E402  (same source, tokeniser and word filters)

OUT = P.OUT.with_name("bay_area_near.json")
NEAR, NEAR_MIN, N_TOP = 5, 30, 12
PRESETS = ["housing", "transit", "density", "parking", "affordable", "traffic", "bike", "apartments", "bus", "neighborhood"]


def ok(w):
    return (w not in P.STOP and len(w) > 2 and w not in P.PROC and w not in P.PLACE and w not in P.WDROP
            and w not in P.GIVEN and w not in P.NAME_DROP)


def main():
    # Proper nouns are left out: any word written with a capital letter in at least 50 of every 100 uses that are
    # not at the start of a sentence. That drops names the redaction may have missed, as well as places and months.
    caps, uses = collections.Counter(), collections.Counter()
    parts, total = [], 0
    for f in sorted((P.SRC / "episodes").glob("*.json")):
        for ep in json.loads(f.read_text())["episodes"].values():
            for t in ep["turns"]:
                raw = t.get("text") or ""
                for m in re.finditer(r"(?<![.!?]\s)(?<!^)\b([A-Za-z]+)\b", raw):
                    w = m.group(1).lower(); uses[w] += 1
                    if m.group(1)[0].isupper():
                        caps[w] += 1
                txt = P.REPEATED.sub(" | ", re.sub(r"\[[^\]]*\]", " | ", raw).lower())
                for part in txt.split("|"):
                    tk = [w[:-2] if w.endswith("'s") else w for w in P.TOK.findall(part)]
                    total += len(tk)
                    parts.append(tk)
    proper = {w for w, n in uses.items() if n and caps[w] / n >= 0.5 and w not in P.WLABEL}
    keep = lambda w: ok(w) and w not in proper
    allc = collections.Counter(w for tk in parts for w in tk if keep(w))
    keys = {w for w, n in allc.items() if n >= NEAR_MIN}
    nb = {w: collections.Counter() for w in keys}
    for tk in parts:
        for i, w in enumerate(tk):
            if w in keys:
                nb[w].update({x for x in tk[max(0, i - NEAR):i + NEAR + 1] if x != w and keep(x)})
    out = {"min": NEAR_MIN, "window": NEAR, "tokens": total, "presets": [w for w in PRESETS if w in keys],
           "labels": {w: P.WLABEL[w] for w in P.WLABEL if w in keys},
           "words": {w: [allc[w], [[x, k] for x, k in nb[w].most_common(N_TOP)]] for w in sorted(keys)}}
    OUT.write_text(json.dumps(out, separators=(",", ":")))
    print(len(keys), "words;", total, "tokens;", len(proper), "proper nouns left out")
    for w in out["presets"][:4]:
        print(w, out["words"][w][0], out["words"][w][1][:6])


if __name__ == "__main__":
    main()

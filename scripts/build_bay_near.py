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
NEAR, NEAR_MIN, N_TOP = 50, 30, 12
# Emotional words (2026-11-05): VADER's word list (https://github.com/cjhutto/vaderSentiment), which scores each
# word from negative to positive. Left out: words that are planning terms in these meetings ("low income",
# "density bonus", "traffic calming", "fair housing") or polite filler ("great, thank you").
VADER = Path.home() / "ytpt" / ".venv" / "lib" / "python3.13" / "site-packages" / "vaderSentiment" / "vader_lexicon.txt"
NOT_EMOTION = set(("low lower lowest bonus calming authority fair demand shared share kind sure increase increased "
                   "increases allow allowed important significant create created opportunity opportunities supportive "
                   "dwelling reach pay paid cut cuts stops protected like yes please thank thanks okay well good great "
                   "want care help support free credit interest active clear clearly major matter bonuses missing certain "
                   "certainty approved approve approval agreement freeway grant grants").split())
PRESETS = ["housing", "transit", "density", "parking", "affordable", "traffic", "bike", "apartments", "bus", "neighborhood"]


def ok(w):
    return (w not in P.STOP and len(w) > 2 and w not in P.PROC and w not in P.PLACE and w not in P.WDROP
            and w not in P.GIVEN and w not in P.NAME_DROP)


def emotion():
    out = {}
    for line in open(VADER, encoding="utf-8"):
        w, score, *_ = line.split("\t")
        if re.fullmatch(r"[a-z]+", w) and w not in NOT_EMOTION:
            out[w] = float(score)
    return out


def main():
    EMO = emotion()
    # Proper nouns are left out: any word written with a capital letter in at least 50 of every 100 uses that are
    # not at the start of a sentence. That drops names the redaction may have missed, as well as places and months.
    caps, uses = collections.Counter(), collections.Counter()
    parts, total = [], 0
    for f in sorted((P.SRC / "episodes").glob("*.json")):
        for ep in json.loads(f.read_text())["episodes"].values():
            for t in ep["turns"]:
                raw = t.get("text") or ""
                # all-lowercase transcripts (some captions and local speech recognition) carry no case signal,
                # so they would make a name look like an ordinary word; only text that uses capitals is counted
                cased = re.search(r"[a-z][^.!?]*\b[A-Z]", raw) is not None
                for m in (re.finditer(r"(?<![.!?]\s)\b([A-Za-z]+)\b", raw) if cased else ()):
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
    nbe = {w: collections.Counter() for w in keys}
    tone = {w: [0.0, 0] for w in keys}   # sum and count of VADER scores of emotional words near each mention
    for tk in parts:
        for i, w in enumerate(tk):
            if w in keys:
                near = {x for x in tk[max(0, i - NEAR):i + NEAR + 1] if x != w and keep(x)}
                nb[w].update(near)
                emo = [x for x in near if x in EMO]
                nbe[w].update(emo)
                tone[w][0] += sum(EMO[x] for x in emo); tone[w][1] += len(emo)
    allemo = [EMO[x] for tk in parts for x in tk if x in EMO and keep(x)]
    out = {"tone_all": round(sum(allemo) / len(allemo), 2), "min": NEAR_MIN, "window": NEAR, "tokens": total, "presets": [w for w in PRESETS if w in keys],
           "labels": {w: P.WLABEL[w] for w in P.WLABEL if w in keys},
           "words": {w: [allc[w], [[x, k] for x, k in nb[w].most_common(N_TOP)],
                         [[x, k, 1 if EMO[x] > 0 else -1] for x, k in nbe[w].most_common(N_TOP)],
                         round(tone[w][0] / tone[w][1], 2) if tone[w][1] else None] for w in sorted(keys)}}
    OUT.write_text(json.dumps(out, separators=(",", ":")))
    print(len(keys), "words;", total, "tokens;", len(proper), "proper nouns left out")
    for w in out["presets"][:4]:
        print(w, out["words"][w][0], out["words"][w][1][:6])


if __name__ == "__main__":
    main()

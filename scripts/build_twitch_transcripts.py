"""Aggregate the HasanAbi Twitch transcripts in ~/hasan-stream into one small JSON for
visualizations/twitch-transcripts.md. Reads ~/hasan-stream read-only (no bytecode written).
Run: ~/ytpt/.venv/bin/python -I scripts/build_twitch_transcripts.py
Only counts and rates leave this script: no transcript text, no titles, no speaker labels."""
import collections, json, re, sys
from datetime import datetime, timedelta
from pathlib import Path

sys.dont_write_bytecode = True
SRC = Path.home() / "hasan-stream"
sys.path.insert(0, str(SRC))
from plots_stop import STOP  # noqa: E402  (same stopwords as the hasan-stream plots)

OUT = Path(__file__).resolve().parent.parent / "visualizations" / "data" / "twitch_transcripts.json"
TOK = re.compile(r"[a-z]+(?:'[a-z]+)?")   # same tokeniser as hasan-stream plots_pairs.py
N_TOP = 12
# Left out of the top-word list: spoken filler the shared stopwords miss, first names whose
# surname is already counted (haley, abdul, mike), and the streamer's own names (piker, hassan).
EXTRA_STOP = set("people thank wait anti let crazy great understand years live haley abdul mike piker hassan".split())
LABEL = {"sayed": "El-Sayed", "israel": "Israel", "stevens": "Stevens", "democrats": "Democrats",
         "trump": "Trump", "democratic": "Democratic", "rogers": "Rogers", "michigan": "Michigan"}

# Topic word groups. A topic count is the number of tokens in the group.
TOPICS = {
    "elections": ("Elections", "Election words", "election elections midterm midterms vote votes voting voter voters ballot ballots poll polls polling"),
    "israel": ("Israel and Gaza", "Israel and Gaza words", "israel israeli israelis gaza palestine palestinian palestinians netanyahu zionist zionists zionism"),
    "trump": ("Trump", "The name Trump", "trump"),
    "parties": ("Parties", "Party words", "democrat democrats democratic dems republican republicans gop maga"),
    "iran": ("Iran", "Iran words", "iran iranian"),
}


def local_date(iso):
    """Stream start in Pacific time, as hasan-stream plots_pairs.local_date."""
    start = datetime.fromisoformat(iso)
    off = 8 if start >= datetime.fromisoformat("2026-11-01T10:00:00+00:00") else 7
    return start - timedelta(hours=off)


def main():
    vods = []
    for d in sorted((SRC / "vods").iterdir()):
        if (d / "transcript.jsonl").exists() and (d / "vod.json").exists():
            meta = json.loads((d / "vod.json").read_text())
            vods.append((meta["date"], d, meta))
    vods.sort(key=lambda x: x[0])

    streams, all_tok = [], collections.Counter()
    per = []
    for iso, d, meta in vods:
        rows = [json.loads(l) for l in open(d / "transcript.jsonl", encoding="utf-8") if l.strip()]
        speech = sum(r["end"] - r["start"] for r in rows)
        words = sum(len(r["text"].split()) for r in rows)        # as build_outputs.py
        # possessive 's folds into its word ("israel's" counts as "israel")
        toks = [w[:-2] if w.endswith("'s") else w for r in rows for w in TOK.findall(r["text"].lower())]
        c = collections.Counter(toks)
        content = collections.Counter({w: n for w, n in c.items()
                                       if w not in STOP and w not in EXTRA_STOP and len(w) > 2})
        all_tok += content
        dt = local_date(iso)
        streams.append({"date": dt.strftime("%Y-%m-%d"), "label": dt.strftime("%a %b %-d"),
                        "stream_h": round(float(meta["duration_s"]) / 3600, 2),
                        "speech_h": round(speech / 3600, 2), "stream_s": round(float(meta["duration_s"])),
                        "speech_s": round(speech), "words": words, "tokens": len(toks)})
        per.append((c, len(toks)))

    top = [w for w, _ in all_tok.most_common(N_TOP)]
    for s, (c, n) in zip(streams, per):
        s["top"] = {w: round(c[w] / n * 1e4, 1) for w in top}
        s["top_n"] = {w: c[w] for w in top}
        s["topics"] = {k: round(sum(c[w] for w in ws.split()) / n * 1e4, 1) for k, (_, _n, ws) in TOPICS.items()}
        s["topics_n"] = {k: sum(c[w] for w in ws.split()) for k, (_, _n, ws) in TOPICS.items()}

    out = {"built": datetime.now().strftime("%Y-%m-%d"),
           "totals": {"streams": len(streams), "stream_h": round(sum(s["stream_s"] for s in streams) / 3600, 1),
                      "speech_h": round(sum(s["speech_s"] for s in streams) / 3600, 1),
                      "words": sum(s["words"] for s in streams)},
           "top_words": [{"key": w, "label": LABEL.get(w, w), "n": all_tok[w]} for w in top],
           "topics": [{"key": k, "label": lab, "noun": noun, "words": ws.split()}
                      for k, (lab, noun, ws) in TOPICS.items()],
           "streams": streams}
    OUT.write_text(json.dumps(out, separators=(",", ":")))
    print(json.dumps(out["totals"]), top)
    for s in streams:
        print(s["label"], s["stream_h"], s["speech_h"], s["words"], s["topics"])


if __name__ == "__main__":
    main()

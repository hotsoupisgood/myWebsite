"""Word-pair counts by month for the Bay Area Transit Analysis post (visualizations/bay-area-transit-analysis.md).
Reads only the project's PUBLISHED, redacted transcript export (~/ytpt/docs/data), read-only.
Run: ~/ytpt/.venv/bin/python -I scripts/build_bay_pairs.py
Only pair counts and rates leave this script. Redaction placeholders ("[name]" etc.) break a pair."""
import collections, json, re, sys
from datetime import datetime
from pathlib import Path

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path.home() / "hasan-stream"))
from plots_stop import STOP  # noqa: E402  (same stopwords as the Twitch transcripts post)

SRC = Path.home() / "ytpt" / "docs" / "data"
OUT = Path(__file__).resolve().parent.parent / "visualizations" / "data" / "bay_area_pairs.json"
TOK = re.compile(r"[a-z]+(?:'[a-z]+)?")
N_TOP, MIN_WORDS = 12, 30000
# Meeting procedure and titles: a pair with one of these words is about running the meeting, not the topic.
# Titles also stop "member <surname>" pairs, which the lowercase redaction layer can miss.
PROC = set(("council councilmember councilmembers member members city public comment comments vice mayor manager clerk "
            "attorney chambers hearing hearings board chair chairs item items number staff report meeting meetings director "
            "directors aye speaker speakers card commission commissioner president moving forward thank evening tonight motion "
            "second agenda oral communication communications begin speaking final let").split())
# Place words: "san jose", "bay area", "santa clara county" say where the meeting is, not what it is about.
PLACE = set("san santa los palo daly daily bay county east south north west american silicon".split())
LABEL = {"bsv project": "BSV project", "vision zero": "Vision Zero", "smart station": "SMART station",
         "super bowl": "Super Bowl", "world cup": "World Cup", "yimby law": "YIMBY law",
         "mission boulevard": "Mission Boulevard", "fremont boulevard": "Fremont Boulevard", "paseo padre": "Paseo Padre",
         "tennyson road": "Tennyson Road", "antonio road": "Antonio Road", "caledonia street": "Caledonia Street",
         "richmond parkway": "Richmond Parkway", "richmond housing": "Richmond housing", "vine trail": "Vine Trail",
         "beacon avenue": "Beacon Avenue", "olive avenue": "Olive Avenue", "northgate master": "Northgate master"}

# Single words only: place names (one half of "santa clara" etc.) and spoken filler the stopwords miss.
WDROP = set(("clara jose leandro rosa alto altos mateo rafael petaluma richmond hayward fremont vallejo napa sunnyvale "
             "sausalito oakland concord pleasanton livermore cupertino milpitas healdsburg francisco "
             "we'll we're great looking wanted questions question slide slides terms yes okay supervisor supervisors "
             "committee committees people").split())
WLABEL = {"bart": "BART", "vta": "VTA", "samtrans": "SamTrans", "caltrain": "Caltrain", "adu": "ADU", "adus": "ADUs",
          "ceqa": "CEQA", "rhna": "RHNA", "hcd": "HCD", "smart": "SMART", "ac": "AC"}


def ok(p):
    a, b = p.split()
    return not (a in PROC or b in PROC or a in PLACE or b in PLACE)


def main():
    eps = {e["episode_id"]: e for e in json.loads((SRC / "episodes.json").read_text())}
    names = {b["body"]: b["name"] for b in json.loads((SRC / "bodies.json").read_text())["bodies"]}
    per = {}                                              # body -> month -> (Counter of pairs, tokens)
    for f in sorted((SRC / "episodes").glob("*.json")):
        d = json.loads(f.read_text())
        for eid, ep in d["episodes"].items():
            month = eps[eid]["meeting_id"].split(":")[1][:7]
            pc, n, wc = per.setdefault(d["body"], {}).setdefault(month, [collections.Counter(), 0, collections.Counter()])
            for t in ep["turns"]:
                txt = re.sub(r"\[[^\]]*\]", " | ", t.get("text") or "").lower()
                tk = [w[:-2] if w.endswith("'s") else w for w in TOK.findall(txt)]
                per[d["body"]][month][1] += len(tk)
                wc.update(w for w in tk if w not in STOP and len(w) > 2 and w not in PROC and w not in PLACE and w not in WDROP)
                for a, b in zip(tk, tk[1:]):
                    if a not in STOP and b not in STOP and len(a) > 2 and len(b) > 2 and a != b and ok(f"{a} {b}"):
                        pc[f"{a} {b}"] += 1
    months = sorted({m for b in per.values() for m in b})

    def tab(key, label, bm):
        tot = sum((c for c, _, _ in bm.values()), collections.Counter())
        wtot = sum((w for _, _, w in bm.values()), collections.Counter())
        top = [p for p, _ in tot.most_common(N_TOP)]
        wtop = [w for w, _ in wtot.most_common(N_TOP)]
        cols = []
        for m in months:
            c, n, w = bm.get(m, (collections.Counter(), 0, collections.Counter()))
            cols.append({"m": m, "tokens": n,
                         "rate": {p: round(c[p] / n * 1e4, 1) for p in top} if n else None,
                         "n": {p: c[p] for p in top} if n else None,
                         "wrate": {x: round(w[x] / n * 1e4, 1) for x in wtop} if n else None,
                         "wn": {x: w[x] for x in wtop} if n else None})
        return {"key": key, "label": label, "tokens": sum(n for _, n, _ in bm.values()),
                "pairs": [{"key": p, "label": LABEL.get(p, p), "n": tot[p]} for p in top],
                "words": [{"key": x, "label": WLABEL.get(x, x), "n": wtot[x]} for x in wtop], "months": cols}

    allm = {}
    for bm in per.values():
        for m, (c, n, w) in bm.items():
            a = allm.setdefault(m, [collections.Counter(), 0, collections.Counter()])
            a[0] += c
            a[1] += n
            a[2] += w
    big = sorted((b for b in per if sum(v[1] for v in per[b].values()) >= MIN_WORDS),
                 key=lambda b: -sum(v[1] for v in per[b].values()))
    tabs = [tab("all", "All bodies", allm)] + [tab(b, names.get(b, b), per[b]) for b in big]
    out = {"built": datetime.now().strftime("%Y-%m-%d"), "months": months, "min_words": MIN_WORDS,
           "bodies_total": len(per), "bodies_shown": len(big), "tabs": tabs}
    OUT.write_text(json.dumps(out, separators=(",", ":")))
    for t in tabs:
        print(t["label"], [w["key"] for w in t["words"]])


if __name__ == "__main__":
    main()

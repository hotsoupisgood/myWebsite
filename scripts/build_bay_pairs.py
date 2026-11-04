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
             "committee committees people able").split())
# 3- and 4-word phrases: spoken filler and stock meeting lines.
GDROP = {"answer any questions", "happy to answer", "quite a bit", "raise your hand", "couple of years", "end of the year",
         "year and a half", "available for any questions", "adopt a resolution", "adopt a resolution approving",
         "vote and that passes", "united states of america", "states of america", "pull from or add", "licensed professional engineer", "couple of weeks", "lot of people", "long time ago", "long period of time", "years and years",
         "happy to answer any", "answer any questions you", "thank you so much", "want to make sure"}
NG = (3, 4)
# Words that mark a phrase as running the meeting (calling speakers, voting, remote attendance).
GPROC = set(("please ahead minutes minute speak speaking vote votes voting unmute zoom online raised hand hands record "
             "file reading roll call discussion question questions note ready time limit register seeing joining "
             "approval approve motion certain presentation powerpoint screen channel spanish bell ring seconds remote "
             "telephone indicate referral agendized behalf representing hear conduct disrupts interferes procedures "
             "cards desk passes unanimously opposed colleagues title wanted able great hello allegiance flag indivisible "
             "pledge god month wave order press star phone wish respond interpretaci vivo personas que th st nd rd").split())
# Staff names seen in the top phrases that the lexicon does not flag (checked by hand 2026-11-03).
NAME_DROP = {"zach", "dahl"}
# Given names (flag "name") from the project's redaction lexicon: a phrase with one is dropped, because it can
# name a meeting participant that the lowercase redaction layer missed.
GIVEN = {l.split("\t")[0].strip().lower() for l in open(Path.home() / "ytpt" / "plan" / "given_names.txt", encoding="utf-8")
         if not l.startswith("#") and l.count("\t") >= 2 and l.rstrip("\n").split("\t")[2].strip() == "name"}
# One public commenter opens and closes with the same lines at many BART and VTA meetings. Removed before
# counting, so one person's repeated words do not read as a topic.
REPEATED = re.compile(r"licensed professional engineer.{0,90}?fire life safety expert|bart is the people'?s? system")


def gram_ok(g):
    if g[0] in STOP or g[-1] in STOP or len(g[0]) < 3 or len(g[-1]) < 3:
        return False
    if sum(w not in STOP for w in g) < 2 or any(a == b for a, b in zip(g, g[1:])):
        return False
    return not any(w in PROC or w in PLACE or w in GPROC or w in GIVEN or w in NAME_DROP for w in g) and " ".join(g) not in GDROP


GLABEL = {"camino real specific plan": "Camino Real specific plan", "state of california": "State of California",
          "california municipal finance authority": "California Municipal Finance Authority",
          "housing and community development": "Housing and Community Development", "civil grand jury": "civil grand jury"}
WLABEL = {"bart": "BART", "vta": "VTA", "samtrans": "SamTrans", "caltrain": "Caltrain", "adu": "ADU", "adus": "ADUs",
          "ceqa": "CEQA", "rhna": "RHNA", "hcd": "HCD", "smart": "SMART", "ac": "AC"}


def ok(p):
    a, b = p.split()
    return not (a in PROC or b in PROC or a in PLACE or b in PLACE or a in GIVEN or b in GIVEN or a in NAME_DROP or b in NAME_DROP)


def main():
    eps = {e["episode_id"]: e for e in json.loads((SRC / "episodes.json").read_text())}
    names = {b["body"]: b["name"] for b in json.loads((SRC / "bodies.json").read_text())["bodies"]}
    per = {}                                              # body -> month -> (Counter of pairs, tokens)
    for f in sorted((SRC / "episodes").glob("*.json")):
        d = json.loads(f.read_text())
        for eid, ep in d["episodes"].items():
            month = eps[eid]["meeting_id"].split(":")[1][:7]
            cell = per.setdefault(d["body"], {}).setdefault(month, [collections.Counter(), 0, collections.Counter(),
                                                                    {k: collections.Counter() for k in NG}])
            pc, n, wc, gc = cell
            seen = set()        # (speaker, phrase): a phrase counts once per speaker per meeting stretch
            for t in ep["turns"]:
                txt = REPEATED.sub(" | ", re.sub(r"\[[^\]]*\]", " | ", t.get("text") or "").lower())
                tk = [w[:-2] if w.endswith("'s") else w for w in TOK.findall(txt)]
                per[d["body"]][month][1] += len(tk)
                wc.update(w for w in tk if w not in STOP and len(w) > 2 and w not in PROC and w not in PLACE and w not in WDROP and w not in GIVEN)
                for part in txt.split("|"):
                    pt = [w[:-2] if w.endswith("'s") else w for w in TOK.findall(part)]
                    for k in NG:
                        for i in range(len(pt) - k + 1):
                            g = pt[i:i + k]
                            key = (t.get("speaker"), " ".join(g))
                            if key not in seen and gram_ok(g):
                                seen.add(key)
                                gc[k][key[1]] += 1
                for a, b in zip(tk, tk[1:]):
                    if a not in STOP and b not in STOP and len(a) > 2 and len(b) > 2 and a != b and ok(f"{a} {b}"):
                        pc[f"{a} {b}"] += 1
    months = sorted({m for b in per.values() for m in b})

    def tab(key, label, bm):
        tot = sum((v[0] for v in bm.values()), collections.Counter())
        wtot = sum((v[2] for v in bm.values()), collections.Counter())
        gtot = {k: sum((v[3][k] for v in bm.values()), collections.Counter()) for k in NG}
        gtop = {k: [g for g, _ in gtot[k].most_common(N_TOP)] for k in NG}
        top = [p for p, _ in tot.most_common(N_TOP)]
        wtop = [w for w, _ in wtot.most_common(N_TOP)]
        cols = []
        for m in months:
            c, n, w, gm = bm.get(m, (collections.Counter(), 0, collections.Counter(), {k: collections.Counter() for k in NG}))
            extra = {}
            for k in NG:
                extra[f"r{k}"] = {g: round(gm[k][g] / n * 1e4, 1) for g in gtop[k]} if n else None
                extra[f"n{k}"] = {g: gm[k][g] for g in gtop[k]} if n else None
            cols.append({"m": m, "tokens": n, **extra,
                         "rate": {p: round(c[p] / n * 1e4, 1) for p in top} if n else None,
                         "n": {p: c[p] for p in top} if n else None,
                         "wrate": {x: round(w[x] / n * 1e4, 1) for x in wtop} if n else None,
                         "wn": {x: w[x] for x in wtop} if n else None})
        return {"key": key, "label": label, "tokens": sum(v[1] for v in bm.values()),
                **{f"g{k}": [{"key": g, "label": GLABEL.get(g, g), "n": gtot[k][g]} for g in gtop[k]] for k in NG},
                "pairs": [{"key": p, "label": LABEL.get(p, p), "n": tot[p]} for p in top],
                "words": [{"key": x, "label": WLABEL.get(x, x), "n": wtot[x]} for x in wtop], "months": cols}

    allm = {}
    for bm in per.values():
        for m, (c, n, w, gm) in bm.items():
            a = allm.setdefault(m, [collections.Counter(), 0, collections.Counter(), {k: collections.Counter() for k in NG}])
            a[0] += c
            a[1] += n
            a[2] += w
            for k in NG:
                a[3][k] += gm[k]
    big = sorted((b for b in per if sum(v[1] for v in per[b].values()) >= MIN_WORDS),
                 key=lambda b: -sum(v[1] for v in per[b].values()))
    tabs = [tab("all", "All bodies", allm)] + [tab(b, names.get(b, b), per[b]) for b in big]
    out = {"built": datetime.now().strftime("%Y-%m-%d"), "months": months, "min_words": MIN_WORDS,
           "bodies_total": len(per), "bodies_shown": len(big), "tabs": tabs}
    OUT.write_text(json.dumps(out, separators=(",", ":")))
    for t in tabs:
        print(t["label"], [g["key"] for g in t["g3"]][:6], [g["key"] for g in t["g4"]][:6])


if __name__ == "__main__":
    main()

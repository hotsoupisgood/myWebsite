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
LABEL = {"elsayed": "El-Sayed", "israel": "Israel", "stevens": "Stevens", "democrats": "Democrats",
         "trump": "Trump", "democratic": "Democratic", "rogers": "Rogers", "michigan": "Michigan"}

# Left out of the pair grid: the streamer's own name, as in the word grid.
PAIR_DROP = {"hassan piker", "hasan piker"}
PAIR_LABEL = {"haley stevens": "Haley Stevens", "mike rogers": "Mike Rogers", "democratic party": "Democratic Party",
              "donald trump": "Donald Trump", "united states": "United States", "abdul elsayed": "Abdul El-Sayed", "anti semitic": "anti-Semitic", "anti semitism": "anti-Semitism",
              "fox news": "Fox News", "benjamin netanyahu": "Benjamin Netanyahu", "pro israel": "pro-Israel",
              "black people": "Black people", "ilhan omar": "Ilhan Omar", "mao zedong": "Mao Zedong",
              "ethan klein": "Ethan Klein", "abdul sayed": "Abdul El-Sayed", "hype train": "hype train",
              "republican party": "Republican Party", "white house": "White House", "kamala harris": "Kamala Harris"}

# Topic word groups. A topic count is the number of tokens in the group.
TOPICS = {
    "elections": ("Elections", "Election words", "election elections midterm midterms vote votes voting voter voters ballot ballots poll polls polling"),
    "israel": ("Israel and Gaza", "Israel and Gaza words", "israel israeli israelis gaza palestine palestinian palestinians netanyahu zionist zionists zionism"),
    "trump": ("Trump", "The name Trump", "trump"),
    "parties": ("Parties", "Party words", "democrat democrats democratic dems republican republicans gop maga"),
    "iran": ("Iran", "Iran words", "iran iranian"),
}


FIRST_DAY = "2026-10-26"

# One spelling for Abdul El-Sayed before counting (Puck 2026-11-03). Whisper writes "Abdullah Al-Sayed",
# "Abdel El-Sayed", "Abdul Alsaid" and others; "el"/"al" are under three letters, so without this the name
# never forms a pair. Full name -> "abdul elsayed"; surname alone -> "elsayed".
NAME_FULL = re.compile(r"\b(?:abdul|abdullah|abdel)[\s-]+(?:(?:el|al)[\s-]?(?:sayed|sayyed|syed|said)|elsayed|alsayed|alsaid)\b")
NAME_LAST = re.compile(r"\b(?:el|al)[\s-]?(?:sayed|sayyed|syed)\b|\belsayed\b|\balsayed\b")


def norm(text):
    t = NAME_FULL.sub(" abdul elsayed ", text.lower())
    return NAME_LAST.sub(" elsayed ", t)


# People's names: spaCy en_core_web_sm PERSON entities, grouped by surname. A first name on its own ("Abdul",
# "David") is not counted, because it cannot be told apart from other people with that name. Left out: the
# streamer himself, fictional characters, religious figures, and tags that are not a person.
# Surname alone: "Bolsonaro" on its own can be Flavio or Jair Bolsonaro.
SURNAME_ONLY = {"bolsonaro"}
NOT_PEOPLE = {"piker", "hassan", "hasan", "lightyear", "malfoy", "christ", "twitter", "turkish", "boogie", "s"}


def people(texts_by_stream):
    """-> (ordered [{key,label,n}], [Counter per stream]) for the N_TOP most named people."""
    import spacy
    nlp = spacy.load("en_core_web_sm", disable=["parser", "lemmatizer"])
    per, forms = [], collections.defaultdict(collections.Counter)
    for texts in texts_by_stream:
        raw = []
        for doc in nlp.pipe([NAME_FULL.sub(" Abdul El-Sayed ", t) for t in texts], batch_size=256):
            for e in doc.ents:
                if e.label_ != "PERSON":
                    continue
                w = [x for x in re.findall(r"[A-Za-z]+(?:-[A-Za-z]+)?", e.text) if x.lower() != "s"]
                if w:
                    last = re.sub(r"^(?:el|al)-?", "el-", w[-1].lower()) if re.match(r"(?i)^(?:el|al)-?s", w[-1]) else w[-1].lower()
                    first = w[0].lower() if len(w) > 1 else ""
                    raw.append((last, first))
                    if first:
                        forms[last][first] += 1
        per.append(raw)
    # surname groups seen at least 10 times as a full name; the label uses the most common first name,
    # unless a second first name is at least 20 of every 100 full-name mentions (then the surname alone)
    label, keepfirst = {}, {}
    for last, fc in forms.items():
        if last in NOT_PEOPLE or sum(fc.values()) < 10:
            continue
        (f1, n1), *rest = fc.most_common()
        two = last in SURNAME_ONLY or (rest and rest[0][1] >= 0.2 * sum(fc.values()))
        label[last] = last.title().replace("El-sayed", "El-Sayed") if two else f"{f1.title()} {last.title()}".replace("El-sayed", "El-Sayed")
        keepfirst[last] = None if two else f1
    counts = []
    for raw in per:
        c = collections.Counter()
        for last, first in raw:
            if last in label and (not first or keepfirst[last] is None or first == keepfirst[last]
                                  or (last == "el-sayed")):
                c[last] += 1
        counts.append(c)
    tot = sum(counts, collections.Counter())
    top = [k for k, _ in tot.most_common(N_TOP)]
    return [{"key": k, "label": label[k], "n": tot[k]} for k in top], counts


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
    # The page covers the streams from FIRST_DAY on (Pacific dates). Older backlog streams wait for the full-month update.
    vods = [v for v in vods if local_date(v[0]).strftime("%Y-%m-%d") >= FIRST_DAY]

    streams, all_tok = [], collections.Counter()
    per, pairs_per, all_pair, texts_by_stream = [], [], collections.Counter(), []
    for iso, d, meta in vods:
        rows = [json.loads(l) for l in open(d / "transcript.jsonl", encoding="utf-8") if l.strip()]
        texts_by_stream.append([r["text"] for r in rows])
        speech = sum(r["end"] - r["start"] for r in rows)
        words = sum(len(r["text"].split()) for r in rows)        # as build_outputs.py
        # possessive 's folds into its word ("israel's" counts as "israel")
        toks = [w[:-2] if w.endswith("'s") else w for r in rows for w in TOK.findall(norm(r["text"]))]
        c = collections.Counter(toks)
        content = collections.Counter({w: n for w, n in c.items()
                                       if w not in STOP and w not in EXTRA_STOP and len(w) > 2})
        all_tok += content
        # adjacent pairs inside one segment, both words past the shared stopwords (as hasan-stream
        # plots_pairs.py, but every voice, like the word grid)
        pc = collections.Counter()
        for r in rows:
            t = [w[:-2] if w.endswith("'s") else w for w in TOK.findall(norm(r["text"]))]
            for a, b in zip(t, t[1:]):
                if a not in STOP and b not in STOP and len(a) > 2 and len(b) > 2 and a != b:
                    pc[f"{a} {b}"] += 1
        all_pair += pc
        pairs_per.append(pc)
        dt = local_date(iso)
        streams.append({"date": dt.strftime("%Y-%m-%d"), "label": dt.strftime("%a %b %-d"),
                        "stream_h": round(float(meta["duration_s"]) / 3600, 2),
                        "speech_h": round(speech / 3600, 2), "stream_s": round(float(meta["duration_s"])),
                        "speech_s": round(speech), "words": words, "tokens": len(toks)})
        per.append((c, len(toks)))

    names, name_c = people(texts_by_stream)
    for s_, c_, (_, n_) in zip(streams, name_c, per):
        s_["names"] = {k["key"]: round(c_[k["key"]] / n_ * 1e4, 1) for k in names}
        s_["names_n"] = {k["key"]: c_[k["key"]] for k in names}
    top = [w for w, _ in all_tok.most_common(N_TOP)]
    ptop = [p for p, _ in all_pair.most_common(N_TOP + len(PAIR_DROP)) if p not in PAIR_DROP][:N_TOP]
    for s, (c, n), pc in zip(streams, per, pairs_per):
        s["top"] = {w: round(c[w] / n * 1e4, 1) for w in top}
        s["top_n"] = {w: c[w] for w in top}
        s["pairs"] = {p: round(pc[p] / n * 1e4, 1) for p in ptop}
        s["pairs_n"] = {p: pc[p] for p in ptop}
        s["topics"] = {k: round(sum(c[w] for w in ws.split()) / n * 1e4, 1) for k, (_, _n, ws) in TOPICS.items()}
        s["topics_n"] = {k: sum(c[w] for w in ws.split()) for k, (_, _n, ws) in TOPICS.items()}

    out = {"built": datetime.now().strftime("%Y-%m-%d"),
           "totals": {"streams": len(streams), "stream_h": round(sum(s["stream_s"] for s in streams) / 3600, 1),
                      "speech_h": round(sum(s["speech_s"] for s in streams) / 3600, 1),
                      "words": sum(s["words"] for s in streams)},
           "top_words": [{"key": w, "label": LABEL.get(w, w), "n": all_tok[w]} for w in top],
           "top_names": names,
           "top_pairs": [{"key": p, "label": PAIR_LABEL.get(p, p), "n": all_pair[p]} for p in ptop],
           "topics": [{"key": k, "label": lab, "noun": noun, "words": ws.split()}
                      for k, (lab, noun, ws) in TOPICS.items()],
           "streams": streams}
    OUT.write_text(json.dumps(out, separators=(",", ":")))
    print(json.dumps(out["totals"]), top)
    for s in streams:
        print(s["label"], s["stream_h"], s["speech_h"], s["words"], s["topics"])


if __name__ == "__main__":
    main()

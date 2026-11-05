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
VOCAB_OUT = OUT.with_name("twitch_vocab.json")
PHR_OUT = OUT.with_name("twitch_near_phrases.json")
TOK = re.compile(r"[a-z]+(?:'[a-z]+)?")   # same tokeniser as hasan-stream plots_pairs.py
N_TOP = 12
# Left out of the top-word list: spoken filler the shared stopwords miss, first names whose
# surname is already counted (haley, abdul, mike), and the streamer's own names (piker, hassan).
EXTRA_STOP = set("people thank wait anti let crazy great understand years live haley abdul mike piker hassan".split())
LABEL = {"elsayed": "El-Sayed", "israel": "Israel", "stevens": "Stevens", "democrats": "Democrats",
         "trump": "Trump", "democratic": "Democratic", "rogers": "Rogers", "michigan": "Michigan",
         "jewish": "Jewish", "jews": "Jews", "america": "America", "american": "American", "senate": "Senate",
         "republican": "Republican", "republicans": "Republicans", "netanyahu": "Netanyahu", "gaza": "Gaza", "iran": "Iran"}

# Left out of the pair grid: the streamer's own name, as in the word grid.
PAIR_DROP = {"hassan piker", "hasan piker"}
# 3- and 4-word phrases: first and last word not a stopword, at least two non-stopwords, no word repeated
# back to back; phrases with the streamer's own name and spoken filler are left out (as the pair grid).
NG = (3, 4)
GLABEL = {"angela gonzalez torres": "Angela Gonzalez-Torres", "strait of hormuz": "Strait of Hormuz",
          "critical of israel": "critical of Israel", "state of israel": "State of Israel", "war with iran": "war with Iran",
          "state of michigan": "State of Michigan", "united states senate": "United States Senate", "support for israel": "support for Israel",
          "endorsing mike rogers": "endorsing Mike Rogers", "wall street journal": "Wall Street Journal",
          "vote for mike rogers": "vote for Mike Rogers", "voting for mike rogers": "voting for Mike Rogers",
          "democratic socialists of america": "Democratic Socialists of America", "vote for abdul elsayed": "vote for Abdul El-Sayed",
          "majority in the senate": "majority in the Senate", "mayor of new york": "mayor of New York", "control of the senate": "control of the Senate",
          "palestinian citizens of israel": "Palestinian citizens of Israel", "itamar ben gavir": "Itamar Ben-Gvir",
          "issue of israel": "issue of Israel", "house of representatives": "House of Representatives", "green new deal": "Green New Deal",
          "war in iran": "war in Iran", "feeling like david sirota": "feeling like David Sirota"}
GRAM_NAME = {"hasan", "hassan", "piker", "hasanabi"}
GDROP = {"ladies and gentlemen", "nice to meet", "matter of fact", "states of america", "united states of america",
         "wait a minute", "quite a bit", "years and years", "shape or form", "having a fantastic", "president of the united",
         "reality of the matter", "coming to you live", "boys girls and enbies", "ladies and gentlemen boys",
         "rest of the world", "year and a half", "sit back and watch", "including but not limited", "having a fantastic evening",
         "rest of the country", "soon just you wait", "broadcasting service the people", "service the people broadcasting",
         "booty cheeks big booty", "cheeks big booty cheeks", "sick and tired", "millions of people", "vote for abdul", "vote for mike",
         "voting for mike", "socialists of america"}


def gram_ok(g):
    if g[0] in STOP or g[-1] in STOP or len(g[0]) < 3 or len(g[-1]) < 3:
        return False
    if sum(w not in STOP for w in g) < 2 or any(a == b for a, b in zip(g, g[1:])):
        return False
    return not any(w in GRAM_NAME for w in g) and " ".join(g) not in GDROP
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


FIRST_DAY = "2026-01-01"

# Words near a target (2026-11-05): for each mention of a target's words, the content words within NEAR words on
# either side. A word counts once per mention. Share = mentions with the word nearby, out of every 100 mentions.
NEAR = 15   # about one or two sentences either side (5 was a phrase; 50 reached into other topics)
# Emotional words: the same VADER list and left-out words as the Bay Area post (scripts/build_bay_near.py)
sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_bay_near import emotion  # noqa: E402
EMO = emotion()
# Political names that VADER scores as feelings: "party" (Democratic Party), "lobby", "justice" (Justice Democrats),
# "supreme" (Supreme Court), "united" (United States), "dreams" (the "dream" in DREAM Act talk)
for _w in "party parties lobby justice supreme united dreams dream".split():
    EMO.pop(_w, None)
NEAR_TARGETS = {**{k: (lab, ws) for k, (lab, _n, ws) in TOPICS.items()},
                "elsayed": ("Abdul El-Sayed", "elsayed"), "stevens": ("Haley Stevens", "stevens"), "rogers": ("Mike Rogers", "rogers")}
NEAR_SKIP = {"abdul", "haley", "mike", "donald", "benjamin"}   # the target's own first name

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
    # Every transcribed stream from FIRST_DAY on (Pacific dates); new and backlog streams join as they land.
    vods = [v for v in vods if local_date(v[0]).strftime("%Y-%m-%d") >= FIRST_DAY]

    streams, all_tok = [], collections.Counter()
    near = {k: collections.Counter() for k in NEAR_TARGETS}; near_m = collections.Counter(); tok_lists = []
    near_e = {k: collections.Counter() for k in NEAR_TARGETS}; near_t = {k: [0.0, 0] for k in NEAR_TARGETS}
    per, pairs_per, all_pair, texts_by_stream = [], [], collections.Counter(), []
    grams_per, all_gram = [], {k: collections.Counter() for k in NG}
    for iso, d, meta in vods:
        rows = [json.loads(l) for l in open(d / "transcript.jsonl", encoding="utf-8") if l.strip()]
        texts_by_stream.append([r["text"] for r in rows])
        speech = sum(r["end"] - r["start"] for r in rows)
        words = sum(len(r["text"].split()) for r in rows)        # as build_outputs.py
        # possessive 's folds into its word ("israel's" counts as "israel")
        toks = [w[:-2] if w.endswith("'s") else w for r in rows for w in TOK.findall(norm(r["text"]))]
        c = collections.Counter(toks)
        tok_lists.append(toks)
        for k, (_lab, ws) in NEAR_TARGETS.items():
            tw = set(ws.split())
            for i, w in enumerate(toks):
                if w in tw:
                    near_m[k] += 1
                    nset = {x for x in toks[max(0, i - NEAR):i + NEAR + 1]
                            if x not in tw and x not in STOP and x not in EXTRA_STOP and x not in GRAM_NAME
                            and x not in NEAR_SKIP and len(x) > 2}
                    near[k].update(nset)
                    em = [x for x in nset if x in EMO]
                    near_e[k].update(em); near_t[k][0] += sum(EMO[x] for x in em); near_t[k][1] += len(em)
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
        gc = {k: collections.Counter() for k in NG}
        for r in rows:
            t = [w[:-2] if w.endswith("'s") else w for w in TOK.findall(norm(r["text"]))]
            for k in NG:
                for i in range(len(t) - k + 1):
                    g = t[i:i + k]
                    if gram_ok(g):
                        gc[k][" ".join(g)] += 1
        for k in NG:
            all_gram[k] += gc[k]
        grams_per.append(gc)
        dt = local_date(iso)
        streams.append({"date": dt.strftime("%Y-%m-%d"), "label": dt.strftime("%a %b %-d"),
                        "stream_h": round(float(meta["duration_s"]) / 3600, 2),
                        "speech_h": round(speech / 3600, 2), "stream_s": round(float(meta["duration_s"])),
                        "speech_s": round(speech), "words": words, "tokens": len(toks)})
        per.append((c, len(toks)))

    # Word lookup (2026-11-05): per-stream counts for every word said at least VOCAB_MIN times in all streams,
    # so the page can chart any one word. Stored as a separate file so the main JSON stays small.
    VOCAB_MIN = 10
    allc = sum((c for c, _ in per), collections.Counter())
    vocab = sorted(w for w, n in allc.items() if n >= VOCAB_MIN and len(w) > 1)
    # Overall only (Puck 2026-11-05: "not through time just overall"): each word's total and its words nearby,
    # for every content word said at least NEAR_MIN times. Counts only; no text leaves this script.
    NEAR_MIN = 30
    ok = lambda x: x not in STOP and x not in EXTRA_STOP and x not in GRAM_NAME and len(x) > 2
    keys = {w for w, n in allc.items() if n >= NEAR_MIN and ok(w)}
    nb = {w: collections.Counter() for w in keys}
    nbe = {w: collections.Counter() for w in keys}; tone = {w: [0.0, 0] for w in keys}
    for toks in tok_lists:
        for i, w in enumerate(toks):
            if w in keys:
                nset = {x for x in toks[max(0, i - NEAR):i + NEAR + 1] if x != w and ok(x)}
                nb[w].update(nset)
                em = [x for x in nset if x in EMO]
                nbe[w].update(em); tone[w][0] += sum(EMO[x] for x in em); tone[w][1] += len(em)
    # Phrases near a word (2026-11-05): word pairs, 3- and 4-word phrases within the window, for words said at least
    # GRAM_MIN times and for the topic buttons. Same phrase rules as the grids above. Own file, loaded on demand.
    GRAM_MIN = 100
    pair_ok = lambda g: (g[0] not in STOP and g[1] not in STOP and len(g[0]) > 2 and len(g[1]) > 2 and g[0] != g[1]
                         and " ".join(g) not in PAIR_DROP)
    gkeys = {w for w in keys if allc[w] >= GRAM_MIN}
    tsets = {k: set(ws.split()) for k, (_lab, ws) in NEAR_TARGETS.items()}
    ph = collections.defaultdict(lambda: {k: collections.Counter() for k in (2, 3, 4)})
    for toks in tok_lists:
        for i, w in enumerate(toks):
            hits = ([w] if w in gkeys else []) + ["t:" + k for k, ts in tsets.items() if w in ts]
            if not hits:
                continue
            win = toks[max(0, i - NEAR):i + NEAR + 1]
            grams = {k: {tuple(win[j:j + k]) for j in range(len(win) - k + 1)} for k in (2, 3, 4)}
            for h in hits:
                own = tsets[h[2:]] if h.startswith("t:") else {w}
                for k in (2, 3, 4):
                    ph[h][k].update(" ".join(g) for g in grams[k]
                                    if not (own & set(g)) and not (NEAR_SKIP & set(g))
                                    and (pair_ok(g) if k == 2 else gram_ok(list(g))))
    PHR_OUT.write_text(json.dumps({h: {str(k): [[GLABEL.get(g, PAIR_LABEL.get(g, g)), n] for g, n in c[k].most_common(N_TOP)]
                                       for k in (2, 3, 4)} for h, c in ph.items()}, separators=(",", ":")))
    allemo = [EMO[x] for toks in tok_lists for x in toks if x in EMO and ok(x)]
    total_tok = sum(n for _, n in per)
    VOCAB_OUT.write_text(json.dumps({"min": NEAR_MIN, "window": NEAR, "tokens": total_tok, "gram_min": GRAM_MIN,
        "tone_all": round(sum(allemo) / len(allemo), 2),
        "words": {w: [allc[w], [[x, k] for x, k in nb[w].most_common(N_TOP)],
                      [[x, k, 1 if EMO[x] > 0 else -1] for x, k in nbe[w].most_common(N_TOP)],
                      round(tone[w][0] / tone[w][1], 2) if tone[w][1] else None] for w in sorted(keys)}}, separators=(",", ":")))
    names, name_c = people(texts_by_stream)
    for s_, c_, (_, n_) in zip(streams, name_c, per):
        s_["names"] = {k["key"]: round(c_[k["key"]] / n_ * 1e4, 1) for k in names}
        s_["names_n"] = {k["key"]: c_[k["key"]] for k in names}
    top = [w for w, _ in all_tok.most_common(N_TOP)]
    ptop = [p for p, _ in all_pair.most_common(N_TOP + len(PAIR_DROP)) if p not in PAIR_DROP][:N_TOP]
    gtop = {k: [g for g, _ in all_gram[k].most_common(N_TOP)] for k in NG}
    for s, (c, n), pc, gc in zip(streams, per, pairs_per, grams_per):
        for k in NG:
            s[f"g{k}"] = {g: round(gc[k][g] / n * 1e4, 1) for g in gtop[k]}
            s[f"g{k}_n"] = {g: gc[k][g] for g in gtop[k]}
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
           **{f"top_g{k}": [{"key": g, "label": GLABEL.get(g, g), "n": all_gram[k][g]} for g in gtop[k]] for k in NG},
           "top_pairs": [{"key": p, "label": PAIR_LABEL.get(p, p), "n": all_pair[p]} for p in ptop],
           "topics": [{"key": k, "label": lab, "noun": noun, "words": ws.split()}
                      for k, (lab, noun, ws) in TOPICS.items()],
           "near": {"window": NEAR, "targets": [{"key": k, "label": lab, "mentions": near_m[k],
                     "words": [{"key": w, "label": LABEL.get(w, w), "n": n, "share": round(100 * n / near_m[k], 1)}
                               for w, n in near[k].most_common(N_TOP)] if near_m[k] else [],
                     "emo": [{"key": w, "label": LABEL.get(w, w), "n": n, "s": 1 if EMO[w] > 0 else -1}
                             for w, n in near_e[k].most_common(N_TOP)] if near_m[k] else [],
                     "tone": round(near_t[k][0] / near_t[k][1], 2) if near_t[k][1] else None}
                    for k, (lab, _ws) in NEAR_TARGETS.items()]},
           "streams": streams}
    OUT.write_text(json.dumps(out, separators=(",", ":")))
    print(json.dumps(out["totals"]), top)
    for s in streams:
        print(s["label"], s["stream_h"], s["speech_h"], s["words"], s["topics"])


if __name__ == "__main__":
    main()

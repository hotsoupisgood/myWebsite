"""Topic analysis for the Bay Area Transit Analysis post (visualizations/bay-area-transit-analysis.md).
A 10-topic model (Latent Dirichlet Allocation, scikit-learn, fixed seed) of the public comments in the project's
PUBLISHED, redacted transcript export (~/ytpt/docs/data), read-only, with the word filters of build_bay_pairs.py.
Writes topic top words, each body's topic shares, and a 2-D map of the comments (t-SNE of the topic mixes) with a
short snippet of each comment's published, redacted text for the hover.
Run: ~/ytpt/.venv/bin/python -I scripts/build_bay_topics.py"""
import collections, json, re, sys
from pathlib import Path

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_bay_pairs as P  # noqa: E402
import numpy as np  # noqa: E402
from sklearn.decomposition import LatentDirichletAllocation  # noqa: E402
from sklearn.feature_extraction.text import CountVectorizer  # noqa: E402
from sklearn.manifold import TSNE  # noqa: E402

OUT = P.OUT.with_name("bay_area_topics.json")
K, SEED, MIN_WORDS, MIN_BODY, SNIP = 10, 1, 25, 25, 260
# Names given by reading each topic's top words (2026-11-05). Index = the model's topic number with SEED.
NAMES = {0: "Neighborhood development", 1: "Planning process", 2: "VTA BART tunnel", 3: "Street safety and traffic",
         4: "Bike plans and funding", 5: "State law and labor", 6: "Project design and building",
         7: "Bus and transit service", 8: "Renters and rent control", 9: "Affordable housing"}
ORDER = [9, 0, 8, 7, 3, 4, 2, 6, 1, 5]


# The redaction misses some names (it was built for people's names in context, and some names are also
# English words, such as "Candelas"). The hover snippets are the only text this page shows, so any capitalised
# word inside a sentence is replaced with "[name]" unless it is on this allowlist: civic titles, place and body
# names, months and days, and agency abbreviations. Strict on purpose: an ordinary word may be masked too.
ALLOW = set(("I I'm I'd I'll I've Council Councilmember Councilmembers Mayor Vice City Cities Chair Chairs President "
             "Director Directors Manager Committee Commission Commissioners Members Member Board Supervisors Supervisor "
             "District Association County Area Valley Bay East West North South General Plan Housing Element State "
             "California Transit Authority Street Avenue Road Boulevard Drive Way Lane Station Downtown Park Center "
             "Department Public Works Planning Transportation Commissioner Honorable Mr Mrs Ms Dr Thank Good Hello "
             "January February March April May June July August September October November December Monday Tuesday "
             "Wednesday Thursday Friday Saturday Sunday American America Americans United States Federal Measure "
             "Caltrain Clipper Muni Amtrak SMART Caltrans BART VTA AC MTC CEQA RHNA ADU ADUs HCD SB AB EIR YIMBY NIMBY "
             "Specific Policy Program Project Projects Ordinance Agenda Item Section Code Act Law Senate Assembly "
             "Governor Federal Coalition Chamber Commerce Silicon Peninsula Marin Sonoma Napa Contra Costa Alameda "
             "Santa Clara Mateo San Francisco Jose José Oakland Berkeley Richmond Hayward Fremont Sunnyvale Cupertino "
             "Milpitas Palo Alto Los Altos Mountain View Pleasanton Livermore Concord Vallejo Petaluma Rosa Rafael "
             "Sausalito Healdsburg Cotati Rohnert Leandro Daly SamTrans Sacramento Oregon Texas New York").split())
ALLOW |= set(P.WLABEL.values())


def scrub(text):
    out, start = [], True
    for tok in re.split(r"(\s+)", text):
        w = tok.strip(".,;:!?\"()")
        if w and w[0].isupper() and not start and w not in ALLOW and w.rstrip("'s").rstrip("’s") not in ALLOW:
            tok = tok.replace(w, "[name]")
        if tok.strip():
            start = tok.rstrip("\"')").endswith((".", "!", "?"))
        out.append(tok)
    t = "".join(out).replace("[name]", "\x00")      # protect the placeholders while masking
    # lowercase transcripts carry no capitals: also mask any given name from the project's lexicon in any case,
    # and the two words after "my name is" / "this is", which is where speakers say their own name
    low_allow = {w.lower() for w in ALLOW}
    t = re.sub(r"\b[A-Za-z]+\b", lambda m: "[name]" if m.group(0).lower() in P.GIVEN and m.group(0).lower() not in low_allow else m.group(0), t)
    t = re.sub(r"(?i)\b(my name is|my name's|this is)\s+(?![\x00\[])([A-Za-z'-]+)(\s+(?!and\b|i\b|i'm\b)[A-Za-z'-]+)?", r"\1 [name]", t)
    t = t.replace("\x00", "[name]")
    return re.sub(r"(\[name\][,.]?\s*){2,}", "[name] ", t)


def main():
    names = {b["body"]: b["name"] for b in json.loads((P.SRC / "bodies.json").read_text())["bodies"]}
    docs, body, snip = [], [], []
    for f in sorted((P.SRC / "episodes").glob("*.json")):
        d = json.loads(f.read_text())
        for ep in d["episodes"].values():
            for t in ep["turns"]:
                if t.get("role") != "public":
                    continue
                raw = t.get("text") or ""
                txt = P.REPEATED.sub(" ", re.sub(r"\[[^\]]*\]", " ", raw).lower())
                tk = [w for w in P.TOK.findall(txt) if w not in P.STOP and len(w) > 2 and w not in P.PROC
                      and w not in P.PLACE and w not in P.WDROP and w not in P.GIVEN]
                if len(tk) >= MIN_WORDS:
                    docs.append(" ".join(tk)); body.append(d["body"])
                    s = scrub(" ".join(raw.split()))
                    snip.append(s[:SNIP].rsplit(" ", 1)[0] + "..." if len(s) > SNIP else s)
    vec = CountVectorizer(max_df=0.4, min_df=10)
    X = vec.fit_transform(docs)
    vocab = vec.get_feature_names_out()
    lda = LatentDirichletAllocation(n_components=K, random_state=SEED, learning_method="batch", max_iter=30).fit(X)
    T = lda.transform(X)
    Y = TSNE(n_components=2, random_state=SEED, init="pca", perplexity=40).fit_transform(T)
    Y = (Y - Y.min(0)) / (Y.max(0) - Y.min(0))
    pos = {k: i for i, k in enumerate(ORDER)}
    topics = []
    for k in ORDER:
        comp = lda.components_[k]; idx = comp.argsort()[::-1][:8]
        topics.append({"name": NAMES[k], "n": int((T.argmax(1) == k).sum()),
                       "words": [[vocab[i], round(float(comp[i] / comp.sum() * 100), 2)] for i in idx]})
    cnt = collections.Counter(body)
    bodies = [{"body": b, "name": names.get(b, b), "n": n,
               "share": [round(float(T[[i for i in range(len(body)) if body[i] == b]][:, k].mean() * 100), 1) for k in ORDER]}
              for b, n in cnt.most_common() if n >= MIN_BODY]
    pts = [[round(float(Y[i, 0]), 4), round(float(Y[i, 1]), 4), pos[int(T[i].argmax())],
            round(float(T[i].max() * 100)), names.get(body[i], body[i]), snip[i]] for i in range(len(docs))]
    OUT.write_text(json.dumps({"k": K, "min_body": MIN_BODY, "n_comments": len(docs), "topics": topics,
                               "bodies": bodies, "points": pts}, separators=(",", ":"), ensure_ascii=False))
    print(len(docs), "comments;", len(bodies), "bodies;", OUT.stat().st_size // 1024, "KB")


if __name__ == "__main__":
    main()

"""Topic analysis for the Twitch transcripts post (visualizations/twitch-transcripts.md).
Each stream is cut into ~3-minute chunks; a 12-topic model (LDA, scikit-learn, fixed seed) groups the chunks by
the words they share. Writes topic top words, each month's topic shares, and a 2-D map of the chunks (t-SNE of
the topic mixes) (no transcript text: the page publishes counts only). Topic names: written by an LLM (Claude) from each topic's
top words and sample chunks, then fixed in NAMES.
Run: ~/ytpt/.venv/bin/python -I scripts/build_twitch_topics.py [--words]   (--words prints topics for naming)"""
import collections, json, re, sys
from pathlib import Path

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_twitch_transcripts as W  # noqa: E402
import numpy as np  # noqa: E402
from sklearn.decomposition import LatentDirichletAllocation  # noqa: E402
from sklearn.feature_extraction.text import CountVectorizer  # noqa: E402
from sklearn.manifold import TSNE  # noqa: E402

OUT = W.OUT.with_name("twitch_topics.json")
K, SEED, CHUNK_S, MIN_WORDS, MAP_MAX = 12, 1, 180, 60, 3000
NAMES = {0: "Iran war and oil", 1: "Trump administration and prices", 2: "Stream chat and jokes", 3: "Elections and polls",
         4: "Campus events and online media", 5: "New York politics, mixed with TV talk", 6: "Race and religion",
         7: "Israel and Palestine", 8: "Antisemitism and Zionism", 9: "Socialism and the left", 10: "Charlie Kirk and other news stories",
         11: "Michigan Senate race"}
ORDER = [11, 9, 3, 7, 8, 0, 1, 4, 10, 6, 5, 2]
FILLER = set("yeah okay gonna like know just really right think mean thing things way want going get got say said "
             "fucking fuck shit dude guys guy literally actually look stuff kind lot good bad whatever lol".split())


def chunks():
    vods = []
    for d in sorted((W.SRC / "vods").iterdir()):
        if (d / "transcript.jsonl").exists() and (d / "vod.json").exists():
            iso = json.loads((d / "vod.json").read_text())["date"]
            if W.local_date(iso).strftime("%Y-%m-%d") >= W.FIRST_DAY:
                vods.append((iso, d))
    for iso, d in sorted(vods):
        rows = [json.loads(l) for l in open(d / "transcript.jsonl", encoding="utf-8") if l.strip()]
        buf, t0 = [], None
        for r in rows:
            t0 = r["start"] if t0 is None else t0
            buf.append(r["text"])
            if r["end"] - t0 >= CHUNK_S:
                yield iso, " ".join(buf); buf, t0 = [], None
        if buf:
            yield iso, " ".join(buf)


def main():
    docs, month, day = [], [], []
    for iso, raw in chunks():
        tk = [w[:-2] if w.endswith("'s") else w for w in W.TOK.findall(W.norm(raw))]
        tk = [w for w in tk if w not in W.STOP and w not in W.EXTRA_STOP and w not in FILLER
              and w not in W.GRAM_NAME and len(w) > 2]
        if len(tk) < MIN_WORDS:
            continue
        ld = W.local_date(iso); docs.append(" ".join(tk)); month.append(ld.strftime("%Y-%m")); day.append(ld.strftime("%Y-%m-%d"))
    vec = CountVectorizer(max_df=0.3, min_df=15)
    X = vec.fit_transform(docs)
    vocab = vec.get_feature_names_out()
    lda = LatentDirichletAllocation(n_components=K, random_state=SEED, learning_method="batch", max_iter=30).fit(X)
    T = lda.transform(X)
    if "--words" in sys.argv:
        for k in range(K):
            comp = lda.components_[k]
            print(k, int((T.argmax(1) == k).sum()), " ".join(vocab[i] for i in comp.argsort()[::-1][:18]))
            for i in np.argsort(-T[:, k])[:2]:
                print("    >", " ".join(docs[i].split()[:30]))
        return
    rng = np.random.default_rng(SEED)
    keep = np.sort(rng.choice(len(docs), min(MAP_MAX, len(docs)), replace=False))
    Y = TSNE(n_components=2, random_state=SEED, init="pca", perplexity=40).fit_transform(T[keep])
    Y = (Y - Y.min(0)) / (Y.max(0) - Y.min(0))
    pos = {k: i for i, k in enumerate(ORDER)}
    topics = []
    for k in ORDER:
        comp = lda.components_[k]; idx = [i for i in comp.argsort()[::-1] if len(vocab[i]) > 2][:8]   # "ll", "ve": vectorizer splits of "we'll"
        topics.append({"name": NAMES[k], "n": int((T.argmax(1) == k).sum()),
                       "words": [[vocab[i], round(float(comp[i] / comp.sum() * 100), 2)] for i in idx]})
    cnt = collections.Counter(day)
    months = [{"month": m, "n": n, "share": [round(float(T[[i for i in range(len(day)) if day[i] == m]][:, k].mean() * 100), 1)
                                              for k in ORDER]} for m, n in sorted(cnt.items())]
    pts = [[round(float(Y[j, 0]), 4), round(float(Y[j, 1]), 4), pos[int(T[i].argmax())], round(float(T[i].max() * 100)),
            day[i]] for j, i in enumerate(keep)]
    OUT.write_text(json.dumps({"k": K, "chunk_s": CHUNK_S, "n_chunks": len(docs), "n_map": len(keep), "topics": topics,
                               "days": months, "points": pts}, separators=(",", ":"), ensure_ascii=False))
    print(len(docs), "chunks;", len(months), "months;", OUT.stat().st_size // 1024, "KB")


if __name__ == "__main__":
    main()

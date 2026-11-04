import sys, json, numpy as np, pandas as pd
sys.path.insert(0, '/Users/abcdef/ytpt/analysis'); sys.path.insert(0, '/Users/abcdef/ytpt'); sys.dont_write_bytecode = True
import stance_s1_role_audit_view as V
cl = pd.read_csv('/Users/abcdef/ytpt/output/stance_s1/nimby_view_fullset/speaker_clusters.csv', keep_default_na=False)
LAB = list(V.LABELS); print('labels', LAB)
out = {}
rng = np.random.default_rng(20261103)
for role, key in (('public', 'pub'), ('dais', 'off')):
    c = cl[(cl.role == role) & (cl.label != 'no stance')]
    rows = []
    for body, g in c.groupby('body'):
        if len(g) < 10: continue
        eps = sorted(g.episode_id.unique())
        M = pd.crosstab(g.episode_id, g.label).reindex(index=eps, columns=LAB, fill_value=0).to_numpy(float)
        tot = M.sum(0); obs = (tot[0] - tot[2]) / tot.sum()
        R = 20000; net = np.empty(R)
        for i in range(R):
            w = rng.multinomial(len(eps), np.full(len(eps), 1 / len(eps))); t = w @ M
            net[i] = (t[0] - t[2]) / t.sum() if t.sum() else np.nan
        net = net[~np.isnan(net)]
        # two-sided bootstrap p: twice the smaller tail share on either side of zero
        p = min(1.0, 2 * min((net <= 0).mean(), (net >= 0).mean()))
        rows.append(dict(body=body, n=len(g), net=obs, lo90=np.percentile(net, 5), hi90=np.percentile(net, 95), p=max(p, 1 / len(net)), boots=net))
    m = len(rows)
    order = sorted(range(m), key=lambda i: rows[i]['p'])
    adj = [None] * m; run = 0
    for rank, i in enumerate(order):               # Holm step-down adjusted p
        run = max(run, min(1.0, (m - rank) * rows[i]['p'])); adj[i] = run
    for i, r in enumerate(rows):
        r['p_holm'] = adj[i]; r['sig90'] = bool(r['lo90'] > 0 or r['hi90'] < 0); r['sig_holm'] = adj[i] < 0.10
        # Bonferroni-width interval for display: 1 - 0.10/m two-sided
        a = 0.10 / m; r['lo_b'], r['hi_b'] = np.percentile(r['boots'], [100 * a / 2, 100 * (1 - a / 2)])
        del r['boots']
    out[key] = {'m': m, 'rows': rows}
    print(role, 'tests', m, 'sig90', sum(r['sig90'] for r in rows), 'holm', sum(r['sig_holm'] for r in rows))
    for r in sorted(rows, key=lambda r: r['p']):
        if r['p'] < 0.2: print('  ', r['body'], round(100*r['net'],1), 'p', round(r['p'],4), 'holm', round(r['p_holm'],3), 'bonf range', round(100*r['lo_b'],1), round(100*r['hi_b'],1))
json.dump(out, open('/tmp/holm/holm.json', 'w'), default=float, indent=1)

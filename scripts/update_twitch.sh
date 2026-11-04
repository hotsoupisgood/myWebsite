#!/bin/zsh
# Rebuild the Twitch transcripts post when new streams are transcribed, and publish it (Puck 2026-11-03 17:39:
# "add days when we get them from runpod"). Run by ~/Library/LaunchAgents/com.lucashenry.twitch-site.plist.
# Publishes only the post's own files; nothing else in the repo is staged.
set -u
export PATH="/Users/abcdef/.openclaw/tools/node-v24.19.0/bin:/opt/homebrew/bin:/usr/bin:/bin"
cd /Users/abcdef/myWebsite || exit 1
LOG=scripts/update_twitch.log
ts() { date -u +%FT%TZ; }
before=$(python3 -c "import json;print(json.load(open('visualizations/data/twitch_transcripts.json'))['totals']['streams'])")
if ! /Users/abcdef/ytpt/.venv/bin/python -I scripts/build_twitch_transcripts.py >> $LOG 2>&1; then
  echo "$(ts) build failed" >> $LOG
  /Users/abcdef/ytpt/.venv/bin/python /Users/abcdef/ytpt/pipeline/notify.py warn "Twitch page update: the data build failed; page unchanged. Log: ~/myWebsite/scripts/update_twitch.log"
  exit 1
fi
after=$(python3 -c "import json;print(json.load(open('visualizations/data/twitch_transcripts.json'))['totals']['streams'])")
if [ "$after" = "$before" ] && git diff --quiet -- visualizations/data/twitch_transcripts.json; then
  echo "$(ts) no new streams ($after)" >> $LOG; exit 0
fi
if [ "$after" -lt "$before" ]; then
  git checkout -- visualizations/data/twitch_transcripts.json
  echo "$(ts) stream count fell $before -> $after; not published" >> $LOG
  /Users/abcdef/ytpt/.venv/bin/python /Users/abcdef/ytpt/pipeline/notify.py warn "Twitch page update: stream count fell from $before to $after; not published."
  exit 1
fi
v=$(date +%Y%m%d%H%M)
sed -i '' -E "s/twitch_transcripts\.json\?v=[0-9a-z]+/twitch_transcripts.json?v=$v/" visualizations/data/twitch_transcripts_viz.js
sed -i '' -E "s/twitch_transcripts_viz\.js\?v=[0-9a-z]+/twitch_transcripts_viz.js?v=$v/" visualizations/twitch-transcripts.md
npx @11ty/eleventy --quiet >> $LOG 2>&1 || { echo "$(ts) eleventy failed" >> $LOG; exit 1; }
git add visualizations/data/twitch_transcripts.json visualizations/data/twitch_transcripts_viz.js visualizations/twitch-transcripts.md \
  docs/visualizations/data/twitch_transcripts.json docs/visualizations/data/twitch_transcripts_viz.js docs/visualizations/twitch-transcripts/index.html docs/visualizations/index.html
git commit -qm "Twitch transcripts: $after streams (auto update)" && git push -q origin HEAD >> $LOG 2>&1 \
  && echo "$(ts) published $before -> $after streams" >> $LOG \
  && /Users/abcdef/ytpt/.venv/bin/python /Users/abcdef/ytpt/pipeline/notify.py info "Twitch page updated: $after streams (was $before). https://lucashenry.xyz/visualizations/twitch-transcripts/" \
  || { echo "$(ts) commit/push failed" >> $LOG; /Users/abcdef/ytpt/.venv/bin/python /Users/abcdef/ytpt/pipeline/notify.py warn "Twitch page update: push failed. Log: ~/myWebsite/scripts/update_twitch.log"; }

#!/usr/bin/env bash
# deploy-cf.sh — stage + deploy CF Pages từ bản build sẵn (out/).
#
# Script này TỒN TẠI vì có 2 cạm bẫy từng làm deploy "thành công ảo" (không hề lên live):
#   1) `wrangler pages deploy <dir>` resolve import —— theo CWD git repo, KHÔNG theo <dir>.
#      → bắt buộc --cwd vào thư mục stage (nếu không, wrangler build functions của repo
#        và import ../lib/parse-pinned sẽ fail "Could not resolve").
#   2) Pages Functions (direct upload) CHỈ bundle được file NẰM TRONG functions/.
#      → lib/parse-pinned.js (nguồn duy nhất cho build + client) được COPY vào
#        functions/api/_shared/parse-pinned.js tại thời điểm deploy.
#
# Script fail TO (exit 1) nếu bundle/deploy/smoke-test lỗi — không bao giờ im lặng.
#
# Cách dùng:
#   CLOUDFLARE_API_KEY=... CLOUDFLARE_EMAIL=... bash scripts/deploy-cf.sh
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STAGE="$(mktemp -d /tmp/opencode/cf-deploy.XXXXXX)"
PROJECT="${CF_PROJECT_NAME:-slimulv1}"
BRANCH="${CF_BRANCH:-main}"
ENDPOINT="https://${PROJECT}.pages.dev/api/pinned"

[ -d "$REPO_ROOT/out" ] || { echo "thiếu out/ — chạy 'bun run build' trước" >&2; exit 1; }

# 1) Nhân bản static export + functions sang thư mục stage
cp -a "$REPO_ROOT/out/." "$STAGE/"
mkdir -p "$STAGE/functions/api/_shared"
cp -a "$REPO_ROOT/functions/." "$STAGE/functions/"
cp "$REPO_ROOT/lib/parse-pinned.js" "$STAGE/functions/api/_shared/parse-pinned.js"

# 2) File đã biết gây quota error trên Pages khi có cả .flac lẫn .m4a — bỏ khỏi deploy
rm -f "$STAGE/music/loch-to-tabibito.flac"

# 3) Bundle + deploy — --cwd bắt buộc để wrangler dùng ĐÚNG thư mục stage
echo "== deploy $PROJECT ($BRANCH) từ $STAGE =="
CLOUDFLARE_API_KEY="${CLOUDFLARE_API_KEY:?thiếu CLOUDFLARE_API_KEY}" \
CLOUDFLARE_EMAIL="${CLOUDFLARE_EMAIL:?thiếu CLOUDFLARE_EMAIL}" \
bunx wrangler pages deploy "$STAGE" \
  --cwd "$STAGE" \
  --project-name "$PROJECT" \
  --branch "$BRANCH" \
  --commit-dirty=true

# 4) Smoke test endpoint: phải trả ok:true + >=1 pin + đủ header
HDR="$(mktemp /tmp/opencode/cf-smoke-hdr.XXXXXX)"
BODY="$(curl -s -m 30 -D "$HDR" "$ENDPOINT")"
echo "$BODY" | python3 -c "
import json, sys
try:
    d = json.load(sys.stdin)
except Exception as e:
    print('smoke FAIL: body không phải JSON:', e); sys.exit(1)
ok = d.get('ok') is True and isinstance(d.get('pinned'), list) and len(d['pinned']) > 0
names = [p['name'] for p in d.get('pinned', [])] if isinstance(d.get('pinned'), list) else d.get('error')
print('smoke %s -> ok: %s | pins: %s' % ('$ENDPOINT', ok, names))
sys.exit(0 if ok else 1)
"
grep -qi 'access-control-allow-origin: \*' "$HDR" || { echo "smoke FAIL: thiếu Access-Control-Allow-Origin: *" >&2; exit 1; }
echo "deploy OK → $ENDPOINT"
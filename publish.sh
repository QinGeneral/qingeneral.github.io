#!/usr/bin/env bash
set -euo pipefail

# Run from any directory; publishing no longer switches branches or stages drafts.
cd "$(dirname "$0")"
npm run build
npm run check
printf '%s\n' '本地构建完成。提交页面改造到 main 并推送后，GitHub Actions 将自动发布到 gh-pages。'

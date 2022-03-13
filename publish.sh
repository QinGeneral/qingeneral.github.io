book sm
sed -i '' 's/%20/ /g' SUMMARY.md
gitbook build
cp -r _book/* .
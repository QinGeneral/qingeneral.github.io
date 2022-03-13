git branch -D gh-pages
git checkout -b gh-pages
book sm
sed -i '' 's/%20/ /g' SUMMARY.md
gitbook build
cp -r _book/* .
git add .
git commit -m "publish book"
git push --set-upstream github gh-pages
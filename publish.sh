# git branch -D gh-pages
# git checkout -b gh-pages
book sm
sed -i '' 's/%20/ /g' SUMMARY.md
nvm use 10.24.0
gitbook build
cp -r _book/* .
git add .
git commit -m "publish book"
git push -f --set-upstream github gh-pages
git checkout main
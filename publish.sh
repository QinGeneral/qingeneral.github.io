git checkout main
git add .
git commit -m "add article ***"

git checkout gh-pages
git merge main

book sm
sed -i '' 's/%20/ /g' SUMMARY.md
nvm use 10.24.0
gitbook build
cp -r _book/* .
git add .
git commit -m "publish book"
git push
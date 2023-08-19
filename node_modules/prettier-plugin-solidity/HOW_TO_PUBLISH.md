# How to publish

```bash
nvm use

git checkout main

git pull

npm i

npm run test:all
```

- Create a branch with the name of the new version number, e.g.: `git checkout -b 1.0.0-beta.4`

- Bump the version in the package.json file

- `npm i`

```bash
git add .

git commit -m 'bump version'

git push
```

- Once the PR is merged, then `git checkout main` and `git pull`

- Uncomment the first line of the `.npmrc` file and comment the second line

- Then publish the package using the following command: `NPM_TOKEN=${NPM_TOKEN} npm publish`

> N.B.: you need to replace `${NPM_TOKEN}` with a valid npm token

- Once the new version is published, add a new release in GitHub; https://github.com/prettier-solidity/prettier-plugin-solidity/releases/new

- The tag version and the name should be prefixed by a `v` followed by the latest published version number; e.g.: `v1.0.0-beta.4`

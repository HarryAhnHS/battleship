# Webpack Template
Template with basic webpack.config.js setup, package.json dependencies, and other config files. 

## CLI Setup 
### Basic Setup
```
npm init -y
```
```
npm install webpack webpack-cli --save-dev
```

### html-webpack-plugin
```
npm install --save-dev html-webpack-plugin
```

### CSS Loader (https://webpack.js.org/guides/asset-management/#setup)
```
npm install --save-dev style-loader css-loader
```

### CSV/Tabular Date Loader
```
npm install --save-dev csv-loader
```

### Eslint (https://eslint.org/docs/latest/use/getting-started)
```
npm init @eslint/config@latest
```

### Prettier Resolution (Optional but recommended) (https://github.com/prettier/prettier-vscode)
```
npm install prettier -D --save-exact
```

### Babel-loader (https://github.com/babel/babel-loader)
```
npm install -D babel-loader @babel/core @babel/preset-env webpack
```

Jest
```npm i --save-dev jest```

Build
```npm run build```
### NPM Scripts:
- ```npm run build```
- ```npm run start```

### Deploying 'dist' subdirectory to Github Pages (https://gist.github.com/cobyism/4730490)
```
npm run build
```
```
git add dist && git commit -m "Dist subtree commit"
```
```
git subtree push --prefix dist origin gh-pages
```



## Resources: 
### Odin
https://www.theodinproject.com/lessons/node-path-javascript-es6-modules
https://www.theodinproject.com/lessons/node-path-javascript-webpack
https://www.theodinproject.com/lessons/node-path-javascript-linting
https://www.theodinproject.com/lessons/node-path-javascript-what-is-es6




# {SLUSH{=name}}({SLUSH{=url}})

> {SLUSH{=description}}


## Setup

```sh
$ npm run build && npm start
```


## Useful commands

Prints all available top-level gulp tasks / commands.

```shell
$ gulp
```

Builds, starts watch tasks, and launches the dev server.

```shell
$ gulp develop
```

Builds all files, as for a release

```shell
$ gulp build
```

Simple tests:

```shell
$ npm test
```

Put your website somewhere people can see it!*

```shell
$ gulp deploy
```

> *This uses the Webhook deploy process -- you should have already created
  a site in this folder.

> `--target` flag sets a flag for either `staging` (default) or `production`.
If you provided a `staging_url` in the config file, that will be used in staging
deployments.

## Directory structure

* `sprites` place `svg` files you would like automatically compiled into an svg
  sprite stack. Subfolders are used to make separate stacks, e.g. `icons` becomes
  `icons.stack.svg`

* `images` static images (backgrounds, etc) that you want optimized.

* `scripts` client-side JS, to be compiled with Webpack. Code style dictates
  use of ES6 (all files are transpiled using babel).

* `styles` all site styles, written in SCSS, with some PostCSS thrown in.

* `pages` where your page templates live. These get converted into site pages.
  Uses Webhook-flavored swig. You can also place files here that you want 
  copied directly to the output directory.

* `templates` supporting template files.

* `tasks` are all the gulp tasks for the project. caveat lector


{SLUSH{ if (github) { }}
## Collaborating with git

Create your git repository in Github. Don't add any default files.

```shell
$ git init
$ git remote add origin https://github.com/{SLUSH{=github}}.git
$ git add .
$ git commit -am "Initial commit"
$ git branch --set-upstream-to=origin/master
$ git pull --rebase
$ git push origin master
```
{SLUSH{ } }}

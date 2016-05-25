# slush-webhook ![npm release](https://img.shields.io/npm/v/slush-webhook.svg?style=flat)

This generator is the starting point for a [Webhook](https://github.com/webhook/webhook)-based
website. It contains all the modules, boilerplate, and built-in process to get
you started building and deploying a full website.

> Created by [Ronik Design](http://www.ronikdesign.com) and used to speed up internal development.


## Features

* Scaffold [Webhook](http://webhook.com) projects.
* Deploy staging sites easily to S3 (requires a properly configured AWS account. The easiest approach here is probably `brew install awscli` then `aws configure`)
* Choose from one of three frameworks, all using [ES6](http://babeljs.io) and [webpack](http://webpack.github.io)
  * Starter Kit — uses Knockout.js, a robust set of SCSS and PostCSS tools, and more
  * Bootstrap — installs Bootstrap and all its dependencies, in a friendly hackable way
  * Blank — just the process setup, and a few polyfills.
* Automatic SVG sprite generation.
* Image optimization.
* Gulp-based build tools.


## Getting started

Install your global dependencies.

```sh
$ npm install -g slush slush-webhook
```


## Webhook installation

```sh
$ npm install -g wh grunt-cli
```

If this is a totally new Webhook project, create your Webhook site, then run:

```sh
$ wh create [sitename]
$ cd [sitename]
$ slush webhook
```

> Warning! Slush uses conflict resolution and allows you to reject overwriting
files, BUT you could very easily overwrite something you care about as it spews
a bunch of files and folders into your current directory and merges with your
package.json. Be careful, try it out first on something you don't care about,
commit or backup first. But also, feel free to run it again and again.


## Working with your site

You'll find documentation within the newly-created site's README that offers
more detail, but the basics are as follows.

Develop your site, watching files for changes and updating on the fly:

```sh
gulp develop
```

This launches Gulp watchers and the Webhook local dev server. The browser 
will reload when the html, css or js changes.

Deploy your site to Webhook:

```sh
gulp deploy --target=production
```

Or, deploy it to a staging S3 bucket (if configured):

```sh
gulp deploy --target=staging --production
```

This will deploy the site to an S3 bucket with a name derived from your `staging_url`
if it exists, otherwise, from your `url`. 


## Getting To Know Slush

Slush is a tool that uses Gulp for project scaffolding.

Slush does not contain anything "out of the box", except the ability to locate installed slush generators and to run them with liftoff.

To find out more about Slush, check out the [documentation](https://github.com/klei/slush).

## Contributing

See the [CONTRIBUTING Guidelines](https://github.com/ronik-design/slush-website/blob/master/CONTRIBUTING.md)

## Support
If you have any problem or suggestion please open an issue [here](https://github.com/ronik-design/slush-website/issues).

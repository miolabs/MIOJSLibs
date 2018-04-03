# MIOJSLibs Docs

In order to see the big picture I have started from minima theme, to be able to completely restructure the page, not just override everything.

## Jekyll

The documentation is built with [Jekyll](https://jekyllrb.com/).
You can find the [installation guide](https://jekyllrb.com/docs/installation/) and the [troubleshooting](https://jekyllrb.com/docs/troubleshooting/) page in the official docs.

After that to start the develop server, you can run `jekyll serve`. To build the site you can run the build script in scripts.

## Site structrure

### Pages

The pages are located in the `docs` folder. The version number is in `_config.yml` file `docs_version`, it determines which folder is used to load the pages. It will load the pages that are present in `_data/nav.yml` file, in that order.

### Layouts

Refers to files within the `_layouts` directory, that define the markup for your theme.

  - `default.html` &mdash; The base layout that lays the foundation for subsequent layouts. The derived layouts inject their contents into this file at the line that says ` {{ content }} ` and are linked to this file via [FrontMatter](https://jekyllrb.com/docs/frontmatter/) declaration `layout: default`.
  - `home.html` &mdash; The layout for your landing-page / home-page / index-page. [[More Info.](#home-layout)]
  - `page.html` &mdash; The layout for your documents that contain FrontMatter, but are not posts.
  - `post.html` &mdash; The layout for your posts.
  - `docs.html` &mdash; The layout of the documentation pages.

### Includes

Refers to snippets of code within the `_includes` directory that can be inserted in multiple layouts (and another include-file as well) within the same theme-gem.

  - `disqus_comments.html` &mdash; Code to markup disqus comment box.
  - `footer.html` &mdash; Defines the site's footer section.
  - `google-analytics.html` &mdash; Inserts Google Analytics module (active only in production environment).
  - `head.html` &mdash; Code-block that defines the `<head></head>` in *default* layout.
  - `header.html` &mdash; Defines the site's main header section. By default, pages with a defined `title` attribute will have links displayed here.

### Sass

Refers to `.scss` files within the `_sass` directory that define the theme's styles.

  - `theme.scss` &mdash; The core file imported by preprocessed `main.scss`, it defines the variable defaults for the theme and also further imports sass partials to supplement itself.

### Assets

Refers to various asset files within the `assets` directory.
Contains the `main.scss` that imports sass files from within the `_sass` directory. This `main.scss` is what gets processed into the theme's main stylesheet `main.css` called by `_layouts/default.html` via `_includes/head.html`.

This directory can include sub-directories to manage assets of similar type, and will be copied over as is, to the final transformed site directory.

### Plugins

Refers to code within the `_plugins` directory. It will load these ruby codes. They can be used in the markdown pages.

  - `example.rb` &mdash; Presents a preview for examples. Usage:
  ```liquid
  {% example html %}
  <p class="welcome" style="background-color: red">
    Hello, World!
  </p>
  {% endexample %}
  ```

## Usage

### Change the syntax highlighting color

In `_config.yml` change `highlight-style` property to the desired color from `assets/syntax-highlight`. You only need to use the name. It will be injected to the layout with the path and the extensison.

### Change default date format

You can change the default date format by specifying `site.minima.date_format`
in `_config.yml`.

```
# Minima date format
# refer to http://shopify.github.io/liquid/filters/date/ if you want to customize this
minima:
  date_format: "%b %-d, %Y"
```

--

### Enabling comments (via Disqus)

Optionally, if you have a Disqus account, you can tell Jekyll to use it to show a comments section below each post.

To enable it, add the following lines to your Jekyll site:

```yaml
  disqus:
    shortname: my_disqus_shortname
```

You can find out more about Disqus' shortnames [here](https://help.disqus.com/customer/portal/articles/466208).

Comments are enabled by default and will only appear in production, i.e., `JEKYLL_ENV=production`

If you don't want to display comments for a particular post you can disable them by adding `comments: false` to that post's YAML Front Matter.

--

### Enabling Google Analytics

To enable Google Anaytics, add the following lines to your Jekyll site:

```yaml
  google_analytics: UA-NNNNNNNN-N
```

Google Analytics will only appear in production, i.e., `JEKYLL_ENV=production`

--

## Development

To set up your environment to develop, run `script/bootstrap`.

To test your work, run `script/server` (or `bundle exec jekyll serve`) and open your browser at `http://localhost:4000`. This starts a Jekyll server using your site and the contents. As you make modifications, your site will regenerate and you should see the changes in the browser after a refresh.

## Publish

Github provides a way to host static sites in [github page](https://pages.github.com/). All you need to do is to publish the generated site into the `gh-pages` branch in your github repository.

If you run the build command it will generrate the static pages into `_site` directory. I have added that folder to `.gitignore` so the contact will be only available locally and in the `gh-pages` branch if you publish it.

In `init_empty_gh` you can see the steps how I created the `gh-pages` branch. After it has been created you can it for your working directory with `get_ghpages` (the script will delete the `_site` directory, and create a worktree in the site directory. If you navigate to that folder you will see that that branch has been checked out there)

You can publish the current state of the `_site` directory with the `publish` script.

## License

The theme is available as open source under the terms of the [MIT License](http://opensource.org/licenses/MIT).

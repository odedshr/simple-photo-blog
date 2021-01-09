# Simple-photo-blog

Simple-photo-blog allows you to create a super easy to update static-server blog: copy your photo and double-click the app to upload.

Why is it useful?
Albeit setup might be slight tricky this would allow non-tech bloggers *easily* maintain a blog on a *free*-hosting service. Sure, there are plenty of Static-site generators that should do pretty much the same thing, but these will require the blogger to write `MarkDown` code which might not be trivial for everyone.

## Installation

To install the module, run

```bash
npm install --save-dev simple-photo-blog
```

For contributing to the development, fork the [GitHub repository](https://github.com/odedshr/simple-photo-blog).

## Usage

Add the following line to you `package.json`, at the `scripts` section:

```json
  'upload': 'node node_modules/simple-photo-blog/dist/index'
```

and then run:

```bash
  npm run upload
```

Alternatively you can download the executables for MAC, Windows or Linux; place the file in your project root folder and run it from there.

## Uploading a post

1. Create a new folder in the `source` folder, name it with the same name you would like for your post;
2. Put your images and texts inside the folder;
3. Run the upload app;

There are few more tricks you can pull but we'll get to that soon enough.

## Configuration

When running the app for the first time, it will automatically create a configuration file, if one didn't exist before. The file is called `blog-config.yaml`:

```yaml
  source: src
  target: www
  indexTemplate: src/index-template.html
  postTemplate: src/post-template.html,
  order: ascending,
  maxImageDimension: 0,
  versionFile: package.json
  execute: git add . && git commit - a - m "💬 blog update `date`" && git push
```

`source` is the folder containing your original files. Each post should be in a separate folder inside the source folder.

`target` is where the posts will be compiled and the html files will be created.

`indexTemplate` is the file that is going to be used as the list of all the posts. If the template file doesn't exists a default version will be created automatically and you can customize it to fit your needs, while keeping the comments that will later be replaced by the generated with real content.

`postTemplate` is the file that is going to be used per post and will contain all the relevant images and texts. If the template file doesn't exists a default version will be created automatically and you can customize it to fit your needs, while keeping the comments that will later be replaced by the generated with real content.

`order` determines the order of the posts in the index page. it can be `ascending` or `descending`.

`maxImageDimension` can automatically resize your images to fit the size provided (in pixels) as web photos normally don't need to be bigger than a screen size. If you don't wish to resize your images you can set the value to `0` or remove the line entirely.

`versionFile` is an optional parameter that points to a JSON file that has a `version` number. When the parameters points to such file, the version number will be automatically incremented by one. If the number  has decimal points, right right-most value will be updated (for example `1.2.3` will be updated to `1.2.4`)

`execute` is an optional parameter that will execute a shell command once the compilation is completed. The default config provides an example (simply remove the word "Example" to make it operational) for how to upload your changes to a git repository, but similarly you can set it to upload to an FTP server or simply copy it to a different folder.

## Tips and Tricks

### Folders without images aren't posts

A post must have at least one image or a video (that is needed for the homepage), else it will be ignored by the compiler.

### Text Content

To add texts to your posts, simply add texts files inside the post's folder. The file can be `txt`, `html`, or `md` ([MarkDown](https://en.wikipedia.org/wiki/Markdown)).

### Image ALT and Caption

Image name will be used as their ALTernative description.
To add a caption to the image, create a text file (in any format) with the example same name as the image.
For example `image.jpg` will have its caption at `image.jpg.txt` (note the two extensions in the caption filename).

### File order is the post's order of content

A post elements (images, videos and texts) will appears according to their respective file alphabetical ascending order. So one simple way to enforce a particular order is by adding numbers (with a padding zero else "10" will come before "2") at the beginning of the filenames.
If an image as a number as its first "word", these number will be excluded from the ALT description. For example the ALT text for "01 my cat.jpg" would simply be "my cat".

### Folder name

A folder name start with specifying the publication date in `yyyy-mm-dd` format and that won't be part of the post actual name (for example "2020-03-15 Lockdown" will result with a post named "Lockdown" and the publication date of 15th March 2020)

Additionally, you can add hashtags at the end of the folder name and they'll be extracted (e.g. "Lockdown #staySafe" will result with a post named "Lockdown" with the mentioned hashtags). The Hashtags appear at the index page although currently there's no filtering implemented.

### Video links

In addition to simply adding video files (`mov`, `avi`, `mp4`, `mkv` and `mpg`) you can also neatly link to a video from a different hosting by adding a text file with the suffix `.video.txt` (for example `03 cat.video.txt`) with a full http link as content and that will appear just like other videos.
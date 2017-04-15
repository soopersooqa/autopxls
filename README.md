# AutoPXLS - wow edition
This fork is a customized edition of original AutoPXLS. Advanced ban bypass, combo of 2 algorithms (nope, p0358, that was my own idea), image dithering option (for 11/10 color accordance), image preview, etc.

>** WARNING: Yep, be careful while using scripts at pxls.space - this may result a ban. Use at your own risk, blah, blah **

## Options
You can tweak the script's behaviour using options (placed right in launcher part)

### Local (individual for every image)
>**algo**: "random"/"line" - algorithm select

>**mode**: "v"/"h" - vertical/horizontal mode in line algorithm

>**convert**: 0/1 - image dithering

>**show**: 0/1 - image preview

### Global (for entire script)
>**cooldown**: >0 - delay between timer checks (choose based on cooldown between pixels)

>**debug**: 0/1 - 0 is default behavior; 1 - only convert, don't draw

## Usage
### Basic example (dev console)
```javascript
window.App.saveImage = document.createElement('script');
window.App.saveImage.src = "https://cdn.rawgit.com/moondarker/autopxls/master/autopxls.js";
window.App.saveImage.onload = function () {
  var images = [
    {
      title: "Lion",
      x: 0,
      y: 0,
      image: "http://i.imgur.com/GjDrHlC.jpg",
      algo: "random",
      mode: "v",
      convert: 1,
      show: 1
    }
  ];
  var params = {
    cooldown: 100, 
    debug: 0
  };
  window.App.saveImage(images, params.cooldown, params.debug);
  this.parentElement.removeChild(this);
};
document.head.appendChild(window.App.saveImage);
```
It is pretty self-explainatory, you basically need to replace `x`, `y`, `title` and `image` values with your own.
Then, you may edit the `algo`, `mode`, `convert`, `show`, `cooldown` and `debug` values (check "options" section). 
After values adjust - execute the script in your browser dev console

### Basic example (userscript)
Just copy the script from `userscript.js` and save it in your favourite userscript manager (Ex.: ***Tampermonkey***).
Now, you may use it just as template script (replace domain and IMGURLHERE, STARTXHERE, STARTYHERE to your own values):
```
yetanotherpxlssite.space/?template=IMGURLHERE&ox=STARTXHERE&oy=STARTYHERE
```

Here is an example:
```
pxls.space/?template=http://i.imgur.com/hzOE8oD.png&ox=13&oy=37
```

### Multiple images
Here's an example with 2 images, delay set to `50` ms, `1st` image `will be` converted using Sierra dithering algorithm and then drawn using `random` algorithm, `2nd` `will not be` converted, and will be drawn using `line` algorithm:
```javascript
window.App.saveImage = document.createElement('script');
window.App.saveImage.src = "https://cdn.rawgit.com/moondarker/autopxls/master/autopxls.js";
window.App.saveImage.onload = function () {
  var images = [
    {
      title: "Lion",
      x: 0,
      y: 0,
      image: "http://i.imgur.com/GjDrHlC.jpg",
      algo: "random",
      mode: "v",
      convert: 1,
      show: 1
    },
    {
      title: "DogeP",
      x: 200,
      y: 0,
      image: "http://i.imgur.com/jwUsSCU.png",
      algo: "line",
      mode: "h",
      convert: 0,
      show: 1
    },
  ];
  var params = {
    cooldown: 50, 
    debug: 0
  };
  window.App.saveImage(images, params.cooldown, params.debug);
  this.parentElement.removeChild(this);
};
document.head.appendChild(window.App.saveImage);
```
Remember about the commas delimetering image objects!

## Special thanks
Thanks to:
* /r/place and pxls.space - for wasting our time ^^
* dd7531 - for original script
* p0358 - for README.md structure
* my laziness - for wasting my time on this script instead of pixel placing
window.App.saveImage = 
 function (images, cooldown, debug) {
     
  if (typeof images != "object") {
    window.App.elements.board[0].toBlob(function(a) {
      var b = window.URL.createObjectURL(a),
          c = document.createElement("a");
          c.href = b;
          c.download = "pxls_screenshot.png";
          c.click();
          window.URL.revokeObjectURL(a)
        })
    return undefined;
  }
  
  function callToWinSke() {                             //Nerf this, xSke!
    var iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    var newWindow = iframe.contentWindow;
    iframe.parentNode.removeChild(iframe);
    return newWindow;
  }

  function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }

  images = shuffle(images);
  
  //----------------------------------------------------------------
  
  var cleanWindow = callToWinSke();
  
  window.clearInterval = cleanWindow.clearInterval;
  window.setInterval = cleanWindow.setInterval;
  
  for (var i = 1; i < 99999; i++) { //Oh my god, thats very dirty, but xSke started this war.
    window.clearInterval(i);
  }
  
  window.setInterval(window.App.updateTime.bind(window.App), 1E3);
  
  //----------------------------------------------------------------
  
  if (Notification.permission !== "granted")
    Notification.requestPermission();

  var om = App.socket.onmessage,
      coold = cooldown;

  App.socket.onmessage = function(message){
    var m = JSON.parse(message.data);

    if (m.type == "captcha_required" && cooldown < 20000) {
      cooldown = 20000;
      setTimeout (function() {cooldown = coold;}, 1000);

      if (Notification.permission !== "granted")
        Notification.requestPermission();
      else {
        var notification = new Notification('Notification title', {
          body: "Hey there! Enter the captcha! 20s left!",
        });
      }
      console.log('ReCaptcha Request hooked! You have 20s to enter the captcha.');
    }

    om(message);
  }

  //----------------------------------------------------------------

  var Painter = function(config){
    var board = document.getElementById("board").getContext('2d');
    var title = config.title || "unnamed";

    var img = new Image();
    img.crossOrigin = "anonymous";
    img.src = config.image;
    var x = config.x;
    var y = config.y;
    var mode = config.mode;
    var algo = config.algo;
    var convert = config.convert;
    var show = config.show;

    var counter = [0,0];

    var canvas = document.createElement('canvas');
    var done = 0;
    var image;

    var image_loaded_flag = false;

    var colors = [
      [255,255,255],
      [228,228,228],
      [136,136,136],
      [34,34,34],
      [255,167,209],
      [229,0,0],
      [229,149,0],
      [160,106,66],
      [229,217,0],
      [148,224,68],
      [2,190,1],
      [0,211,221],
      [0,131,199],
      [0,0,234],
      [207,110,228],
      [130,0,128]
    ];

    function rgb2lab(rgb) {   
        r = rgb[0] / 255; g = rgb[1] / 255; b = rgb[2] / 255;
        
        r = (r > 0.04045 ? Math.pow(((r + 0.055) / 1.055), 2.4) : r / 12.92) * 100;
        g = (g > 0.04045 ? Math.pow(((g + 0.055) / 1.055), 2.4) : g / 12.92) * 100;
        b = (b > 0.04045 ? Math.pow(((b + 0.055) / 1.055), 2.4) : b / 12.92) * 100;
        
        var x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 95.047,
            y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 100.000,
            z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 108.883;
        
        x = (x > 0.008856 ? Math.pow(x, 1/3) : 7.787*x+16/116);
        y = (y > 0.008856 ? Math.pow(y, 1/3) : 7.787*y+16/116);
        z = (z > 0.008856 ? Math.pow(z, 1/3) : 7.787*z+16/116);
      
        return {L: (116 * y) - 16, A: 500 * (x - y), B: 200 * (y - z)}
    }
    
    function dECompare(c1, c2) {
      var sqrt = Math.sqrt,
          pow = Math.pow;
          //result = sqrt(pow(c2.L-c1.L, 2) + pow(c2.A-c1.A, 2) + pow(c2.B-c1.B, 2));

      //console.log(result);
      return sqrt(pow(c2.L-c1.L, 2) + pow(c2.A-c1.A, 2) + pow(c2.B-c1.B, 2));
    }

    function getColorId(pixel, coords){
      if (typeof coords != "undefined" && coords != 0) pixel = image.getImageData(coords["x"], coords["y"], 1, 1).data;

      var color_id = -1;
      var score = 768;
 
      colors.forEach(function(item, i) {
        var scrnow = Math.abs(pixel[0] - item[0]) + Math.abs(pixel[1] - item[1]) + Math.abs(pixel[2] - item[2]);
        //var scrnow = dECompare(rgb2lab(item), rgb2lab([pixel[0], pixel[1], pixel[2]]));
        if (scrnow < score) {
          score = scrnow;
          color_id = i;
        }
      });
      
      return color_id;
    }

    function isSamePixelColor(coords) {
      var board_pixel = board.getImageData((parseInt(x) + parseInt(coords["x"])), (parseInt(y) + parseInt(coords["y"])), 1, 1).data;
      var image_pixel = image.getImageData(coords["x"], coords["y"], 1, 1).data;

      if (image_pixel[3] <= 127) return true;

      if (getColorId(board_pixel) != getColorId(image_pixel)) return false;
      return true;
    }

    function tryToDraw(){
      function randomInteger(min, max) {
        var rand = min - 0.5 + Math.random() * (max - min + 1)
        rand = Math.round(rand);
        return rand;
      }
      
      function doDraw(coords) {
        var color_id = getColorId(0, coords);
        
        console.log("Drawing " + title + " coords" + " x:" + (parseInt(x) + parseInt(coords["x"])) + " y:" + (parseInt(y) + parseInt(coords["y"])) + ", \"" + algo + "\" algorithm.");

        App.switchColor(color_id);
        App.attemptPlace ( (parseInt(x) + parseInt(coords["x"])), (parseInt(y) + parseInt(coords["y"])) );
        return 20;
      }

      function integrityCheck() {
        var damage = 0;
        
        for (var _y = 0; _y < canvas.height; _y++) {
          for (var _x = 0; _x < canvas.width; _x++) {
            var coords = {x: _x, y: _y};

            if(!isSamePixelColor(coords)) damage++;
          }
        }
        
        if (damage != 0) {console.log("Switching algo to \"random\", damage: " + damage + "px"); algo = "random"; return 20}
      }
      
      if (counter[1] > 5) {
        console.log("Switching algo to \"random\", \"line\" counter: " + counter[1]);
        counter[1] = 0;
        algo = "random";
      }
      
      if (algo == "line") {
        if (mode == "v") var edges = [canvas.width, canvas.height]
        else var edges = [canvas.height, canvas.width];

        for (var _x = 0; _x < edges[0]; _x++) {
          for (var _y = 0; _y < edges[1]; _y++) {
            if (mode == "v") var coords = {x: _x, y: _y};
            else var coords = {x: _y, y: _x};

            if(!isSamePixelColor(coords)){
              if (done == 1) counter[1]++;
              return doDraw(coords);
            }
          }
        }
        
        algo = "check";
        
      } else if (algo == "random") 
       while (true) {
        
        _x = randomInteger(0, canvas.width);
        _y = randomInteger(0, canvas.height);
        
        var coords = {x: _x, y: _y};

        if (isSamePixelColor(coords)) {
          counter[0]++;
        } else {
          counter[0] = 0;
          return doDraw(coords);
        }
        
        if (counter[0] > 50000) {
          console.log("Switching algo to \"line\", repeatcounter: " + counter[0]);
          algo = "line";
          return 20;
        }
      } else {
        return integrityCheck();
      }
      console.log(title + " is correct.");
      done = 1;
      return -1;
    }

    function drawImage(){
      if(image_loaded_flag){
        return tryToDraw();
      }
      return -1;
    }

    function isReady(){
      return image_loaded_flag;
    }
    
    function doConvertion(contype) {
      var start = new Date;
      console.log('Converting ' + title + ', this may take up to 30 seconds.');
      
      var tmpPArr = [];
      
      function normColor(rgb) {
        var num = 0,
            scr = 1024;
        
        colors.forEach(function(item, index, array) {
            var curscr = dECompare(rgb2lab(rgb), rgb2lab(item));
            
            if (curscr < scr) {
                scr = curscr;
                num = index;
            };
        });
        
        return colors[num];
      }

      for (var y = 0; y < canvas.height; y++) {
          var newStr = [];
          //newStr[-1] = [255, 255, 255]; //Костыль
            
            for (var x = 0; x < canvas.width; x++) {
                var pixel = image.getImageData(x, y, 1, 1).data,
                    r = pixel[0],
                    g = pixel[1],
                    b = pixel[2],
                    a = pixel[3];
                    
              newStr[x] = [r, g, b, a];
          }
            
          tmpPArr.push(newStr);
      }
      
      if (contype == 1) {
        console.log("Converted in. Now dithering.");
        for (var x = 0; x < canvas.width; x++) {
          for (var y = 0; y < canvas.height; y++) {
            if (tmpPArr[y][x][3] >= 127) {
              var rc = normColor(tmpPArr[y][x]);     // real (rounded) color
                
              for (var z = 0; z < 3; z++) {
                /*
                Sierra Dithering from http://www.tannerhelland.com/4660/dithering-eleven-algorithms-source-code/
                        X   5   3
                2   4   5   4   2
                    2   3   2
                      (1/32)
                */
                  var cc = tmpPArr[y][x][z],              // current color
                      rcz = rc[z];
                  var err = cc-rcz;              // error amount
                  tmpPArr[y][x][z] = rcz;                  // saving real color
                  if (x + 1 < canvas.width)   tmpPArr[y][x+1][z] += (err*5)>>5;  // if right neighbour exists
                  if (x + 2 < canvas.width)   tmpPArr[y][x+2][z] += (err*3)>>5;  // if right+1 neighbour exists
                  if (y + 1 == canvas.height) continue;   // if we are in the (pre)last line
                  if (x > 1)                  tmpPArr[y+1][x-2][z] += (err*2)>>5;  // bottom left-1 neighbour
                  if (x > 0)                  tmpPArr[y+1][x-1][z] += (err*4)>>5;  // bottom left neighbour
                                              tmpPArr[y+1][x][z] += (err*5)>>5;  // bottom neighbour
                  if (x + 1 < canvas.width)   tmpPArr[y+1][x+1][z] += (err*4)>>5;  // bottom right neighbour
                  if (x + 2 < canvas.width)   tmpPArr[y+1][x+2][z] += (err*2)>>5;  // bottom right+1 neighbour
                  if (y + 2 == canvas.height) continue;   // if we are in the last line
                  if (x > 0)                  tmpPArr[y+2][x-1][z] += (err*2)>>5;  // bottom+1 left neighbour
                                              tmpPArr[y+2][x][z] += (err*3)>>5;  // bottom+1 neighbour
                  if (x + 1 < canvas.width)   tmpPArr[y+2][x+1][z] += (err*2)>>5;  // bottom+1 right neighbour
              }
            }
          }
        }
        console.log("Dithering done. Writing back to canvas...");
      } else {
        console.log("Pre-indexing started.");
        for (var y = 0; y < canvas.height; y++) {
          for (var x = 0; x < canvas.width; x++) {
            tmpPArr[y][x] = normColor(tmpPArr[y][x]);
          }
        }
        console.log("Pre-indexing done. Writing back to canvas...");
      }
      
      for (var y = 0; y < canvas.height; y++) {
          var newStr = tmpPArr[y];
            
          for (var x = 0; x < canvas.width; x++) {
              var imgData = image.getImageData(x, y, 1, 1);
              
              imgData.data[0] = Math.floor(newStr[x][0]);
              imgData.data[1] = Math.floor(newStr[x][1]);
              imgData.data[2] = Math.floor(newStr[x][2]);
              
              image.putImageData(imgData,x,y);
          }
      }

      console.log("Converting done in: " + (new Date - start) + " ms.");
      tmpPArr = [];
      if (typeof debug != "undefined" && debug != 1) {
        console.log("Starting draw sequence.");
        return true;
      } else return false;
    }

    img.onload = function(){
      canvas.width = img.width;
      canvas.height = img.height;
      image = canvas.getContext('2d');
      image.drawImage(img, 0, 0, img.width, img.height);

      if (typeof show != "undefined" && show >= 1) {
        var bc = document.querySelector(".bubble-container"), 
            addStyle = {};

        tText = document.createElement('div');
        tText.appendChild(document.createTextNode(title));
        tText.style.display = 'none';

        tDiv = document.createElement('div');
        tDiv.id = title + "Preview";
        tText.id = title + "Text";
        canvas.id = title + "Canvas";

        if (bc) {
          bc.appendChild(tDiv);
          Object.assign(tDiv.style, {
            position: "relative",
            zIndex: 5,
            margin: "8px",
            width: canvas.width + 32 + "px",
            cursor: "pointer"
          });
          tDiv.classList.add("bubble", "panel");
        } else {
          document.body.appendChild(tDiv);
          Object.assign(tDiv.style, {
            position: "relative",
            margin: "50px 8px 8px",
            padding: "8px 16px",
            backgroundColor: "rgba(0,0,0,0.7)",
            borderRadius: "8px",
            color: "#fff",
            textAlign: "center",
            zIndex: 5,
            width: canvas.width + 32 + "px",
            cursor: "pointer"
          });
        }
        
        tDiv.appendChild(canvas);
        tDiv.appendChild(tText);

        Object.assign(canvas.style, {
          opacity: 0.8,
          margin: "5px 0px 0px"
        });

        tDiv.onclick = function() {
          var tElem = document.querySelector("#" + title + "Canvas"),
              tText = document.querySelector("#" + title + "Text"),
              tObj = document.querySelector("#" + title + "Preview");
          tElem.style.display = (tElem.style.display == 'none') ? '' : 'none';
          tText.style.display = (tElem.style.display == 'none') ? '' : 'none';
          tObj.style.width = (tElem.style.display == 'none') ? '128px' : tElem.width + 32 + 'px';
        }
      }

      if (convert == 1) setTimeout (function () {image_loaded_flag = doConvertion(1)}, 1000)
       else setTimeout (function () {image_loaded_flag = doConvertion(0)}, 1000);
    };

    return {
      drawImage: drawImage,
      isReady: isReady
    }
  };


  var painters = [];
  for (var i = 0; i < images.length; i++) {
    painters[i] = Painter(images[i]);
  }

  function draw() {
    var rndtmr = Math.floor((Math.random() * 30) + 1) * 100;
    var timer = (App.cooldown-(new Date).getTime())/1E3;

    if (typeof cooldown != "undefined") {
      rndtmr = cooldown;
    }

    if (0 < timer) {
      if (cooldown > 500) console.log("timer: " + timer);
      setTimeout(draw, rndtmr);
    } else {
      for (var i = 0; i < painters.length; i++) {
        if (painters[i].isReady()) {
          var result = painters[i].drawImage();

          if (result > 0) {
            setTimeout(draw, rndtmr);
            return;
          } else {
            continue;
          }
        } else {
          continue;
        }
      }
      setTimeout(draw, 3000);
    }

    return;
  }

  draw();
}
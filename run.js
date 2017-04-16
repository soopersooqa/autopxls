// ============================================= configure and run ============
window.App.saveImage = document.createElement('script');
window.App.saveImage.src = "https://rawgit.com/Moondarker/autopxls/master/autopxls.js";
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
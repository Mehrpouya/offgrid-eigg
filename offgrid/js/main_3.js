
    var resizePID;

    function clearResize() {
      clearTimeout(resizePID);
      resizePID = setTimeout(function() { adjustSlides(); }, 100);
    }

    if (!window.addEventListener) {
      window.attachEvent("resize", function load(event) {
        clearResize();
      });
    } else {
      window.addEventListener("resize", function load(event) {
        clearResize();
      });
    }

    function adjustSlides() {
      var container = document.getElementById("slides_container"),
          slide = document.querySelectorAll('.selected_slide')[0];

      if (slide) {
        if (slide.offsetHeight+169+40 >= window.innerHeight) {

          var h = container.offsetHeight;

          slide.style.height = h-169+"px";
          slide.classList.add("scrolled");
        } else {
          container.style.bottom = "auto";
          container.style.minHeight = "0";

          slide.style.height = "auto";
          slide.classList.remove("scrolled");
        }
      }
    }

    var resizeAction = O.Action(function() {
      function imageLoaded() {
        counter--;

        if (counter === 0) {
          adjustSlides();
        }
      }
      var images = $('img');
      var counter = images.length;

      images.each(function() {
        if (this.complete) {
          imageLoaded.call( this );
        } else {
          $(this).one('load', imageLoaded);
        }
      });
    });

    function click(el) {
      var element = O.Core.getElement(el);
      var t = O.Trigger();

      // TODO: clean properly
      function click() {
        t.trigger();
      }

      if (element) element.onclick = click;

      return t;
    }
var map;
    O.Template({
      init: function() {
        var seq = O.Triggers.Sequential();

        var baseurl = this.baseurl = 'http://a{s}.acetate.geoiq.com/tiles/terrain/{z}/{x}/{y}.png';
        map =this.map=window.m = L.map('map').setView([0, 0.0], 4);
        var basemap = this.basemap = L.tileLayer(baseurl, {
          attribution: 'data OSM - map CartoDB'
        }).addTo(map);
L.mapbox.accessToken = 'pk.eyJ1IjoiamFtaWVqY3Jvc3MiLCJhIjoiRHRzNUhjVSJ9.JnWbgc2N6BeHHrqKTcIdXA#12/56.9192/-6.1464';
        L.mapbox.tileLayer('jamiejcross.jgnm97od').addTo(map);
        var layerUrl = 'http://edinb.cartodb.com/api/v2/viz/e1db56b0-4290-11e4-89fd-0e10bcd91c2b/viz.json';
//        cartodb.createVis('map', layerUrl);
      cartodb.createLayer(map, layerUrl).addTo(map)
//     cartodb.createVis('map', layerUrl)
//  .done(function(vis, layers) {
//    // layer 0 is the base layer, layer 1 is cartodb layer
//    // when setInteraction is disabled featureOver is triggered
//    layers[1].setInteraction(true);
//    layers[1].on('featureOver', function(e, latlng, pos, data, layerNumber) {
//      cartodb.log.log(e, latlng, pos, data, layerNumber);
//    });
//
//    // you can get the native map to work with it
//    // depending if you use google maps or leaflet
//    map = window.map= vis.getNativeMap();
//
//    // now, perform any operations you need
//    // map.setZoom(3)
//  });
  
        // enanle keys to move
        O.Keys().on('map').left().then(seq.prev, seq)
        O.Keys().on('map').right().then(seq.next, seq)

        click(document.querySelectorAll('.next')).then(seq.next, seq)
        click(document.querySelectorAll('.prev')).then(seq.prev, seq)

        var slides = O.Actions.Slides('slides');
        var story = O.Story()

        this.story = story;
        this.seq = seq;
        this.slides = slides;
        this.progress = O.UI.DotProgress('dots').count(0);
      },

      update: function(actions) {
        var self = this;

        if (!actions.length) return;

        this.story.clear();
         this._resetActions(actions);
      },

      _resetActions: function(actions) {
        // update footer title and author
        var title_ = actions.global.title === undefined ? '' : actions.global.title,
            author_ = actions.global.author === undefined ? 'Using' : 'By '+actions.global.author+' using';

        document.getElementById('title').innerHTML = title_;
        document.getElementById('author').innerHTML = author_;
        document.title = title_ + " | " + author_ +' Odyssey.js';

        var sl = actions;

        document.getElementById('slides').innerHTML = ''
        this.progress.count(sl.length);

        // create new story
        for(var i = 0; i < sl.length; ++i) {
          var slide = sl[i];

          var tmpl = "<div class='slide slide_"+i+"' style='diplay:none;'>";

          tmpl += slide.html();
          tmpl += "</div>";
          document.getElementById('slides').innerHTML += tmpl;

          this.progress.step(i).then(this.seq.step(i), this.seq)

          var actions = O.Parallel(
            this.slides.activate(i),
            slide(this),
            this.progress.activate(i),
            resizeAction
          );

          actions.on("finish.app", function() {
            adjustSlides();
          });

          this.story.addState(
            this.seq.step(i),
            actions
          )
        }

        this.story.go(this.seq.current());
      },

      changeSlide: function(n) {
        this.seq.current(n);
      }
    });
  
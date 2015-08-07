function OnScrollDiv(div) {
    console.log("Horizontal: " + div.scrollLeft
            + "px<br/>Vertical: " + div.scrollTop + "px");
}
var resizePID;


$(document).ready(function() {

});


function clearResize() {
    clearTimeout(resizePID);
    resizePID = setTimeout(function() {
        adjustSlides();
    }, 100);
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
        if (slide.offsetHeight + 169 + 40 >= window.innerHeight) {
            var h = container.offsetHeight;
            slide.style.height = h - 169 + "px";
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
            imageLoaded.call(this);
        } else {
            $(this).one('load', imageLoaded);
        }
    });
});


var embedVideo = O.Action(function() {

    if ($(".slide.selected iframe").length <= 0) {
        $(".slide.selected h6").each(function(_index) {
            var h6 = $(this);
            console.log(h6.text());
            h6.after(h6.text());
            h6.hide();
        });
    }
    $(".slide.selected ").scroll(function() {
        if(isScrolledIntoView(".slide.selected iframe"))console.log("jalal khalegh!");
    });

});





function isScrolledIntoView(elem)
{
    var docViewTop = $(window).scrollTop();
    var docViewBottom = docViewTop + $(window).height();

    var elemTop = $(elem).offset().top;
    var elemBottom = elemTop + $(elem).height();

    return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
}

function click(el) {
    var element = O.Core.getElement(el);
    var t = O.Trigger();

    // TODO: clean properly
    function click() {
        t.trigger();
    }

    if (element)
        element.onclick = click;

    return t;
}
var map;
O.Template({
    init: function() {
        var seq = O.Triggers.Sequential();
        var width = 300;
        var height = 200;
        var baseurl = this.baseurl = 'http://a{s}.acetate.geoiq.com/tiles/terrain/{z}/{x}/{y}.png';
        window.map = map = this.map = L.map('map').setView([0, 0.0], 4);
        var basemap = this.basemap = L.tileLayer(baseurl, {
            attribution: 'data OSM - map CartoDB'
        }).addTo(map);
        L.mapbox.accessToken = 'pk.eyJ1IjoiamFtaWVqY3Jvc3MiLCJhIjoiRHRzNUhjVSJ9.JnWbgc2N6BeHHrqKTcIdXA#12/56.9192/-6.1464';
        L.mapbox.tileLayer('jamiejcross.jgnm97od').addTo(map);
        var layerUrl = 'http://edinb.cartodb.com/api/v2/viz/05d2e9a2-4291-11e4-b1f8-0edbca4b5057/viz.json';
//                cartodb.createVis('map', layerUrl);
        var user = "offthegrid",
                table = "story1_table",
                key = "d45e8f85040fb7fee369cb2d8b4e36952c833cea";
        cartodb.createLayer(map, layerUrl, {
            sql: "SELECT * FROM " + table,
            options: {
                table_name: table,
                user_name: user,
                extra_params: {
                    map_key: key
                }
            }
        }).addTo(map);


//        var overlay = new L.VideoOverlay([56.9000, -6.2267], {x: width, y: height}, {
//            src: 'http://player.vimeo.com/video/23482548?t=0m06s;autoplay=true;byline=0;title=0;portrait==;api=1&amp;player_id=player_1',
//            opacity: 0.7
//        });
//        map.addLayer(overlay);
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

        if (!actions.length)
            return;

        this.story.clear();
        this._resetActions(actions);
    },
    _resetActions: function(actions) {
        // update footer title and author
        var title_ = actions.global.title === undefined ? '' : actions.global.title,
                author_ = actions.global.author === undefined ? 'Using' : 'By ' + actions.global.author + ' using';

        document.getElementById('title').innerHTML = title_;
        document.getElementById('author').innerHTML = author_;
        document.title = title_ + " | " + author_ + ' Odyssey.js';

        var sl = actions;

        document.getElementById('slides').innerHTML = ''
        this.progress.count(sl.length);

        // create new story
        for (var i = 0; i < sl.length; ++i) {
            var slide = sl[i];

            var tmpl = "<div class='slide slide_" + i + "' style='diplay:none;'>";

            tmpl += slide.html();
            tmpl += "</div>";
            document.getElementById('slides').innerHTML += tmpl;

            this.progress.step(i).then(this.seq.step(i), this.seq)

            var actions = O.Step(
                    this.slides.activate(i),
                    slide(this),
//                    resizeAction,
                    this.progress.activate(i),
                    embedVideo

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
//  
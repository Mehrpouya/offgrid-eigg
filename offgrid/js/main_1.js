/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
$("#daysList li").click(function() {
    $("#daysList li").each(function(index) {
        $(this).removeClass("selected");
    });
    $(this).addClass("selected");
});
function daysClicked() {
    $(this).addClass("selected");
}

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


var resizePID;
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

function resizeWindow() {
    adjustSlides();
}

function adjustSlides() {
    var container = document.getElementById("slides_container"),
            slide = document.querySelectorAll('.selected_slide')[0];
    if (container && slide) {
        if (slide.offsetHeight + 80 + 40 + 160 >= window.innerHeight) {
            container.style.bottom = "160px";
            var h = container.offsetHeight;
            slide.style.height = h - 80 + "px";
        } else {
            container.style.bottom = "auto";
            container.style.minHeight = "0";
            slide.style.height = "auto";
        }
    }
}

var resizeAction = O.Action(function() {
    adjustSlides();

});
function torque(layer) {
    function _torque() {
    }

    _torque.reach = function(slide) {
        var i = slide.get('step').value;
        function formaterForRange(start, end) {
            start = start.getTime ? start.getTime() : start;
            end = end.getTime ? end.getTime() : end;
            var span = (end - start) / 1000;
            var ONE_DAY = 3600 * 24;
            var ONE_YEAR = ONE_DAY * 31 * 12;
            function pad(n) {
                return n < 10 ? '0' + n : n;
            }
            ;
            // lest than a day
            if (span < ONE_DAY)
                return function(t) {
                    return pad(t.getUTCHours()) + ":" + pad(t.getUTCMinutes());
                };
            if (span < ONE_YEAR)
                return function(t) {
                    return pad(t.getUTCMonth() + 1) + "/" + pad(t.getUTCDate()) + "/" + pad(t.getUTCFullYear());
                };
            return function(t) {
                return pad(t.getUTCMonth() + 1) + "/" + pad(t.getUTCFullYear());
            };
        }

        function getTimeOrStep(s) {
            var tb = layer.getTimeBounds();
            if (!tb)
                return;
            if (tb.columnType === 'date') {
                if (tb && tb.start !== undefined) {
                    var f = formaterForRange(tb.start, tb.end);
                    // avoid showing invalid dates
                    if (!_.isNaN(layer.stepToTime(s).getYear())) {
                        return f(layer.stepToTime(s));
                    }
                }
            } else {
                return s;
            }
        }

        function truncate(s, length) {
            return s.substr(0, length - 1) + (s.length > length ? '…' : '');
        }

        var parser = new DOMParser(),
                doc = parser.parseFromString(slide.html(), 'text/html');
        var l = i * $('.slider').width() / layer.options.steps,
                tooltip = ['<div class="slide-tip slide-tip-' + i + '" style="left:' + l + 'px">',
                    '<div class="tooltip">',
                    '<h1>' + getTimeOrStep(i) + '</h1>',
                    $(doc).find('h1').text(),
                    '</div>',
                    '</div>'].join("\n");
        $('.slider').append(tooltip);
        var $tip = $('.slide-tip-' + i + ' .tip'),
                $tooltip = $('.slide-tip-' + i + ' .tooltip'),
                w = $tip.width() / 2

        $tip.css({margin: -w});
        var t = O.Trigger({});
        function check(changes) {
            if (changes.step >= i - 2 && changes.step < i + 2) {
                t.trigger();
                if (!$tooltip.is(':visible')) {
                    $tooltip.fadeIn(150);
                }
            } else if (changes.step >= i + 2 && changes.step < i + 5) {
                setTimeout(function() {
                    $('.tooltip').fadeOut(150);
                }, 2000);
            }
        }
        ;
        layer.on('change:time', check);
        t.clear = function() {
            layer.off('change:time', check);
        }
        return t;
    }

    _torque.pause = function() {
        return O.Action(function() {
            layer.pause();
        });
    }

    _torque.play = function() {
        return O.Action(function() {
            layer.play()
        });
    }
    return _torque;
}
var g_currentSlide = 0;
O.Template({
    actions: {
        'insert time': function() {
            return "- step: " + this.torqueLayer.getStep()
        },
        'pause': function() {
            return "S.torqueLayer.actions.pause()";
        },
        'play': function() {
            return "S.torqueLayer.actions.play()";
        }
    },
    init: function() {
        var self = this;
        var baseurl = this.baseurl = 'http://a{s}.acetate.geoiq.com/tiles/terrain/{z}/{x}/{y}.png';
        var map = this.map = L.map('map', {zoomControl: false}).setView([0, 0.0], 4);
        L.mapbox.accessToken = 'pk.eyJ1IjoiamFtaWVqY3Jvc3MiLCJhIjoiRHRzNUhjVSJ9.JnWbgc2N6BeHHrqKTcIdXA#12/56.9192/-6.1464';
        L.mapbox.tileLayer('jamiejcross.jgnm97od').addTo(map);

//          click(document.querySelectorAll('.next')).then(seq.next, seq);
//        click(document.querySelectorAll('.prev')).then(seq.prev, seq);
//                    var basemap = this.basemap = L.tileLayer(baseurl, {
//                        attribution: 'data OSM - map CartoDB'
//                    }).addTo(map);
//01316504253 ruth winkle
        var seq = O.Triggers.Sequential();

        
        var slides = O.Actions.Slides('slides');
        var story = O.Story()

        this.map = map;
        this.story = story;
        this.seq = seq;
        this.slides = slides;
        O.Triggers.Keys().on('map').left().then(seq.next, seq)
        O.Triggers.Keys().on('map').right().then(seq.next, seq)

//        this.progress = O.UI.DotProgress('dots').count(0);
//        this.duration = '18';
//        var slides = this.slides = O.Actions.Slides('slides');
//        var story = this.story = O.Story();
//              var seq = O.Triggers.Sequential();
//             O.Triggers.Keys().on('map').left().then(seq.next, seq);
//      O.Triggers.Keys().on('map').right().then(seq.next, seq);

//        this.progress = O.UI.DotProgress('dots').count(0);
        this.progress = DotProgress('progress').count(10);
    },
    _resetActions: function(actions) {
        // update footer title and author
        var title_ = actions.global.title === undefined ? '' : actions.global.title,
                author_ = actions.global.author === undefined ? 'Using' : 'By ' + actions.global.author + ' using';
        document.getElementById('title').innerHTML = title_;
        document.getElementById('author').innerHTML = author_;
        document.title = title_ + " | " + author_ + ' Odyssey.js';
        document.getElementById('slides_container').style.display = "block";
        document.getElementById('slides').innerHTML = '';

        // first slide is the header, skip it
        for (var i = 0; i < actions.length; ++i) {
            var slide = actions[i];
            var tmpl = "<div class='slide' style='display:none'>"
            tmpl += slide.html();
            tmpl += "</div>";
            
            document.getElementById('slides').innerHTML += tmpl;
//            this.progress.step(i).then(this.seq.step(i), this.seq)
            var ac = O.Parallel(
                    O.Actions.CSS($("#slides_container")).addClass('visible'),
                    this.slides.activate(i),
                    slide(this),
                    this.progress.activate(i),
                    resizeAction
                    );
            if (!slide.get('step'))
                return;
            this.story.addState(
                    torque(this.torqueLayer).reach(slide),
                    ac
                    )
        }
        
        this.story.go(this.seq.current());
    },
    changeSlide: function(n) {
        this.seq.current(n);
    },
    update: function(actions) {
        var self = this;
        this.progress.count(actions.length);
        for (var i = 0; i < actions.length; i++) {

        }
        if ($("#slides_container").hasClass("visible")) {
            $("#slides_container").removeClass("visible");
        }


        if (this.baseurl && (this.baseurl !== actions.global.baseurl)) {
            this.baseurl = actions.global.baseurl || 'http://a{s}.acetate.geoiq.com/tiles/terrain/{z}/{x}/{y}.png';
            this.basemap.setUrl(this.baseurl);
        }

        if (this.duration && (this.duration !== actions.global.duration)) {
            this.duration = actions.global.duration || 18;
        }

        if (this.torqueLayer && ("http://" + self.torqueLayer.options.user + ".cartodb.com/api/v2/viz/" + self.torqueLayer.options.stat_tag + "/viz.json" !== actions.global.vizjson)) {
            this.map.removeLayer(this.torqueLayer);
            // hack to stop (not remove) binding
            this.torqueLayer.stop();
            $('.cartodb-timeslider').remove();
            $('.cartodb-legend-stack').remove();
            this.torqueLayer = null;
            this.created = false;
        }

        if (!this.torqueLayer) {
            if (!this.created) { // sendCode debounce < vis loader
                cdb.vis.Loader.get(actions.global.vizjson, function(vizjson) {
                    // find index for the torque layer
                    function torqueLayerIndex() {
                        for (var i = 0; i < vizjson.layers.length; ++i) {
                            if (vizjson.layers[i].type === 'torque')
                                return i;
                        }
                        return -1;
                    }
                    var torqueIndex = torqueLayerIndex();
                    if (torqueIndex >= 0) {
                        cartodb.createLayer(self.map, vizjson, {layerIndex: torqueIndex})
                                .done(function(layer) {
                                    self.map.fitBounds(vizjson.bounds);
                                    actions.global.duration && layer.setDuration(actions.global.duration);
                                    self.torqueLayer = layer;
                                    self.torqueLayer.stop();
                                    self.map.addLayer(self.torqueLayer);
                                    self.torqueLayer.on('change:steps', function() {
                                        self.torqueLayer.play();
                                        self.torqueLayer.actions = torque(self.torqueLayer);
                                        self._resetActions(actions);
                                    });
                                }).on('error', function(err) {
                            console.log("some error occurred: " + err);
                        });
                    }
                });
                this.created = true;
            }

            return;
        }

        this.story.clear();
        $('.slide-tip').remove();
        this._resetActions(actions);
        if (this.created) {
            this.torqueLayer.setDuration(actions.global.duration);
            this.torqueLayer.stop();
            $('.button').removeClass('stop');
        }
//        var textareaWidth = document.getElementById("textarea").scrollWidth;
//        document.getElementById("wrapper").style.width = textareaWidth + "px";

    }
});

function DotProgress(el) {
    var count = 0;
    var element = O.Core.getElement(el);

    function _progress() {
        return _progress;
    }

    function render() {
        var html = '<ul>';
//        html += '<li><i class="fa fa-angle-left arrowBig" onclick="prevStory()"></i></li>';
        for (var i = 0; i < count; ++i) {
            html += '<li><a href="#' + i + '" class="storyProgress" onclick="moveStory(this)" storyId="' + i + '" ><i class="fa fa-circle"></i></a></li>';
        }
//        html += '<li><i class="fa fa-angle-right arrowBig" onclick="nextStory()"></i></li>';
        html += "</ul>";
        element.innerHTML = html;
    }


    _progress.count = function(_) {
        count = _;
        render();
        return _progress;
    }

    // returns an action to activate the index
    _progress.activate = function(activeIndex) {
        return O.Action(function() {
            var children = element.children[0].children;
            for (var i = 0; i < children.length; ++i) {
                children[i].setAttribute('class', '')
            }
            children[activeIndex].setAttribute('class', 'active');
//            _obj.seq.current(activeIndex);
        });
    }
    _progress.clicked = function(activeIndex) {

    }

    return _progress;

}


function prevStory() {

    O.slides.activate(2);
}
function nextStory() {


}

function moveStory(_elem) {
    O.changeSlide(2);//('slides').activate(2);
}


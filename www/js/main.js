var map = null;

// the SITE and SITE_LABEL fields in this HTML will get replaced
var HTML = '<div class="money-block"> <h1 id="SITE-money"> <span class="dollar-sign">$</span><span class="total-dollars"></span><span class="total-cents"></span> </h1> <p class="label">SITE_LABEL</p> </div>';

// Keep track of the jQuery dom elements for each website that displays money
var $website_money_blocks = {};

// Used Google Maps color maker for this
var style = [ { featureType: "administrative", stylers: [ { visibility: "off" } ] },{ featureType: "landscape", stylers: [ { visibility: "off" } ] },{ featureType: "poi", stylers: [ { visibility: "off" } ] },{ featureType: "road", stylers: [ { visibility: "off" } ] },{ featureType: "water", elementType: "labels", stylers: [ { visibility: "off" } ] },{ featureType: "landscape", elementType: "geometry", stylers: [ { saturation: -75 }, { hue: "#00ffe6" }, { lightness: -100 } ] },{ featureType: "water", stylers: [ { hue: "#ffa200" }, { saturation: -100 }, { lightness: -65 } ] } ]

$(document).ready(function(){
    initialize();

    $('#datetime').text(getPrettyDateTime());
    setInterval(function(){
        $('#datetime').text(getPrettyDateTime());
    }, 1000);

    // create the money displays
    var container = $('#money');
    for(var k in CONFIG){
        if(CONFIG[k]['display_money']){
            var config = CONFIG[k];
            var id = k.replace(/\..*$/, '') // get rid of TLD
            // create HTML
            var html = HTML.replace("SITE", id);
            html = html.replace("SITE_LABEL", config['label']);
            container.append(html);

            // set text color and save element for later
            var $element = $('#' + id + '-money');
            var color = config['color'];
            $element.css('color', 'rgb(' + color.join(",") + ')');
            $website_money_blocks[id] = $element;
        }
    }
});

function initialize() {
    var center = new google.maps.LatLng(38, -97);
    var myOptions = {
        zoom: 3,
        center: center,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: true,
        styles: style
    }

    map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
    refreshMap();
    refreshMoney();
}

function refreshMap(){
    $.get('update.php?query=visitors', function(data){
        updatePoints(data);
        setTimeout(refreshMap, 1000);
    });
}

function refreshMoney(){
    $.get('update.php?query=money', function(data){
        updateMoney(data);
        setTimeout(refreshMoney, 1000);
    });
}

function updateMoney(data){
    var lines = data.split("\n");
    var sites = {};
    for(var i = 0; i < lines.length; i++){
        var parts = lines[i].split(",");
        var site = $.trim(parts[0]).replace(/\..*$/, ''); // remove tld
        var amount = $.trim(parts[1]);
        amount = amount.split(".");
        var dollars = amount[0];
        var cents = amount[1];
        sites[site] = [dollars, cents];
    }

    for(var k in $website_money_blocks){
        var dollars = "0";
        var cents = "00";
        if(k in sites){
            dollars = sites[k][0];
            cents = sites[k][1];
        }

        $website_money_blocks[k].find('.total-dollars').text(dollars);
        $website_money_blocks[k].find('.total-cents').text(cents);
    }
}

var points = {};
var zIndex = Number.MAX_VALUE;
function updatePoints(data){
    var new_points = {};
    var lines = data.split("\n");
    for(var i = 0; i < lines.length; i++){
        if($.trim(lines[i]) == "")
            continue;

        var parts = lines[i].split(',');
        var ip = parts[0];
        var last_visit = parts[1];
        var website = parts[2];
        var lat = parseFloat(parts[3]);
        var lon = parseFloat(parts[4]);
        var point = new google.maps.LatLng(lat, lon);
        var key = ip + website;
        if(!(key in points)){
            // need to create new marker
            var color = CONFIG['default']['color'];
            if(website in CONFIG){
                color = CONFIG[website]['color'];
            }
            var img_url = 'img/circle.php?r=' + color[0] + '&g=' + color[1] + '&b=' + color[2];

            new_points[ip + website] = new google.maps.Marker({
                position: point,
                map: map,
                animation: google.maps.Animation.DROP,
                title:website + ", " + ip,
                icon:img_url,
                zIndex: zIndex--,
            });
        } else {
            // the marker already exists
            new_points[key] = points[key];
        }
    }

    // get rid of old points
    for(var k in points){
        if(!(k in new_points)){
            points[k].setMap(null);
        }
    }

    points = new_points;
}

function getPrettyDateTime(){
    var now = new Date()
    var day = now.getDate()
    var month = now.getMonth() + 1
    var year = now.getFullYear()
    var output = month + "/" + day + "/" + year;

    var hours = now.getHours()
    var minutes = now.getMinutes()

    var suffix = "AM";
    if (hours >= 12) {
        suffix = "PM";
        hours = hours - 12;
    }

    if (hours == 0) {
        hours = 12;
    }

    if (minutes < 10){
        minutes = "0" + minutes
    }
    
    return output + " " + hours + ":" + minutes + " " + suffix;
}

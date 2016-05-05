
var lat =  -80
var lon = -180

//var lat = -81
//var lon = 10

var inprogress = 0
var ohShitLiscence = false

chrome.extension.onRequest.addListener(function(ev) {
  console.log(ev)
  var log = document.getElementById('texy')
  var latlon = document.getElementById('latlon')
  latlon.innerHTML = xy2filename(lon, lat)
  if(ev.file) {
    if(ohShitLiscence) { //ev.file.search('STANDARD/EE')>=0) { // liscense agreement
      gotoTab(ev.file)
      setTimeout(pollForQueue,5000)
      ohShitLiscence = false
      return
    } else {
      console.log('download', ev.file)
      inprogress ++
      chrome.downloads.download({url: ev.file}, function(id) {
        console.log('downloaded', ev.file)
	wasThatALiscense(id)
        inprogress --
      })
      setTimeout(pollForQueue,200)
      return
    }
  }
  if(ev.msg) {
    log.value = ev.msg + '\n'
    //console.log(ev)
    if(ev.msg == 'no button') {
      pollForQueue()
    }
  }
})


function pollForQueue() {
  chrome.downloads.search({}, function(items) {
    var inprogress2 = 0
    for(var i of items){
       if(i.state == 'in_progress') {
         inprogress2++
       }
    }
    console.log('in progress', inprogress, inprogress2)
    if(inprogress2<=5) {
      gotoNextTab()
    } else {
      setTimeout(pollForQueue, 1000)
    }
  })
}

function wasThatALiscense(id) {
  chrome.downloads.search({id:id},function(dnlds){
    for(var x of dnlds) {
      if(x.filename.search('EE') && x.filename.search('html')) {
        ohShitLiscence = true
        setTimeout( function(){ chrome.downloads.download({url: x.url}, function(id) {
            console.log('downloaded', x.url)
          })
        },10000)
      }
    }
  })
}

// Set up event handlers and inject send_links.js into all frames in the active
// tab.
var buttClicked = false

window.onload = function() {
  //console.log('onload')
  document.getElementById('download0').onclick = function(){
    buttClicked = true
    pollForQueue()
  }
};

function startdownload() {
  chrome.windows.getCurrent(function (currentWindow) {
    //console.log('current')
    chrome.tabs.query({active: true, windowId: currentWindow.id},
                      function(activeTabs) {
      chrome.tabs.executeScript(
        activeTabs[0].id, {file: 'send_links.js', allFrames: false});
    });
  });
}

function gotoNextTab() {
  incrementLatLon()
  gotoTab(xy2filename(lon,lat))
  //setTimeout(startdownload,100)
}

function gotoTab(url2) {
  chrome.windows.getCurrent(function (currentWindow) {
    //console.log('current')
    chrome.tabs.query({active: true, windowId: currentWindow.id}, function(activeTabs) {
      chrome.tabs.update(activeTabs[0].id, {url: url2})
    });
  });
}


chrome.tabs.onUpdated.addListener(function(tabID , info) {
    if (info.status == "complete") {
      if(buttClicked) {
        startdownload()
      }
    }
});

//
// helpers
//
function incrementLatLon() {
  lat++
  if (lat>80) {
    lat = -80
    lon ++
  }
  if (lon>180) {
    console.log('done')
    throw('done')
  }
}

function xy2filename(x,y) {
  var xstr = leftpad(Math.abs(x),3,0)
  var ystr = leftpad(Math.abs(y),2,0)
  if(x<0) {
    xstr = 'W' + xstr
  } else {
    xstr = 'E' + xstr
  }
  if(y<0) {
    ystr = 'S' + ystr
  } else {
    ystr = 'N' + ystr
  }
  var url = `http://earthexplorer.usgs.gov/download/options/4220/ASTGDEMV2_0${ystr}${xstr}`
  return url
}

function leftpad(s, width, char) {
    return (s.length >= width) ? s : (new Array(width).join(char) + s).slice(-width);
}

// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Send back to the popup a sorted deduped list of valid link URLs on this page.
// The popup injects this script into all frames in the active tab.

console.log('hello2')
function lookForLink() {
  console.log('look for link')
  var links = document.getElementsByClassName('button')
  var forms = document.getElementsByTagName('form')
  console.log(links)
  if(links.length>0) {
    var butt = links[0]
    if(forms.length > 0) { // the liscense agreement
      var form = forms[0]
      form.submit()
    } else if(butt.value = 'Download') { // the download button
      var funk = butt.getAttribute('onclick')
      if(funk.search("dow.location=") >= 0) {
        var f = funk.substr(funk.search('window.location=')+17)
        f = f.substr(0,f.length-1)
        chrome.extension.sendRequest({msg:'good'})
        chrome.extension.sendRequest({file:f})
      } else {
        chrome.extension.sendRequest({msg:'no onclick'})
      }
    } else {
      chrome.extension.sendRequest({msg:'no onclick'})
    }
  } else {
    chrome.extension.sendRequest({msg:'no button', buttons:links.length})
  }
}

if(document.readyState === "complete") {
  console.log('already loaded event')
  setTimeout( function() {
    lookForLink()
  }, 1000);
}
else {
  window.addEventListener("onload", function () {
    console.log('onload event')
    setTimeout( function() {
      lookForLink()
    }, 1000);
  }, false);

}

/*
setTimeout( function() {
  lookForLink()
}, 3000);
*/
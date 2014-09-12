/*
    Foku
    Binaural beats mofo.
*/

function Foku(){
  this.watch();
  console.log("Initialized Foku.");
}

// Initialize all the events
Foku.prototype.watch = function(){
  
  var fak = this;
  this.icons = {chaos: 'dawg_19.png', gyatso: 'zen_19.png'};
  this.running = false;
  this.init_sound();

  this.current_url = "";
  this.hibbem_tabs = [];

  // If icon is clicked, go!
  chrome.browserAction.onClicked.addListener(function(){
    if(fak.running){
      chrome.extension.sendMessage('unzen');
    }else{
      chrome.extension.sendMessage('zen');
    }
  });

  // If new tab opens, fak it.
  chrome.tabs.onCreated.addListener(function(tab){
    if(fak.running){
      fak.nag();
      chrome.tabs.remove(tab.id);
    }
  });

  // block your navigte
  chrome.webRequest.onBeforeRequest.addListener(function(details) {
    if(fak.running && details.tabId != -1 && details.type == "main_frame"){
      fak.nag();
      return { redirectUrl: 'javascript:' };
    }
  }, {urls: ['<all_urls>']}, ['blocking']);

  // A listener to go zen
  chrome.extension.onMessage.addListener(function(message){
    switch(message){
      case "zen":
        fak.zen();
        break;
      case "unzen":
        fak.unzen();
        break;
    }
    
  });
}

Foku.prototype.nag = function(){
  this.gain_nag.gain.setValueAtTime(Math.max(0.5, this.gain_nag.gain.value), this.context.currentTime);
  this.gain_nag.gain.linearRampToValueAtTime(0, this.context.currentTime + 0.4);
}

Foku.prototype.init_sound = function(){

  try {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    this.context = new AudioContext();
    console.log("AudioContext initialized.")
  }
  catch(e) {
    console.log('Web Audio API is not supported in this browser');
  }

  this.f0 = 100;
  this.delta = 40;

  this.osc_l = this.context.createOscillator();
  this.osc_l.frequency.value = this.f0+(this.delta/2);
  this.osc_l.noteOn(0);
  this.osc_r = this.context.createOscillator();
  this.osc_r.frequency.value = this.f0-(this.delta/2);
  this.osc_r.noteOn(0);

  this.gain = this.context.createGain();
  this.gain.gain.value = 0;

  mergerNode = this.context.createChannelMerger(2);
  mergerNode.connect(this.gain);

  this.osc_l.connect(mergerNode, 0, 0);
  this.osc_r.connect(mergerNode, 0, 1);

  this.gain.connect(this.context.destination);

  this.osc_nag = this.context.createOscillator();
  this.osc_nag.frequency.value = 200;
  this.osc_nag.type = 0;
  this.osc_nag.noteOn(0);

  this.osc_nag2 = this.context.createOscillator();
  this.osc_nag2.frequency.value = 3000;
  this.osc_nag2.type = 3;
  this.osc_nag2.noteOn(0);

  this.gain_nag = this.context.createGain();
  this.gain_nag.gain.value = 0;
  
  this.osc_nag.connect(this.gain_nag);
  this.osc_nag2.connect(this.gain_nag);

  this.gain_nag.connect(this.context.destination);
}

// zen mek sound
Foku.prototype.zen = function(){
  this.running = true;
  this.gain.gain.value = 0.5;
  
  var fak = this;

  chrome.tabs.query({}, function(tabs){

    tabs.forEach(function(tab){
      if(tab.active){
        1;
      }else{
        fak.hibbem_tabs.unshift(tab.url);
        chrome.tabs.remove(tab.id);
      }
    });
  });

  // get the active URL
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
    fak.current_url = tabs[0].url;
  });

  chrome.browserAction.setIcon({path: this.icons.gyatso});
  chrome.browserAction.setBadgeText({text: "foku"});
  chrome.browserAction.setTitle({title: "Click to continue your session."});

}

Foku.prototype.unzen = function(){
  this.running = false;
  this.gain.gain.value = 0;
  
  var my_id = null
  
  while(this.hibbem_tabs.length > 0){
    chrome.tabs.create({url: this.hibbem_tabs.pop(), active: false});
  }

  chrome.browserAction.setIcon({path: this.icons.chaos});
  chrome.browserAction.setBadgeText({text: ""});
  chrome.browserAction.setTitle({title: "Foku this!"});
}

window.FOKU = new Foku();


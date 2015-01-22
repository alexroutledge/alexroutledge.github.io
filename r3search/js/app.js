(function () {
  "use strict";


  // Make sure we are accessing over https, if not redirect
  if ((!location.port || location.port === "80") && location.protocol !== "https:" && location.host !== "localhost") {
    location.protocol = "https:";
  }


  // Register our ServiceWorker
  if (navigator.serviceWorker) {
    navigator.serviceWorker.register("/r3search/worker.js", {
      scope: "/r3search/"
    }).then(function (reg) {
      console.log("SW register success", reg);
      window.location.reload();
    }, function (err) {
      console.log("SW register fail", err);
    });
  }

  // localStorage keys
  var lsHistoryID = "r3search-ls-history";


  // DOM references
  var historyContainer = document.querySelector(".history");
  var historyNone = document.querySelector(".history .empty-list");
  var historyButton = document.querySelector(".history-button");
  var historyClear = document.querySelector(".history-clear");

  var suggestionsContainer = document.querySelector(".suggestions");
  var suggestionsNone = document.querySelector(".suggestions .empty-list");
  var suggestionsLoading = document.querySelector(".suggestions-loading");

  var articleContent = document.querySelector(".article-content");
  var articleTitle = document.querySelector(".article-title");
  var articleLink = document.querySelector(".article-link");
  var articleLoading = document.querySelector(".article-loading");

  var searchForm = document.querySelector(".search");
  var searchBox = searchForm.querySelector("[name=query]");

  // options
  var optHistorySize = 10;


  // Enable/disable search functionality based on network availability
  function updateNetworkStatus() {
    searchBox.value = "";

    if (navigator.onLine) {
      searchBox.removeAttribute("disabled");
      searchBox.setAttribute("placeholder", "Search");
    } else {
      closeSuggestions();
      searchBox.setAttribute("disabled", "disabled");
      searchBox.setAttribute("placeholder", "No connection - try history");
    }
  }


  // History button was clicked
  function clickHistoryButton(event) {
    event.preventDefault();

    if (searchForm.classList.contains("history-open")) {
      closeHistory();
    } else {
      openHistory();
    }
  }


  // Open history list
  function openHistory() {
    closeSuggestions();
    searchForm.classList.add("history-open");
  }


  // Close history list
  function closeHistory() {
    searchForm.classList.remove("history-open");
  }


  // Open suggestions list
  function openSuggestions() {
    closeHistory();
    suggestionsContainer.classList.add("suggestions-open");
  }


  // Close suggestions list
  function closeSuggestions() {
    suggestionsContainer.classList.remove("suggestions-open");
  }


  // Show suggestions loading icon
  function showsuggestionsLoading() {
    suggestionsLoading.classList.add("show");
  }


  // Hide suggestions loading icon
  function hidesuggestionsLoading() {
    suggestionsLoading.classList.remove("show");
  }

  //listen for clicks outside history/suggestions divs and close if necessary
  function windowClick(event) {
    if ( !historyContainer.contains(event.target) && !suggestionsContainer.contains(event.target) &&
        !historyButton.contains(event.target) ) {

      closeHistory();
      closeSuggestions();

      }
  }

  // Show article loading icon
  function showArticleLoading() {
    articleLoading.classList.add("show");
  }


  // Hide article loading icon
  function hideArticleLoading() {
    articleLoading.classList.remove("show");
  }


  // A link to an article was clicked
  function clickArticle(event) {
    if (event.target.classList.contains("article-load")) {
      event.preventDefault();

      var query = event.target.dataset.query;
      find(query);

      closeHistory();
      closeSuggestions();
    } else if (event.target.classList.contains("history-clear")) {
      event.preventDefault();

      clearHistory();
    }
  }


  // Update history list
  function updateHistory() {
    var link;
    var history = localStorage.getItem(lsHistoryID);
    var historyList = historyContainer.querySelector(".history-list");

    historyList.innerHTML = "";

    if (history) {
      history = JSON.parse(history);

      if (history.length) {
        historyNone.classList.remove("show");
        historyClear.classList.add("show");

        history.reverse();
        history.forEach(function (query) {

          link = document.createElement("a");
          link.textContent = query;
          link.setAttribute("href", "#");
          link.setAttribute("data-query", query);
          link.setAttribute("class", "article-load");

          historyList.appendChild(link);
        });

      } else {
        historyNone.classList.add("show");
        historyClear.classList.remove("show");
      }

    } else {
      historyNone.classList.add("show");
      historyClear.classList.remove("show");
    }
  }

  function clearHistory() {
    localStorage.setItem(lsHistoryID, JSON.stringify([]));
    closeHistory();
    updateHistory();
  }


  // Save an article to the history
  function saveArticle(title) {
    var history = localStorage.getItem(lsHistoryID);

    if (history) {
      history = JSON.parse(history);
    } else {
      history = [];
    }

    if (history.indexOf(title) === -1) {

      if (history.length >= optHistorySize) {
        history.shift();
      }
      history.push(title);
    }

    localStorage.setItem(lsHistoryID, JSON.stringify(history));

    updateHistory();
  }


  // Search form was sumitted
  function submitSearchForm(event) {
    event.preventDefault();

    search(event.currentTarget.query.value);
  }


  // Search wikipedia for the search query
  function search(query) {
    closeHistory();

    if (query) {
      suggestionsNone.classList.remove("show");

      var suggestions;
      var link;
      var suggestionsList = suggestionsContainer.querySelector(".suggestions-list");

      suggestionsList.innerHTML = "";
      showsuggestionsLoading();
      openSuggestions();

      jsonp("//en.wikipedia.org/w/api.php", {
        format: "json",
        action: "opensearch",
        search: query,
        limit: 5,
        titles: query
      }, function (response) {
        hidesuggestionsLoading();

        suggestions = response[1];

        if (suggestions.length === 0) {

          suggestionsNone.classList.add("show");

        } else {

          if (suggestions.length === 1) {

            closeSuggestions();
            find(suggestions[0]);

          } else {

            suggestions.forEach(function (suggestion) {
              link = document.createElement("a");
              link.textContent = suggestion;
              link.setAttribute("href", "#");
              link.setAttribute("data-query", suggestion);
              link.setAttribute("class", "article-load");
              suggestionsList.appendChild(link);
            });

          }
        }

      }, function (err) {
        hidesuggestionsLoading();

        console.log("error", err);
      });
    } else {
      closeSuggestions();
    }
  }


  // Find an article on Wikipedia
  function find(title) {
    var page, extract, titleText, thumb, img, url, link;

    articleContent.innerHTML = "";
    articleTitle.innerHTML = "";
    articleLink.innerHTML = "";
    showArticleLoading();

    jsonp("//en.wikipedia.org/w/api.php", {
      format: "json",
      action: "query",
      continue: "",
      prop: "extracts|pageimages",
      exsentences: 10,
      exlimit: 1,
      explaintext: true,
      piprop: "thumbnail",
      pithumbsize: 200,
      redirects: true,
      titles: title
    }, function (response) {
      hideArticleLoading();

      console.log("success", response);

      page;
      for(var pageId in response.query.pages) {
        page = response.query.pages[pageId];
      }

      extract = page.extract;
      titleText = page.title;
      thumb = false;

      if (page.thumbnail && page.thumbnail.source) {
        thumb = page.thumbnail.source;
      }

      if (!extract) {
        extract = "No matching article";
      } else {
        saveArticle(titleText);
      }

      if (thumb) {
        img = document.createElement("img");
        img.setAttribute("src", thumb);
        img.setAttribute("class", "thumb");
        articleContent.appendChild(img);
      }

      articleContent.innerHTML += extract;
      articleTitle.textContent = titleText;

      url = "http://en.wikipedia.org/wiki/" + titleText;
      link = document.createElement("a");
      link.textContent = url;
      link.setAttribute("href", url);
      link.setAttribute("target", "_blank");
      articleLink.appendChild(link);

    }, function (err) {
      hideArticleLoading();

      console.log("error", err);
    });
  }


  // Make a JSON-P request
  function jsonp(url, data, callback, onerror) {
    var callbackName = "jsonp_callback";

    var script = document.createElement("script");
    script.src = url + "?" + getParams(data) + "&callback=" + callbackName;
    script.onerror = onerror;

    window[callbackName] = function (data) {
      delete window[callbackName];
      document.body.removeChild(script);
      callback(data);
    };

    document.body.appendChild(script);
  }


  // form a GET query string from object
  function getParams(obj) {
    var str = "";
    for (var key in obj) {
        if (str !== "") {
            str += "&";
        }
        str += key + "=" + encodeURIComponent(obj[key]);
    }

    return str;
  }


  // Event listeners
  historyContainer.addEventListener("click", clickArticle);
  suggestionsContainer.addEventListener("click", clickArticle);
  searchForm.addEventListener("submit", submitSearchForm);
  historyButton.addEventListener("click", clickHistoryButton);
  window.addEventListener("online", updateNetworkStatus);
  window.addEventListener("offline", updateNetworkStatus);
  window.addEventListener("click", windowClick);


  // Initialisation
  updateHistory();
  updateNetworkStatus();

}());
Function.prototype.bind||(Function.prototype.bind=function(a){if("function"!=typeof this)throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");var b=[].slice.call(arguments,1),c=this,d=function(){},e=function(){return c.apply(this instanceof d&&a?this:a,b.concat(Array.prototype.slice.call(arguments)))};return d.prototype=this.prototype,e.prototype=new d,e}),"document"in self&&!("classList"in document.createElement("_"))&&!function(a){"use strict";if("Element"in a){var b="classList",c="prototype",d=a.Element[c],e=Object,f=String[c].trim||function(){return this.replace(/^\s+|\s+$/g,"")},g=Array[c].indexOf||function(a){for(var b=0,c=this.length;c>b;b++)if(b in this&&this[b]===a)return b;return-1},h=function(a,b){this.name=a,this.code=DOMException[a],this.message=b},i=function(a,b){if(""===b)throw new h("SYNTAX_ERR","An invalid or illegal string was specified");if(/\s/.test(b))throw new h("INVALID_CHARACTER_ERR","String contains an invalid character");return g.call(a,b)},j=function(a){for(var b=f.call(a.getAttribute("class")||""),c=b?b.split(/\s+/):[],d=0,e=c.length;e>d;d++)this.push(c[d]);this._updateClassName=function(){a.setAttribute("class",this.toString())}},k=j[c]=[],l=function(){return new j(this)};if(h[c]=Error[c],k.item=function(a){return this[a]||null},k.contains=function(a){return a+="",-1!==i(this,a)},k.add=function(){var a,b=arguments,c=0,d=b.length,e=!1;do a=b[c]+"",-1===i(this,a)&&(this.push(a),e=!0);while(++c<d);e&&this._updateClassName()},k.remove=function(){var a,b=arguments,c=0,d=b.length,e=!1;do{a=b[c]+"";var f=i(this,a);-1!==f&&(this.splice(f,1),e=!0)}while(++c<d);e&&this._updateClassName()},k.toggle=function(a,b){a+="";var c=this.contains(a),d=c?b!==!0&&"remove":b!==!1&&"add";return d&&this[d](a),!c},k.toString=function(){return this.join(" ")},e.defineProperty){var m={get:l,enumerable:!0,configurable:!0};try{e.defineProperty(d,b,m)}catch(n){-2146823252===n.number&&(m.enumerable=!1,e.defineProperty(d,b,m))}}else e[c].__defineGetter__&&d.__defineGetter__(b,l)}}(self),QSA=function(a,b){function c(a){return null!==a&&a.nodeType===a.DOCUMENT_NODE}function d(a,b){if(!b||!a||1!==a.nodeType)return!1;var c=a.webkitMatchesSelector||a.mozMatchesSelector||a.oMatchesSelector||a.msMatchesSelector||a.matchesSelector;if(c)return c.call(a,b);var d,e=a.parentNode,f=!e;return f&&(e=tempParent).appendChild(a),d=~e.querySelectorAll(b).indexOf(a),f&&tempParent.removeChild(a),d}function e(a,b,c,d,e,f){var g,h=new XMLHttpRequest;if(h.open(a,b),"number"==typeof f&&(h.timeout=f),"function"==typeof c&&(d=c,c=null),"POST"===a&&c){g=new FormData;for(var i in c)g.append(i,c[i])}h.onload=function(){h.status>=400?e&&e(h):d(h.responseText||h.response)},e&&(h.onerror=function(){e(h)},h.ontimeout=function(){e(h,!0)}),h.send(c?g:null)}var f=Node.prototype,g=NodeList.prototype,h="forEach",i="trigger",j="attr",k="remove",l="show",m="hide",n="addClass",o="removeClass",p="hasClass",q="toggleClass",r="after",s="offset",t="find",u="siblings",v="closest",w="val",x="last",y="next",z=[][h],A="indexOf",B=a.createElement("i");g[h]=z,b.on=f.on=function(a,b){if(this.handlers||(this.handlers=[]),a&&-1!==a.indexOf(" "))for(var c=a.split(" "),d=0;d<c.length;d++)this.addEventListener(c[d],b,!1);else this.addEventListener(a,b,!1);return this.handlers.push(b),this},b.off=f.off=function(a,b){return b?this.removeEventListener(a,b,!1):this.handlers[h](function(b){this.removeEventListener(a,b,!1)}.bind(this)),this},g.on=function(a,b){return this[h](function(c){c.on(a,b)}),this},g.off=function(a,b){this[h](function(c){c.off(a,b)})},b[i]=f[i]=function(b,c){var d=a.createEvent("HTMLEvents");return d.initEvent(b,!0,!0),d.data=c||{},d.eventName=b,d.target=this,this.dispatchEvent(d),this},g[i]=function(a){return this[h](function(b){b[i](a)}),this},b[j]=f[j]=function(a,b){return void 0===b?this.getAttribute(a):this.setAttribute(a,b)},g.attr=function(a,b){return this[h](function(c){c.attr(a,b)}),this},f[k]=function(){null!==this.parentNode&&this.parentNode.removeChild(this)},g[k]=function(){return this[h](function(a){a.remove()}),this},g[x]=function(){return this[this.length-1]},g[A]=function(a){return Array.prototype.slice.call(this).indexOf(a)},b[l]=f[l]=function(){return this.style.display="block",this},g.show=function(){return this[h](function(a){a.show()}),this},b[w]=f[w]=function(a){return this.value=a,this},b[m]=f[m]=function(){return this.style.display="none",this},g.hide=function(){return this[h](function(a){a.hide()}),this},b[n]=f[n]=function(a){return this.classList.add(a),this},g.addClass=function(a){return this[h](function(b){b.addClass(a)}),this},b[o]=f[o]=function(a){return this.classList.remove(a),this},g.removeClass=function(a){return this[h](function(b){b.removeClass(a)}),this},b[q]=f[q]=function(a){return this.classList.toggle(a),this},b[p]=f[p]=function(a){return this.classList.contains(a)},b[y]=f[y]=function(){var a=this;do a=a.nextSibling;while(a&&1!=a.nodeType);return a},b[r]=f[r]=function(a){var b=this.parentNode;return b.lastChild===this?b.appendChild(a):b.insertBefore(a,this.nextSibling),this},b[s]=f[s]=function(){var a=this.getBoundingClientRect();return{left:a.left+b.pageXOffset,top:a.top+b.pageYOffset,width:Math.round(a.width),height:Math.round(a.height)}},b[t]=f[t]=function(a){return this.querySelectorAll(a||"â˜º")},b[u]=f[u]=function(){for(var a=[],b=this.parentNode.children,c=0;c<b.length;c++)b[c]!==this&&a.push(b[c]);return a},f[v]=function(b,e){var f=this,g=!1;for("object"==typeof b&&(g=a.querySelectorAll(b));f&&!(g?g.indexOf(f)>=0:d(f,b));)f=f!==e&&!c(f)&&f.parentNode;return f};var C=e.bind(this,"GET"),D=e.bind(this,"POST");return QSA=function(b){var c=a.querySelectorAll(b||"â˜º"),d=c.length;return 1===d?c[0]:c},QSA.on=f.on.bind(B),QSA[i]=f[i].bind(B),QSA.get=C,QSA.post=D,QSA}(document,this),Node.prototype.delegate=function(a,b,c){var d=this.mozMatchesSelector||this.webkitMatchesSelector||this.oMatchesSelector||this.msMatchesSelector||this.matchesSelector||function(a){var b=this,c=QSA(a),d=!1;return c instanceof NodeList?c.forEach(function(a){a===b&&(d=!0)}):c===b&&(d=!0),d};return this.on(b,function(b){(d.call(b.target,a)||d.call(b.target.parentNode,a))&&c.call(b.target,b)}),this},QSA.extend=function(a,b,c){for(var d in b)c&&(isPlainObject(b[d])||isArray(b[d]))?(isPlainObject(b[d])&&!isPlainObject(a[d])&&(a[d]={}),isArray(b[d])&&!isArray(a[d])&&(a[d]=[]),extend(a[d],b[d],c)):void 0!==b[d]&&(a[d]=b[d])};var YELL={};YELL.smartphone={},YELL.smartphone.instances={},YELL.smartphone.utils={},YELL.smartphone.utils.hasAJAX=function(){var a=null;try{a=new XMLHttpRequest}catch(b){}try{a=new ActiveXObject("Microsoft.XMLHTTP")}catch(b){}try{a=new ActiveXObject("Msxml2.XMLHTTP")}catch(b){}return null!==a&&void 0!==window.JSON}(),YELL.smartphone.utils.isModernBrowser=function(){return"JSON"in window&&"localStorage"in window&&"sessionStorage"in window},YELL.smartphone.utils.has3d=function(){if(!window.getComputedStyle)return!1;var a,b=document.createElement("div"),c={webkitTransform:"-webkit-transform",OTransform:"-o-transform",msTransform:"-ms-transform",MozTransform:"-moz-transform",transform:"transform"};document.body.insertBefore(b,null);for(var d in c)void 0!==b.style[d]&&(b.style[d]="translate3d(1px,1px,1px)",a=window.getComputedStyle(b).getPropertyValue(c[d]));return document.body.removeChild(b),void 0!==a&&a.length>0&&"none"!==a},YELL.smartphone.utils.has2d=function(){if(!window.getComputedStyle)return!1;var a,b=document.createElement("div"),c={webkitTransform:"-webkit-transform",OTransform:"-o-transform",msTransform:"-ms-transform",MozTransform:"-moz-transform",transform:"transform"};document.body.insertBefore(b,null);for(var d in c)void 0!==b.style[d]&&(b.style[d]="translate(1px,1px)",window.setTimeout(function(){a=window.getComputedStyle(b).getPropertyValue(c[d])},0));return document.body.removeChild(b),void 0!==a&&a.length>0&&"none"!==a},YELL.smartphone.utils.supportsOverflowScroll=function(){var a;return webkit=navigator.userAgent.match(/AppleWebKit\/([0-9]+)/),wkversion=webkit&&webkit[1],wkLte534=webkit&&wkversion>=534,a="WebkitOverflowScrolling"in window.document.documentElement.style||"msOverflowStyle"in window.document.documentElement.style,navigator.userAgent.match(/Android ([0-9]+)/)&&RegExp.$1>=3||wkLte534||a},YELL.smartphone.utils.hasLocalStorage=function(){var a="test";try{return localStorage.setItem(a,a),localStorage.removeItem(a),!0}catch(b){return!1}},YELL.smartphone.utils.getUrlParam=function(a,b){var c=b||document.location;a=a.replace(/[\[]/,"\\[").replace(/[\]]/,"\\]");var d="[\\?&]"+a+"=([^&#]*)",e=new RegExp(d),f=e.exec(c);return null===f?"":f[1]},window.onload=function(){"usEnabled"===YELL.smartphone.utils.getUrlParam("type")?document.cookie="usEnabled=true; path=/;":"usDisabled"===YELL.smartphone.utils.getUrlParam("type")&&(document.cookie='usEnabled=; path=/;expires=Thu, 01-Jan-1970 00:00:01 GMT";'),function(a){var b=a.document;if(!location.hash&&a.addEventListener&&QSA("[data-scrollAddressbar]").length){window.scrollTo(0,1);var c=1,d=function(){return a.pageYOffset||"CSS1Compat"===b.compatMode&&b.documentElement.scrollTop||b.body.scrollTop||0},e=setInterval(function(){b.body&&(clearInterval(e),c=d(),a.scrollTo(0,1===c?0:1))},15);a.addEventListener("load",function(){setTimeout(function(){d()<20&&a.scrollTo(0,1===c?0:1)},0)})}}(this)},window.onunload=function(){},YELL.smartphone.AppPromo=function(){this._options={counter:"counter",promoDismissed:"promoDismissed",promoShown:"promoShown",landscape:"landscapeMode",openClass:"isVisible"},this.count=YELL.smartphone.utils.hasLocalStorage()&&window.localStorage.getItem(this._options.counter)?window.localStorage.getItem(this._options.counter):0,this.init()},YELL.smartphone.AppPromo.prototype.isPromoActive=function(){return 0!==QSA(".app-promo").length},YELL.smartphone.AppPromo.prototype.init=function(){var a=this;this.isPromoActive()&&(this.isTimeToShowThePromo()&&!this.hasPromoBeenShown()&&(this.bindDownloadHandler(),this.bindDismissHandler(),this.bindClickOutside(),a.showPromo()),this.hasPromoBeenShown()||a.recordPromoImpression())},YELL.smartphone.AppPromo.prototype.isInteger=function(a){return parseFloat(a)%1===0},YELL.smartphone.AppPromo.prototype.isFibonacciNumber=function(a){var b=parseFloat(a);return this.isInteger(Math.sqrt(5*b*b+4))||this.isInteger(Math.sqrt(5*b*b-4))},YELL.smartphone.AppPromo.prototype.hasPromoBeenShown=function(){return YELL.smartphone.utils.hasLocalStorage()&&null!==window.sessionStorage.getItem(this._options.promoShown)},YELL.smartphone.AppPromo.prototype.isTimeToShowThePromo=function(){return this.pageName=this.pageName||QSA(".app-promo").getAttribute("data-app-promo-page"),this.isPromoDismissed()?!1:"homePage"===this.pageName?!0:"bipPage"===this.pageName?this.getPromoCount()%2===1:this.isFibonacciNumber(this.getPromoCount()+1)&&this.getPromoCount()>0},YELL.smartphone.AppPromo.prototype.increasePromoCount=function(){return!this.isPromoDismissed()&&YELL.smartphone.utils.hasLocalStorage()&&window.localStorage.setItem(this._options.counter,this.getPromoCount()+1),this.getPromoCount()},YELL.smartphone.AppPromo.prototype.getPromoCount=function(){return YELL.smartphone.utils.hasLocalStorage()&&window.localStorage.getItem(this._options.counter)?parseInt(window.localStorage.getItem(this._options.counter),10):0},YELL.smartphone.AppPromo.prototype.killPromoForThisSession=function(){YELL.smartphone.utils.hasLocalStorage()&&window.sessionStorage.setItem(this._options.promoDismissed,"true")},YELL.smartphone.AppPromo.prototype.recordPromoImpression=function(){YELL.smartphone.utils.hasLocalStorage()&&(window.sessionStorage.setItem(this._options.promoShown,"true"),this.increasePromoCount())},YELL.smartphone.AppPromo.prototype.moveFocusTo=function(a){document.getElementById(a).trigger("focus")},YELL.smartphone.AppPromo.prototype.isPromoDismissed=function(){return YELL.smartphone.utils.hasLocalStorage()&&null!==window.sessionStorage.getItem(this._options.promoDismissed)},YELL.smartphone.AppPromo.prototype.setElmDisplay=function(a){var b;b=QSA("[data-app-promo]"),b.length>0&&(b.style.display=a)},YELL.smartphone.AppPromo.prototype.showPromo=function(){var a=this;this.setElmDisplay("block"),setTimeout(function(){QSA("[data-app-promo]").addClass(a._options.openClass)},1e3),YELL.smartphone.track(QSA("[data-app-promo]").getAttribute("data-omniture-promo")),this.moveFocusTo("appPromo")},YELL.smartphone.AppPromo.prototype.bindDismissHandler=function(){var a=this;QSA("[data-close-promo]").on("click",function(b){var c;a.dismissHandler(b),c=QSA(".main-header, .section"),c&&c.handlers&&QSA(".main-header, .section").off("click")})},YELL.smartphone.AppPromo.prototype.bindDownloadHandler=function(){var a=this;QSA("[data-get-app]").on("click",function(b){a.dismissHandler(b)})},YELL.smartphone.AppPromo.prototype.bindClickOutside=function(){var a=this;QSA(".main-header, .section").on("click",function(b){a.dismissHandler(b),QSA(".main-header, .section").off("click")})},YELL.smartphone.AppPromo.prototype.dismissHandler=function(){this.killPromoForThisSession(),QSA(".app-promo").removeClass(this._options.openClass),setTimeout(function(){this.setElmDisplay("none")}.bind(this),1e3)},YELL.smartphone.Geolocation=function(){this.accuracyThreshold=2e3,this.geoTimeout=1e4,this.init()},YELL.smartphone.Geolocation.prototype.errors={1:"Your location settings appear to be turned off, please turn them on to use this feature.",2:"Sorry, we were unable to retrieve your current position.",3:"Sorry, it's taking too long to retrieve your location.",4:"Sorry, we were unable to retrieve an accurate position."},YELL.smartphone.Geolocation.prototype.setLatLong=function(a){if(a.coords.accuracy<this.accuracyThreshold){var b=document.getElementById("location");b.value="Current location",b.setAttribute("name","null"),this.stopSpinner(),QSA("input[name=clat],input[name=clng]").remove();var c=document.createElement("input"),d=document.createElement("input");d.type=c.type="hidden",c.name="clat",d.name="clng",c.value=a.coords.latitude,d.value=a.coords.longitude;var e=QSA("#searchForm");e.appendChild(c),e.appendChild(d),QSA("#clear-location").show(),YELL.smartphone.instances.home&&YELL.smartphone.instances.home.set("position",a)}else this.displayError({code:4})},YELL.smartphone.Geolocation.prototype.displayError=function(a){this.stopSpinner(),alert(this.errors[a.code])},YELL.smartphone.Geolocation.prototype.stopSpinner=function(){QSA("#geolocation").removeClass("is-loading"),QSA("#geolocation .loader").removeClass("is-visible").addClass("is-hidden")},YELL.smartphone.Geolocation.prototype.clearLatLong=function(){QSA("input[name=clat],input[name=clng]").remove(),document.getElementById("location").setAttribute("name","location")},YELL.smartphone.Geolocation.prototype.getPosition=function(a){var b=a?this.stopSpinner:this.displayError;QSA("#geolocation").addClass("is-loading"),QSA("#geolocation .loader").addClass("is-visible").removeClass("is-hidden"),navigator.geolocation.getCurrentPosition(this.setLatLong.bind(this),b.bind(this),{enableHighAccuracy:!0,timeout:this.geoTimeout,maximumAge:0})},YELL.smartphone.Geolocation.prototype.init=function(){if(navigator.geolocation&&!QSA("body").hasClass("BlackBerry-OS6")){var a=document.createElement("button");a.id="geolocation",a.classList.add("enable-geolocation"),a.type="button",a.setAttribute("data-omniture-listing","user-location");var b="Use current location";a.textContent=b,a.value=b,a.setAttribute("aria-title",b),a.innerHTML='<div class="loader loader--geolocation is-hidden"></div>',0!==QSA("#location").length&&QSA("#location").addClass("geolocation").after(a);var c=QSA("#geolocation"),d=this;c.show(),c.on("click",function(a){d.getPosition(),a.preventDefault()})}},YELL.smartphone.Geolocation.prototype.reset=function(){YELL.smartphone.Geolocation.prototype.clearLatLong()},YELL.smartphone.utils.locationDetection=function(){var a=[{name:"USA",x1:-126,x2:-60,y1:25,y2:49},{name:"Spain",x1:-9.4,x2:3.4,y1:36,y2:43.8}],b=function(b,c){var d;for(var e in a){var f=a[e];c>=f.x1&&c<=f.x2&&b>=f.y1&&b<=f.y2&&(d=f.name)}return d||!1};return{check:function(a,c){return b(a,c)}}}(),YELL.smartphone.FormValidation=function(){this.form=document.getElementById("searchForm"),this.endsUSA=/,\s*(US|USA)$/i,this.valid=!0,this.kwd=document.getElementById("keywords"),this.init()},YELL.smartphone.FormValidation.prototype.isUsEnabled=function(){return"true"===document.body.getAttribute("data-us-enabled")?!0:!1},YELL.smartphone.FormValidation.prototype.addValidationMessage=function(a){a.addClass("validation-error").attr("placeholder","Please enter a search term")},YELL.smartphone.FormValidation.prototype.removeValidationMessage=function(a){if(document.getElementById(a.id+"-message")){var b=document.getElementById(a.id+"-message");b.parentNode.removeChild(b)}},YELL.smartphone.FormValidation.prototype.handleUsLocationWithGeo=function(a,b){a.name="location",YELL.smartphone.instances.geolocation&&YELL.smartphone.instances.geolocation.reset(),-1!==b.search(this.endsUSA)&&this.form.setAttribute("action","/responder_universal/us/search")},YELL.smartphone.FormValidation.prototype.handleUsCurrentLocation=function(){var a=QSA('input[name="clat"]').value,b=QSA("input[name=clng]").value;"USA"===YELL.smartphone.utils.locationDetection.check(a,b)&&this.form.setAttribute("action","/responder_universal/us/search")},YELL.smartphone.FormValidation.prototype.handleUsLocation=function(){var a=QSA("#location"),b=a.value;"Current Location"!==b&&YELL.smartphone.instances.geolocation?this.handleUsLocationWithGeo(a,b):"Current Location"===b&&this.handleUsCurrentLocation(),"home"===document.body.id&&s.tl(this,"o","/aws/home/search")},YELL.smartphone.FormValidation.prototype.validateInputs=function(a){this.kwd.value.length>=2?(this.removeValidationMessage(this.kwd),this.valid=!0):(this.valid=!1,this.addValidationMessage(this.kwd)),this.valid&&this.isUsEnabled()&&this.handleUsLocation(),!this.valid&&a&&a.preventDefault()},YELL.smartphone.FormValidation.prototype.init=function(){var a=this;QSA("#searchForm").on("submit",function(b){a.validateInputs(b)})},YELL.smartphone.utils.hasAJAX&&(YELL.smartphone.Autosuggest=function(a){this.options={type:"",input:"",threshold:2,maxResults:10},QSA.extend(this.options,a),this.cachedResults=[],this.resultsOpen=!1},YELL.smartphone.Autosuggest.prototype.getCachedResults=function(){var a=YELL.smartphone.utils.hasLocalStorage()?localStorage.getItem(this.options.type+"CachedResults"):null;a&&(this.cachedResults=JSON.parse(a)),this.cachedResults||(this.cachedResults=[])},YELL.smartphone.Autosuggest.prototype.filterDuplicateResults=function(){var a,b,c=function(){var a={};return{contains:function(b){return a[b]===!0},add:function(b){a[b]!==!0&&(a[b]=!0)}}}(),d=null,e=[];for(a=0;a<this.cachedResults.length;a++)b=this.cachedResults[a],b&&(d=b.name+";"+b.type,c.contains(d)||(e.push(b),c.add(d)));return e},YELL.smartphone.Autosuggest.prototype.updateCachedResults=function(a){return this.cachedResults=this.cachedResults.concat(a),this.cachedResults=this.filterDuplicateResults(),YELL.smartphone.utils.hasLocalStorage()&&localStorage.setItem(this.options.type+"CachedResults",JSON.stringify(this.cachedResults)),this.cachedResults},YELL.smartphone.Autosuggest.prototype.highlightTermInString=function(a,b){var c=new RegExp(b,"gi"),d=a.replace(c,'<mark class="autocomplete__highlight background-fill--yellow">'+b.toLowerCase()+"</mark>");return'<li class="autocomplete__item">'+d+"</li>"},YELL.smartphone.Autosuggest.prototype.testTermMatches=function(a,b){var c=new RegExp(b,"gi");return c.test(a)},YELL.smartphone.Autosuggest.prototype.testTermType=function(a){return a.type===this.options.type},YELL.smartphone.Autosuggest.prototype.renderResultsHtml=function(a,b){var c,d,e=[];for(d=0;d<b.length;d++){var f=this.testTermMatches(b[d].name,a),g=this.testTermType(b[d]);f&&g&&e.length<this.options.maxResults&&(c=this.highlightTermInString(b[d].name,a),e.push(c))}return e},YELL.smartphone.Autosuggest.prototype.renderResults=function(a,b){if(b&&b.length){var c=this.renderResultsHtml(a,b);if(c&&c.length>0)return c.join("")}},YELL.smartphone.Autosuggest.prototype.render=function(a){var b;for(b in this.options.styles)this.options.styles.hasOwnProperty(b)&&(a.style[b]=this.options.styles[b])},YELL.smartphone.Autosuggest.prototype.positionResults=function(a){0!==a.length&&(a.innerHTML||(a=a[0]),QSA(this.options.input).addClass("autocomplete__input"),this.setStyles(),this.render(a))},YELL.smartphone.Autosuggest.prototype.removeResults=function(){QSA("#ac-"+this.options.type).remove(),QSA(this.options.input).removeClass("autocomplete__input"),this.resultsOpen=!1},YELL.smartphone.Autosuggest.prototype.bindClearResultsTimeout=function(){var a=this;this.timeoutID=window.setTimeout(function(){a.removeResults()},4e3)},YELL.smartphone.Autosuggest.prototype.deleteClearResultsTimeout=function(){window.clearTimeout(this.timeoutID)},YELL.smartphone.Autosuggest.prototype.bindResultClick=function(a){var b=this;0!==a.length&&(a.find("li").on("click",function(a){return QSA(b.options.input).val(a.currentTarget.textContent),b.removeResults(),b.deleteClearResultsTimeout(),YELL.smartphone.instances.home&&YELL.smartphone.instances.home.set(b.options.type,a.currentTarget.textContent),!1}),QSA("body").on("click",function(){b.removeResults(),document.body.removeEventListener("click",this)}),this.bindClearResultsTimeout())},YELL.smartphone.Autosuggest.prototype.appendResults=function(a){var b="ac-"+this.options.type,c=QSA("#"+b);if(0===c.length){var d=document.createElement("ul");d.id=b,d.classList.add("autocomplete__list"),d.innerHTML=a,document.body.appendChild(d),this.resultsOpen=!0}else c.innerHTML?c.innerHTML=a:c[0].innerHTML=a,this.resultsOpen=!0;this.deleteClearResultsTimeout(),this.positionResults(c),this.bindResultClick(c)},YELL.smartphone.Autosuggest.prototype.getRemoteResults=function(a,b){QSA.get("/autocomplete/autoComplete.do?type="+this.options.type+"&value="+a,function(c){b(a,JSON.parse(c))})},YELL.smartphone.Autosuggest.prototype.updateResults=function(a,b){var c=this.renderResults(a,b);this.resultsOpen&&c&&this.appendResults(c)},YELL.smartphone.Autosuggest.prototype.getResults=function(a){function b(a,b){c.updateCachedResults(b),c.updateResults(a,c.cachedResults)}var c=this;this.getRemoteResults(a,b);var d=[];this.updateCachedResults(d);var e=this.renderResults(a,this.cachedResults);void 0!==e&&c.appendResults(e)},YELL.smartphone.Autosuggest.prototype.setBindings=function(){var a=this;QSA(this.options.input).on("keyup click",function(b){var c=b.target.value;c.length>=a.options.threshold&&a.getResults(c)}),QSA("body").on("tap",function(){a.removeResults()})},YELL.smartphone.Autosuggest.prototype.setStyles=function(){var a;a=window.pageYOffset+document.body.getBoundingClientRect().top===0?0:window.pageYOffset;var b,c,d,e,f,g;b=QSA(this.options.input),c=b.offset(),d=b.offsetHeight,e=b.offsetWidth/2,f=c.top+d-1-a,g=c.left,this.options.styles={position:"absolute",top:f+"px",left:g+"px",width:e-2+"px"}},YELL.smartphone.Autosuggest.prototype.init=function(){this.setBindings(),this.getCachedResults()},YELL.smartphone.Autosuggest.prototype.disable=function(){this.removeResults()},YELL.smartphone.Autosuggest.prototype.close=function(){this.removeResults()}),function(){var a,b={kwds:{type:"keyword",input:"#keywords"},loc:{type:"location",input:"#location"}},c={},d={};for(a in b)b.hasOwnProperty(a)&&(c=new YELL.smartphone.Autosuggest(b[a]),c.init(),d[b[a].type]=c);return d}(),YELL.smartphone.SearchField=function(){this.init()},YELL.smartphone.SearchField.prototype.getField=function(a){return QSA("#"+a)},YELL.smartphone.SearchField.prototype.getClearButton=function(a){return QSA("#clear-"+a)},YELL.smartphone.SearchField.prototype.addClearButton=function(a){var b=this.getField(a),c=document.createElement("a");c.href="#",c.classList.add("clear-button"),c.classList.add("icon__close"),c.classList.add("search-form__clear"),c.classList.add("search-form__clear--"+a),c.id="clear-"+a,c.textContent="Clear "+a+" field",b.after(c)},YELL.smartphone.SearchField.prototype.showHideClearButton=function(a){""!==this.getField(a).value?this.getClearButton(a).show():this.getClearButton(a).hide()},YELL.smartphone.SearchField.prototype.bindFieldEvents=function(a){var b=this.getField(a),c=this;b.on("keyup change",function(b){c.showHideClearButton(a),"location"===b.currentTarget.id&&YELL.smartphone.instances.Geolocation.clearLatLong()}).on("click touchend",function(a){YELL.smartphone.track(a.currentTarget.id+"-field-selected",a,this)})},YELL.smartphone.SearchField.prototype.bindClearButtonEvents=function(a){var b=this.getClearButton(a),c=this;b.on("touchstart mousedown",function(b){b.preventDefault(),c.getField(a).value="",c.getField(a).trigger("focus"),b.currentTarget.hide(),"clear-location"==b.currentTarget.id&&YELL.smartphone.instances.Geolocation.clearLatLong()})},YELL.smartphone.SearchField.prototype.buildSearchField=function(a){this.addClearButton(a),this.bindFieldEvents(a),this.bindClearButtonEvents(a),this.showHideClearButton(a)},YELL.smartphone.SearchField.prototype.init=function(){var a=this;QSA(".searchField input").forEach(function(b){a.buildSearchField(b.id)})},YELL.smartphone.AjaxSearchField=function(){this.fix="#search-pod",this.init(),this.bindClickToHeaderLinks(),this.bindClickToFilter()},YELL.smartphone.AjaxSearchField.prototype.init=function(){QSA("#home-link a").attr("href",this.fix),QSA(".nav-panel").hide().attr("tabindex","-1")},YELL.smartphone.AjaxSearchField.prototype.bindClickToHeaderLinks=function(){var a=this;QSA("header nav li a").on("click",function(b){"back-link"!==b.currentTarget.parentNode.id&&"results-link"!==b.currentTarget.parentNode.id&&(b&&b.preventDefault(),b.currentTarget.hasClass("is-active")?a.hideNavPanel(b):(a.resetNavPanels(),a.showNavPanel(b)))})},YELL.smartphone.AjaxSearchField.prototype.bindClickToFilter=function(){QSA(".filter-shortcut").on("click",function(a){a.preventDefault(),QSA("#refine-link a").trigger("click")})},YELL.smartphone.AjaxSearchField.prototype.resetNavPanels=function(){QSA("header nav .is-active").removeClass("is-active"),QSA(".nav-panel").hide()},YELL.smartphone.AjaxSearchField.prototype.showNavPanel=function(a){a.currentTarget.classList.toggle("is-active");var b=a.currentTarget.getAttribute("href");QSA(b).show().focus(),b&&b.substr&&YELL.smartphone.track(b.substr(1)+"-open",a,this)},YELL.smartphone.AjaxSearchField.prototype.hideNavPanel=function(a){a.currentTarget.classList.toggle("is-active");var b=a.currentTarget.getAttribute("href");QSA(b).hide(),b&&b.substr&&YELL.smartphone.track(b.substr(1)+"-close",a,this)},YELL.smartphone.RecentActivity=function(){this.data=this.getData(),this.maxSearches=10,this.maxBusinesses=4},YELL.smartphone.RecentActivity.prototype.getData=function(){return YELL.smartphone.utils.hasLocalStorage()&&window.localStorage.getItem("RecentActivity")?JSON.parse(window.localStorage.getItem("RecentActivity")):[]},YELL.smartphone.RecentActivity.prototype.updateLocalStorage=function(){YELL.smartphone.utils.hasLocalStorage()&&window.localStorage.setItem("RecentActivity",JSON.stringify(this.data))},YELL.smartphone.RecentActivity.prototype.updateArray=function(a,b,c){a.splice(0,0,b),a.length>c&&a.pop(),this.updateLocalStorage()},YELL.smartphone.RecentActivity.prototype.addNewSearch=function(a){if(this.data.length){for(var b=1;b<this.data.length;b++)this.data[b].m==a.m&&this.data.splice(b,1);this.data[0].m!=a.m&&this.updateArray(this.data,a,this.maxSearches)}else this.updateArray(this.data,a,this.maxSearches);this.updateLocalStorage()},YELL.smartphone.RecentActivity.prototype.addNewBusiness=function(a){if(this.data.length&&this.data[0].b){for(var b=0;b<this.data[0].b.length;b++)this.data[0].b[b].url==a.url&&this.data[0].b.splice(b,1);this.updateArray(this.data[0].b,a,this.maxBusinesses)}},YELL.smartphone.RecentActivity.prototype.removeSearch=function(a){this.data=this.data.slice(0,a).concat(this.data.slice(a+1)),this.updateLocalStorage()},YELL.smartphone.RecentActivity.prototype.removeAll=function(){this.data=[],this.updateLocalStorage()},YELL.smartphone.RecentHistory=function(){this.updateSearchForm()},YELL.smartphone.RecentHistory.prototype.getRecentLocation=function(){var a=!1;return YELL.smartphone.utils.hasLocalStorage()&&(a=window.localStorage.getItem("recentLocation")||!1),a},YELL.smartphone.RecentHistory.prototype.setRecentLocation=function(a){YELL.smartphone.utils.hasLocalStorage()&&("Current Location"!==a?window.localStorage.setItem("recentLocation",a):window.localStorage.removeItem("recentLocation"))},YELL.smartphone.RecentHistory.prototype.updateSearchForm=function(){var a=this.getRecentLocation(),b=QSA("#location");a&&""===b.value&&(b.value=a)},YELL.smartphone.Call=function(){this.templates={dialog:'<div class="dialog animated fade-in-bottom is-hidden"><div class="dialog__container LocalBusiness" data-adid="{{adId}}"><h4 class="dialog__heading">Which number would you like to call?</h4><a role="button" class="dialog__close" href="#close" data-omniture-listing="dialog-dismiss"><span class="visuallyhidden">Hide this dialog</span></a><nav>{{#:numbers}}<a href="{{number}}" class="btn btn--dialog" data-omniture-listing="call" role="button">{{prefix}}: {{displayname}}</a>{{/numbers}}</nav></div></div>'},this.init()},YELL.smartphone.Call.prototype.init=function(){this.detachHandlers(),document.body.delegate('[data-omniture-listing="call-dialog"]',"click",this.clickHandler.bind(this))},YELL.smartphone.Call.prototype.clickHandler=function(a){var b=[];a.target.parentNode.find('[itemprop="telephone"]').forEach(function(a){b.push({prefix:a.getAttribute("data-prefix"),number:a.getAttribute("data-number"),displayname:a.textContent})});var c=a.target.parentNode.closest(".LocalBusiness"),d=c.getAttribute("data-adid");if(d||(d=c.id),b.length>1){a.preventDefault();var e=document.getElementById("dialog")||document.createElement("div");e.id="dialog",e.innerHTML=this.render(this.templates.dialog,{numbers:b,adId:d}),document.body.appendChild(e),this.reveal(e.children[0]),this.addCloseHandler()}},YELL.smartphone.Call.prototype.detachHandlers=function(){QSA('[data-omniture-listing="call-dialog"]').off("click",this.clickHandler)},YELL.smartphone.Call.prototype.addCloseHandler=function(){this.closeBtn=QSA(".dialog__close"),this.closeBtn.on("click",this.dismiss.bind(this))},YELL.smartphone.Call.prototype.dismiss=function(a){a.preventDefault(),document.getElementById("dialog").children[0].addClass("is-hidden"),this.closeBtn.off("click",this.dismiss)},YELL.smartphone.Call.prototype.render=function(a,b){return a.replace(/\n/g,"~").replace(/\{{([^\:\}]+)\}}|\{{#\:(\w+)\}}(.*?)\{{\/(\w+)\}}/g,function(a,c,d,e){h="";try{if(c)return b[c];ds=b[d];for(var f in ds)h+=this.render(e,ds[f])}catch(g){}return h}.bind(this)).replace(/~/g,"\n")},YELL.smartphone.Call.prototype.reveal=function(a){a.removeClass("is-hidden")};
!function(){for(var a=0,b=["ms","moz","webkit","o"],c=0;c<b.length&&!window.requestAnimationFrame;++c)window.requestAnimationFrame=window[b[c]+"RequestAnimationFrame"],window.cancelAnimationFrame=window[b[c]+"CancelAnimationFrame"]||window[b[c]+"CancelRequestAnimationFrame"];window.requestAnimationFrame||(window.requestAnimationFrame=function(b){var c=(new Date).getTime(),d=Math.max(0,16-(c-a)),e=window.setTimeout(function(){b(c+d)},d);return a=c+d,e}),window.cancelAnimationFrame||(window.cancelAnimationFrame=function(a){clearTimeout(a)})}(),YELL.smartphone.Bip=function(){this.init(),this.addStartPoint(),this.bindEventsToHandlers()},YELL.smartphone.Bip.prototype.init=function(){QSA(".hide").addClass("hidden"),QSA(".button.expand.hidden").removeClass("hidden")},YELL.smartphone.Bip.prototype.addStartPoint=function(){if(QSA.os&&QSA.os.ios===!0){var a=QSA("#route").href+"&saddr=Current Location";QSA("#route").attr("href",a)}},YELL.smartphone.Bip.prototype.bindEventsToHandlers=function(){var a=this;QSA(".button",document.body).on("click",function(b){b.preventDefault(),a.handleButtonClick(b)}),QSA("video").on("click",function(b){a.handleVideoClick(b)})},YELL.smartphone.Bip.prototype.handleVideoClick=function(a){a.currentTarget.play()},YELL.smartphone.Bip.prototype.handleButtonClick=function(a){var b,c,d;b=a.currentTarget,b.toggleClass("open").next().toggleClass("hidden").toggleClass("wasHidden"),c=d=b.hasClass("open")?"More":"Hide",d=b.hasClass("open")?"Hide":"More",a.currentTarget.innerHTML=a.currentTarget.innerHTML.replace(c,d,"gi"),a.currentTarget.parentNode.scrollIntoView(),a.preventDefault()},YELL.smartphone.quickRate=function(){this.hasClicked=!1,this.maxReviews=3,this.element=QSA("[data-quick-rate]"),this.templates={step1:'<div class="quick-rate__title quick-rate__title--step2 left background-fill--green"><button class="quick-rate__btn left" data-btn>Submit</button></div>',step2:'<div class="is-visible"></div>',step3:'<div class="quick-rate__description is-hidden">Thank you for your<div class="icon__stars"><div class="icon__stars__rating" style="width: {{ratingWidth}}" title="{{rating}} out of 5"></div></div><span>QUICK<strong>RATE</strong> on {{date}}</span></div>',error:'<div class="quick-rate__description is-hidden">It looks like you\'ve already rated several businesses today. Please try again tomorrow.</div>',servererror:'<div class="quick-rate__description quick-rate__error">Sorry, there was an error. Please try again.</div>'},this.init()},YELL.smartphone.quickRate.prototype.preFilter=function(a){var b;return b=a.filter(function(a){return!this.timeAgo(a.timestamp)}.bind(this))},YELL.smartphone.quickRate.prototype.timeAgo=function(a){a=new Date(a);var b=new Date,c=(b.getTime()-a.getTime())/1e3;return parseInt(c/3600)>=24},YELL.smartphone.quickRate.prototype.render=function(a,b){return a.replace(/\{{ *([\w_]+) *\}}/g,function(a,c){var d=b[c];return d})},YELL.smartphone.quickRate.prototype.handleClick=function(a){var b,c;b=[].slice.apply(QSA("[data-label]")),c=a.currentTarget.attr("data-index"),b.forEach(function(a,b){c>=b?a.addClass("icon__star--large--active").removeClass("icon__star--large--inactive"):a.addClass("icon__star--large--inactive").removeClass("icon__star--large--active")})},YELL.smartphone.quickRate.prototype.updateView=function(){0===QSA("[data-btn]").length&&(QSA("[data-header]").innerHTML=this.render(this.templates.step1,{}),this.reveal(QSA("[data-header] .is-hidden")))},YELL.smartphone.quickRate.prototype.handleEvents=function(){QSA("[data-label]").on("click",function(a){this.hasClicked||(this.hasClicked=!0,YELL.smartphone.track("quickrate/start")),this.handleClick(a),this.updateView()}.bind(this)),QSA("[data-form]").on("submit",function(a){var b,c;c=QSA("[name=rating]:checked").value,b=a.currentTarget.attr("action")+"&rating="+c,QSA("[data-form]").style.opacity="0.25",QSA.post(b,null,this.handleSuccess.bind(this),this.handleError.bind(this),1e4),YELL.smartphone.track("quickrate/submit-"+c),a.preventDefault()}.bind(this))},YELL.smartphone.quickRate.prototype.updateModel=function(){var a;this.model={natid:QSA("[data-form]").attr("action").match(/[0-9]/g).join(""),rating:QSA("[name=rating]:checked").value,timestamp:Date.now()},a=JSON.parse(localStorage.getItem("quick-rate"))||[],a.push(this.model),this.response=this.data=a,localStorage.setItem("quick-rate",JSON.stringify(a))},YELL.smartphone.quickRate.prototype.handleSuccess=function(){var a,b,c;this.enabled&&this.updateModel(),a=this.model.rating>0?!0:!1,c={"true":"step3","false":"error"},a||YELL.smartphone.track("quickrate/max-limit-error"),b=this.templates[c[a]],QSA("[data-content]").innerHTML=this.render(b,{date:this.formatDate(this.model.timestamp),rating:this.model.rating,ratingWidth:12*this.model.rating+"px"}),this.reveal(QSA("[data-content] .is-hidden")),QSA("[data-form]").style.opacity="1"},YELL.smartphone.quickRate.prototype.handleError=function(){QSA("[data-error]").innerHTML=this.render(this.templates.servererror,{}),QSA("[data-header]").innerHTML=this.render(this.templates.step1,{}),this.reveal(QSA("[data-header] .is-hidden")),QSA("[data-form]").style.opacity="1",YELL.smartphone.track("quickrate/error")},YELL.smartphone.quickRate.prototype.reveal=function(a){a.removeClass("is-hidden")},YELL.smartphone.quickRate.prototype.formatDate=function(a){var b,c,d,e,f,g;return e=["January","February","March","April","May","June","July","August","September","October","November","December"],b=new Date(a),c=b.getFullYear(),d=e[b.getMonth()],f=b.getDate(),g=this.render("{{day}} {{month}} {{year}}",{day:f,month:d,year:c})},YELL.smartphone.quickRate.prototype.init=function(){0!==this.element.length&&(this.data=localStorage.getItem("quick-rate")?JSON.parse(localStorage.getItem("quick-rate")):[],this.response=this.data.filter(function(a){return a.natid===QSA("[data-form]").attr("action").match(/[0-9]/g).join("")}.bind(this)),this.model=this.response[0]||{},this.enabled=!this.model.rating&&this.preFilter(this.data).length<this.maxReviews,this.handleEvents(),this.enabled||this.handleSuccess(),YELL.smartphone.utils.hasLocalStorage()&&this.reveal(this.element))},YELL.smartphone.externalAds=function(){this.url="http://aka-cdn-ns.adtech.de/dt/common/DAC.js",this.lastPosition=-1,this.element=QSA("[data-externaladvert]"),this.transitionEndEvents={transition:"transitionend","-webkit-transition":"webkitTransitionEnd"},this.element.length<1||(this.keywords=this.element.attr("data-keywords").split(","),this.location=this.element.attr("data-location").split(","),this.init())},YELL.smartphone.externalAds.prototype.handleEvents=function(){document.body.scrollTop=document.documentElement.scrollTop=0,QSA("body").on("click",this.updateView.bind(this)),this.element.on("click",function(a){var b;b=a.currentTarget.getAttribute("data-omniture-listing"),YELL.smartphone.track(b,a,this)}),window.addEventListener("resize",this.updateView.bind(this)),window.requestAnimationFrame(this.checkScroll.bind(this))},YELL.smartphone.externalAds.prototype.checkScroll=function(){return this.lastPosition===window.pageYOffset||0===window.pageYOffset?(window.requestAnimationFrame(this.checkScroll.bind(this)),!1):(this.lastPosition=window.pageYOffset,this.updateView(),void window.requestAnimationFrame(this.checkScroll.bind(this)))},YELL.smartphone.externalAds.prototype.updateView=function(){this.element.removeClass("transition__fade-in"),this.element.addClass("transition__fade-out");for(var a in this.transitionEndEvents)void 0!==this.element.style[a]&&this.transitionEndEvents.hasOwnProperty(a)&&this.element.on(this.transitionEndEvents[a],this.element.addClass("is-hidden"))},YELL.smartphone.externalAds.prototype.renderAdvert=function(){var a;a=parseInt(this.element.attr("id")),ADTECH.config.website={server:"adserver.adtech.de",network:"1586.1",kv:{kwds:this.keywords,location:this.location}},ADTECH.enqueueAd(a),ADTECH.executeQueue(),window.setTimeout(this.handleEvents.bind(this),500)},YELL.smartphone.externalAds.prototype.init=function(){this.loadScript(this.url,this.renderAdvert.bind(this))},YELL.smartphone.externalAds.prototype.loadScript=function(a,b){var c,d;c=document.head||document.getElementsByTagName("head"),d=document.createElement("script"),d.type="text/javascript",d.src=a,d.onload=b,c.insertBefore(d,c.firstChild)},YELL.smartphone.reviews=function(){this.element=QSA("[data-reviews]"),0!==this.element.length&&(this.maxLength=250,this.template='<span class="more">{{current}}</span><span class="less" data-toggle="less" data-reveal-element>{{remaining}}</span><a href="#" data-reveal data-toggle="more" data-omniture-listing="see-more-{{type}}" class="media__item--expand">View more</a><a href="#" data-reveal data-toggle="less" data-omniture-listing="see-less-{{type}}" class="media__item--expand">View less</a>',this.view="View {{action}}",this.init())},YELL.smartphone.reviews.prototype.render=function(a,b){return a.replace(/\{{ *([\w_]+) *\}}/g,function(a,c){var d=b[c];return d})},YELL.smartphone.reviews.prototype.truncate=function(){var a,b,c,d;a=QSA("[itemprop=description]"),(a.length>0||"undefined"==typeof a.length)&&(a=a.length>0?a:[a],a.forEach(function(a){d=a.attr("data-item"),a.innerHTML.length>this.maxLength&&(b={current:a.innerHTML.substring(0,this.maxLength),remaining:a.innerHTML.substring(this.maxLength,a.innerHTML.length),type:d},c=this.render(this.template,b),a.innerHTML=c)},this))},YELL.smartphone.reviews.prototype.handleClick=function(a){var b,c,d;b=a.currentTarget.closest("[data-reveal-parent]"),c={expanded:"contracted",contracted:"expanded"},d=b.attr("data-reveal-parent"),b.find(".is-hidden").removeClass("is-hidden"),b.find("[data-toggle="+c[d]+"]").addClass("is-hidden"),b.attr("data-reveal-parent",c[d]),a.preventDefault()},YELL.smartphone.reviews.prototype.init=function(){this.truncate(),QSA("[data-reveal]").on("click",this.handleClick.bind(this))},YELL.smartphone.relatedAds=function(){function a(a){if(a){c=a;var d=a.getAttribute("data-keywords"),f=a.getAttribute("data-location");QSA.get(e+"?location="+f+"&keywords="+d+"&contentFilter=true&view=ajaxads&filter=6",b)}}function b(a){a.indexOf("Similar businesses near")<0&&(a=""),c.innerHTML=a}var c,d={},e="/ucs/UcsSearchAction.do";return d.init=a,d}(),function(){YELL.smartphone.relatedAds.init(document.getElementById("relatedAds"))}();
window.matchMedia||(window.matchMedia=function(){"use strict";var a=window.styleMedia||window.media;if(!a){var b=document.createElement("style"),c=document.getElementsByTagName("script")[0],d=null;b.type="text/css",b.id="matchmediajs-test",c.parentNode.insertBefore(b,c),d="getComputedStyle"in window&&window.getComputedStyle(b,null)||b.currentStyle,a={matchMedium:function(a){var c="@media "+a+"{ #matchmediajs-test { width: 1px; } }";return b.styleSheet?b.styleSheet.cssText=c:b.textContent=c,"1px"===d.width}}}return function(b){return{matches:a.matchMedium(b||"all"),media:b||"all"}}}()),function(a,b){"use strict";function c(a){var b,c,d,f,g,h;a=a||{},b=a.elements||e.getAllElements();for(var i=0,j=b.length;j>i;i++)if(c=b[i],d=c.nodeName.toUpperCase(),f=void 0,g=void 0,h=void 0,c[e.ns]||(c[e.ns]={}),a.reevaluate||!c[e.ns].evaluated){if("PICTURE"===d){if(e.removeVideoShim(c),f=e.getMatch(c),f===!1)continue;h=c.getElementsByTagName("img")[0]}else f=void 0,h=c;h&&(h[e.ns]||(h[e.ns]={}),h.srcset&&("PICTURE"===d||h.getAttribute("sizes"))&&e.dodgeSrcset(h),f?(g=e.processSourceSet(f),e.applyBestCandidate(g,h)):(g=e.processSourceSet(h),(void 0===h.srcset||h[e.ns].srcset)&&e.applyBestCandidate(g,h)),c[e.ns].evaluated=!0)}}function d(){c();var d=setInterval(function(){return c(),/^loaded|^i|^c/.test(b.readyState)?void clearInterval(d):void 0},250);if(a.addEventListener){var e;a.addEventListener("resize",function(){a._picturefillWorking||(a._picturefillWorking=!0,a.clearTimeout(e),e=a.setTimeout(function(){c({reevaluate:!0}),a._picturefillWorking=!1},60))},!1)}}if(!a.HTMLPictureElement){b.createElement("picture");var e={};e.ns="picturefill",e.srcsetSupported=void 0!==(new a.Image).srcset,e.trim=function(a){return a.trim?a.trim():a.replace(/^\s+|\s+$/g,"")},e.endsWith=function(a,b){return a.endsWith?a.endsWith(b):-1!==a.indexOf(b,a.length-b.length)},e.matchesMedia=function(b){return a.matchMedia&&a.matchMedia(b).matches},e.getDpr=function(){return a.devicePixelRatio||1},e.getWidthFromLength=function(a){return a=a&&parseFloat(a)>0?a:"100vw",a=a.replace("vw","%"),e.lengthEl||(e.lengthEl=b.createElement("div"),b.documentElement.insertBefore(e.lengthEl,b.documentElement.firstChild)),e.lengthEl.style.cssText="position: absolute; left: 0; width: "+a+";",e.lengthEl.offsetWidth},e.types={},e.types["image/jpeg"]=!0,e.types["image/gif"]=!0,e.types["image/png"]=!0,e.types["image/svg+xml"]=b.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#Image","1.1"),e.types["image/webp"]=function(){var b=new a.Image,d="image/webp";b.onerror=function(){e.types[d]=!1,c()},b.onload=function(){e.types[d]=1===b.width,c()},b.src="data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA="},e.verifyTypeSupport=function(a){var b=a.getAttribute("type");return null===b||""===b?!0:"function"==typeof e.types[b]?(e.types[b](),"pending"):e.types[b]},e.parseSize=function(a){var b=/(\([^)]+\))?\s*(.+)/g.exec(a);return{media:b&&b[1],length:b&&b[2]}},e.findWidthFromSourceSize=function(a){for(var b,c=e.trim(a).split(/\s*,\s*/),d=0,f=c.length;f>d;d++){var g=c[d],h=e.parseSize(g),i=h.length,j=h.media;if(i&&(!j||e.matchesMedia(j))){b=i;break}}return e.getWidthFromLength(b)},e.parseSrcset=function(a){for(var b=[];""!==a;){a=a.replace(/^\s+/g,"");var c,d=a.search(/\s/g),e=null;if(-1!==d){c=a.slice(0,d);var f=c[c.length-1];if((","===f||""===c)&&(c=c.replace(/,+$/,""),e=""),a=a.slice(d+1),null===e){var g=a.indexOf(",");-1!==g?(e=a.slice(0,g),a=a.slice(g+1)):(e=a,a="")}}else c=a,a="";(c||e)&&b.push({url:c,descriptor:e})}return b},e.parseDescriptor=function(a,b){var c,d=a&&a.replace(/(^\s+|\s+$)/g,""),f=b?e.findWidthFromSourceSize(b):"100%";if(d)for(var g=d.split(" "),h=g.length+1;h>=0;h--){var i=g[h],j=i&&i.slice(i.length-1);if(("w"===j||"x"===j)&&(c=i),b&&c)c=parseFloat(parseInt(i,10)/f);else{var k=i&&parseFloat(i,10);c=k&&!isNaN(k)&&"x"===j||"w"===j?k:1}}else c=1;return c},e.getCandidatesFromSourceSet=function(a,b){for(var c=e.parseSrcset(a),d=[],f=0,g=c.length;g>f;f++){var h=c[f];d.push({url:h.url,resolution:e.parseDescriptor(h.descriptor,b)})}return d},e.dodgeSrcset=function(a){a.srcset&&(a[e.ns].srcset=a.srcset,a.removeAttribute("srcset"))},e.processSourceSet=function(a){var b=a.getAttribute("srcset"),c=a.getAttribute("sizes"),d=[];return"IMG"===a.nodeName.toUpperCase()&&a[e.ns]&&a[e.ns].srcset&&(b=a[e.ns].srcset),b&&(d=e.getCandidatesFromSourceSet(b,c)),d},e.applyBestCandidate=function(a,b){var c,d,f;a.sort(e.ascendingSort),d=a.length,f=a[d-1];for(var g=0;d>g;g++)if(c=a[g],c.resolution>=e.getDpr()){f=c;break}e.endsWith(b.src,f.url)||(b.src=f.url,b.currentSrc=b.src)},e.ascendingSort=function(a,b){return a.resolution-b.resolution},e.removeVideoShim=function(a){var b=a.getElementsByTagName("video");if(b.length){for(var c=b[0],d=c.getElementsByTagName("source");d.length;)a.insertBefore(d[0],c);c.parentNode.removeChild(c)}},e.getAllElements=function(){for(var a=b.getElementsByTagName("picture"),c=[],d=b.getElementsByTagName("img"),f=0,g=a.length+d.length;g>f;f++)if(f<a.length)c[f]=a[f];else{var h=d[f-a.length];"PICTURE"!==h.parentNode.nodeName.toUpperCase()&&(e.srcsetSupported&&h.getAttribute("sizes")||null!==h.getAttribute("srcset"))&&c.push(h)}return c},e.getMatch=function(a){for(var b,c=a.childNodes,d=0,f=c.length;f>d;d++){var g=c[d];if(1===g.nodeType){if("IMG"===g.nodeName.toUpperCase())return b;if("SOURCE"===g.nodeName.toUpperCase()){var h=g.getAttribute("media");if(g.getAttribute("srcset")&&(!h||e.matchesMedia(h))){var i=e.verifyTypeSupport(g);if(i===!0){b=g;break}if("pending"===i)return!1}}}}return b},d(),c._=e,"object"==typeof module&&"object"==typeof module.exports?module.exports=c:"function"==typeof define&&define.amd?define(function(){return c}):"object"==typeof a&&(a.picturefill=c)}}(this,this.document),function(a,b){"use strict";function c(){d.READY||(s.determineEventTypes(),r.each(d.gestures,function(a){u.register(a)}),s.onTouch(d.DOCUMENT,n,u.detect),s.onTouch(d.DOCUMENT,o,u.detect),d.READY=!0)}var d=function v(a,b){return new v.Instance(a,b||{})};d.VERSION="1.1.3",d.defaults={behavior:{userSelect:"none",touchAction:"pan-y",touchCallout:"none",contentZooming:"none",userDrag:"none",tapHighlightColor:"rgba(0,0,0,0)"}},d.DOCUMENT=document,d.HAS_POINTEREVENTS=navigator.pointerEnabled||navigator.msPointerEnabled,d.HAS_TOUCHEVENTS="ontouchstart"in a,d.IS_MOBILE=/mobile|tablet|ip(ad|hone|od)|android|silk/i.test(navigator.userAgent),d.NO_MOUSEEVENTS=d.HAS_TOUCHEVENTS&&d.IS_MOBILE||d.HAS_POINTEREVENTS,d.CALCULATE_INTERVAL=25;var e={},f=d.DIRECTION_DOWN="down",g=d.DIRECTION_LEFT="left",h=d.DIRECTION_UP="up",i=d.DIRECTION_RIGHT="right",j=d.POINTER_MOUSE="mouse",k=d.POINTER_TOUCH="touch",l=d.POINTER_PEN="pen",m=d.EVENT_START="start",n=d.EVENT_MOVE="move",o=d.EVENT_END="end",p=d.EVENT_RELEASE="release",q=d.EVENT_TOUCH="touch";d.READY=!1,d.plugins=d.plugins||{},d.gestures=d.gestures||{};var r=d.utils={extend:function(a,c,d){for(var e in c)!c.hasOwnProperty(e)||a[e]!==b&&d||(a[e]=c[e]);return a},on:function(a,b,c){a.addEventListener(b,c,!1)},off:function(a,b,c){a.removeEventListener(b,c,!1)},each:function(a,c,d){var e,f;if("forEach"in a)a.forEach(c,d);else if(a.length!==b){for(e=0,f=a.length;f>e;e++)if(c.call(d,a[e],e,a)===!1)return}else for(e in a)if(a.hasOwnProperty(e)&&c.call(d,a[e],e,a)===!1)return},inStr:function(a,b){return a.indexOf(b)>-1},inArray:function(a,b){if(a.indexOf){var c=a.indexOf(b);return-1===c?!1:c}for(var d=0,e=a.length;e>d;d++)if(a[d]===b)return d;return!1},toArray:function(a){return Array.prototype.slice.call(a,0)},hasParent:function(a,b){for(;a;){if(a==b)return!0;a=a.parentNode}return!1},getCenter:function(a){var b=[],c=[],d=[],e=[],f=Math.min,g=Math.max;return 1===a.length?{pageX:a[0].pageX,pageY:a[0].pageY,clientX:a[0].clientX,clientY:a[0].clientY}:(r.each(a,function(a){b.push(a.pageX),c.push(a.pageY),d.push(a.clientX),e.push(a.clientY)}),{pageX:(f.apply(Math,b)+g.apply(Math,b))/2,pageY:(f.apply(Math,c)+g.apply(Math,c))/2,clientX:(f.apply(Math,d)+g.apply(Math,d))/2,clientY:(f.apply(Math,e)+g.apply(Math,e))/2})},getVelocity:function(a,b,c){return{x:Math.abs(b/a)||0,y:Math.abs(c/a)||0}},getAngle:function(a,b){var c=b.clientX-a.clientX,d=b.clientY-a.clientY;return 180*Math.atan2(d,c)/Math.PI},getDirection:function(a,b){var c=Math.abs(a.clientX-b.clientX),d=Math.abs(a.clientY-b.clientY);return c>=d?a.clientX-b.clientX>0?g:i:a.clientY-b.clientY>0?h:f},getDistance:function(a,b){var c=b.clientX-a.clientX,d=b.clientY-a.clientY;return Math.sqrt(c*c+d*d)},getScale:function(a,b){return a.length>=2&&b.length>=2?this.getDistance(b[0],b[1])/this.getDistance(a[0],a[1]):1},getRotation:function(a,b){return a.length>=2&&b.length>=2?this.getAngle(b[1],b[0])-this.getAngle(a[1],a[0]):0},isVertical:function(a){return a==h||a==f},setPrefixedCss:function(a,b,c,d){var e=["","Webkit","Moz","O","ms"];b=r.toCamelCase(b);for(var f=0;f<e.length;f++){var g=b;if(e[f]&&(g=e[f]+g.slice(0,1).toUpperCase()+g.slice(1)),g in a.style){a.style[g]=(null==d||d)&&c||"";break}}},toggleBehavior:function(a,b,c){if(b&&a&&a.style){r.each(b,function(b,d){r.setPrefixedCss(a,d,b,c)});var d=c&&function(){return!1};"none"==b.userSelect&&(a.onselectstart=d),"none"==b.userDrag&&(a.ondragstart=d)}},toCamelCase:function(a){return a.replace(/[_-]([a-z])/g,function(a){return a[1].toUpperCase()})}},s=d.event={preventMouseEvents:!1,started:!1,shouldDetect:!1,on:function(a,b,c,d){var e=b.split(" ");r.each(e,function(b){r.on(a,b,c),d&&d(b)})},off:function(a,b,c,d){var e=b.split(" ");r.each(e,function(b){r.off(a,b,c),d&&d(b)})},onTouch:function(a,b,c){var f=this,g=function(e){var g,h=e.type.toLowerCase(),i=d.HAS_POINTEREVENTS,j=r.inStr(h,"mouse");j&&f.preventMouseEvents||(j&&b==m&&0===e.button?(f.preventMouseEvents=!1,f.shouldDetect=!0):i&&b==m?f.shouldDetect=1===e.buttons||t.matchType(k,e):j||b!=m||(f.preventMouseEvents=!0,f.shouldDetect=!0),i&&b!=o&&t.updatePointer(b,e),f.shouldDetect&&(g=f.doDetect.call(f,e,b,a,c)),g==o&&(f.preventMouseEvents=!1,f.shouldDetect=!1,t.reset()),i&&b==o&&t.updatePointer(b,e))};return this.on(a,e[b],g),g},doDetect:function(a,b,c,d){var e=this.getTouchList(a,b),f=e.length,g=b,h=e.trigger,i=f;b==m?h=q:b==o&&(h=p,i=e.length-(a.changedTouches?a.changedTouches.length:1)),i>0&&this.started&&(g=n),this.started=!0;var j=this.collectEventData(c,g,e,a);return b!=o&&d.call(u,j),h&&(j.changedLength=i,j.eventType=h,d.call(u,j),j.eventType=g,delete j.changedLength),g==o&&(d.call(u,j),this.started=!1),g},determineEventTypes:function(){var b;return b=d.HAS_POINTEREVENTS?a.PointerEvent?["pointerdown","pointermove","pointerup pointercancel lostpointercapture"]:["MSPointerDown","MSPointerMove","MSPointerUp MSPointerCancel MSLostPointerCapture"]:d.NO_MOUSEEVENTS?["touchstart","touchmove","touchend touchcancel"]:["touchstart mousedown","touchmove mousemove","touchend touchcancel mouseup"],e[m]=b[0],e[n]=b[1],e[o]=b[2],e},getTouchList:function(a,b){if(d.HAS_POINTEREVENTS)return t.getTouchList();if(a.touches){if(b==n)return a.touches;var c=[],e=[].concat(r.toArray(a.touches),r.toArray(a.changedTouches)),f=[];return r.each(e,function(a){r.inArray(c,a.identifier)===!1&&f.push(a),c.push(a.identifier)}),f}return a.identifier=1,[a]},collectEventData:function(a,b,c,d){var e=k;return r.inStr(d.type,"mouse")||t.matchType(j,d)?e=j:t.matchType(l,d)&&(e=l),{center:r.getCenter(c),timeStamp:Date.now(),target:d.target,touches:c,eventType:b,pointerType:e,srcEvent:d,preventDefault:function(){var a=this.srcEvent;a.preventManipulation&&a.preventManipulation(),a.preventDefault&&a.preventDefault()},stopPropagation:function(){this.srcEvent.stopPropagation()},stopDetect:function(){return u.stopDetect()}}}},t=d.PointerEvent={pointers:{},getTouchList:function(){var a=[];return r.each(this.pointers,function(b){a.push(b)}),a},updatePointer:function(a,b){a==o?delete this.pointers[b.pointerId]:(b.identifier=b.pointerId,this.pointers[b.pointerId]=b)},matchType:function(a,b){if(!b.pointerType)return!1;var c=b.pointerType,d={};return d[j]=c===(b.MSPOINTER_TYPE_MOUSE||j),d[k]=c===(b.MSPOINTER_TYPE_TOUCH||k),d[l]=c===(b.MSPOINTER_TYPE_PEN||l),d[a]},reset:function(){this.pointers={}}},u=d.detection={gestures:[],current:null,previous:null,stopped:!1,startDetect:function(a,b){this.current||(this.stopped=!1,this.current={inst:a,startEvent:r.extend({},b),lastEvent:!1,lastCalcEvent:!1,futureCalcEvent:!1,lastCalcData:{},name:""},this.detect(b))},detect:function(a){if(this.current&&!this.stopped){a=this.extendEventData(a);var b=this.current.inst,c=b.options;return r.each(this.gestures,function(d){!this.stopped&&b.enabled&&c[d.name]&&d.handler.call(d,a,b)},this),this.current&&(this.current.lastEvent=a),a.eventType==o&&this.stopDetect(),a}},stopDetect:function(){this.previous=r.extend({},this.current),this.current=null,this.stopped=!0},getCalculatedData:function(a,b,c,e,f){var g=this.current,h=!1,i=g.lastCalcEvent,j=g.lastCalcData;i&&a.timeStamp-i.timeStamp>d.CALCULATE_INTERVAL&&(b=i.center,c=a.timeStamp-i.timeStamp,e=a.center.clientX-i.center.clientX,f=a.center.clientY-i.center.clientY,h=!0),(a.eventType==q||a.eventType==p)&&(g.futureCalcEvent=a),(!g.lastCalcEvent||h)&&(j.velocity=r.getVelocity(c,e,f),j.angle=r.getAngle(b,a.center),j.direction=r.getDirection(b,a.center),g.lastCalcEvent=g.futureCalcEvent||a,g.futureCalcEvent=a),a.velocityX=j.velocity.x,a.velocityY=j.velocity.y,a.interimAngle=j.angle,a.interimDirection=j.direction},extendEventData:function(a){var b=this.current,c=b.startEvent,d=b.lastEvent||c;(a.eventType==q||a.eventType==p)&&(c.touches=[],r.each(a.touches,function(a){c.touches.push({clientX:a.clientX,clientY:a.clientY})}));var e=a.timeStamp-c.timeStamp,f=a.center.clientX-c.center.clientX,g=a.center.clientY-c.center.clientY;return this.getCalculatedData(a,d.center,e,f,g),r.extend(a,{startEvent:c,deltaTime:e,deltaX:f,deltaY:g,distance:r.getDistance(c.center,a.center),angle:r.getAngle(c.center,a.center),direction:r.getDirection(c.center,a.center),scale:r.getScale(c.touches,a.touches),rotation:r.getRotation(c.touches,a.touches)}),a},register:function(a){var c=a.defaults||{};return c[a.name]===b&&(c[a.name]=!0),r.extend(d.defaults,c,!0),a.index=a.index||1e3,this.gestures.push(a),this.gestures.sort(function(a,b){return a.index<b.index?-1:a.index>b.index?1:0}),this.gestures}};d.Instance=function(a,b){var e=this;c(),this.element=a,this.enabled=!0,r.each(b,function(a,c){delete b[c],b[r.toCamelCase(c)]=a}),this.options=r.extend(r.extend({},d.defaults),b||{}),this.options.behavior&&r.toggleBehavior(this.element,this.options.behavior,!0),this.eventStartHandler=s.onTouch(a,m,function(a){e.enabled&&a.eventType==m?u.startDetect(e,a):a.eventType==q&&u.detect(a)}),this.eventHandlers=[]},d.Instance.prototype={on:function(a,b){var c=this;return s.on(c.element,a,b,function(a){c.eventHandlers.push({gesture:a,handler:b})}),c},off:function(a,b){var c=this;return s.off(c.element,a,b,function(a){var d=r.inArray({gesture:a,handler:b});d!==!1&&c.eventHandlers.splice(d,1)}),c},trigger:function(a,b){b||(b={});var c=d.DOCUMENT.createEvent("Event");c.initEvent(a,!0,!0),c.gesture=b;var e=this.element;return r.hasParent(b.target,e)&&(e=b.target),e.dispatchEvent(c),this},enable:function(a){return this.enabled=a,this},dispose:function(){var a,b;for(r.toggleBehavior(this.element,this.options.behavior,!1),a=-1;b=this.eventHandlers[++a];)r.off(this.element,b.gesture,b.handler);return this.eventHandlers=[],s.off(this.element,e[m],this.eventStartHandler),null}},function(a){function b(b,d){var e=u.current;if(!(d.options.dragMaxTouches>0&&b.touches.length>d.options.dragMaxTouches))switch(b.eventType){case m:c=!1;break;case n:if(b.distance<d.options.dragMinDistance&&e.name!=a)return;var j=e.startEvent.center;if(e.name!=a&&(e.name=a,d.options.dragDistanceCorrection&&b.distance>0)){var k=Math.abs(d.options.dragMinDistance/b.distance);j.pageX+=b.deltaX*k,j.pageY+=b.deltaY*k,j.clientX+=b.deltaX*k,j.clientY+=b.deltaY*k,b=u.extendEventData(b)}(e.lastEvent.dragLockToAxis||d.options.dragLockToAxis&&d.options.dragLockMinDistance<=b.distance)&&(b.dragLockToAxis=!0);var l=e.lastEvent.direction;b.dragLockToAxis&&l!==b.direction&&(b.direction=r.isVertical(l)?b.deltaY<0?h:f:b.deltaX<0?g:i),c||(d.trigger(a+"start",b),c=!0),d.trigger(a,b),d.trigger(a+b.direction,b);var q=r.isVertical(b.direction);(d.options.dragBlockVertical&&q||d.options.dragBlockHorizontal&&!q)&&b.preventDefault();break;case p:c&&b.changedLength<=d.options.dragMaxTouches&&(d.trigger(a+"end",b),c=!1);break;case o:c=!1}}var c=!1;d.gestures.Drag={name:a,index:50,handler:b,defaults:{dragMinDistance:10,dragDistanceCorrection:!0,dragMaxTouches:1,dragBlockHorizontal:!1,dragBlockVertical:!1,dragLockToAxis:!1,dragLockMinDistance:25}}}("drag"),d.gestures.Gesture={name:"gesture",index:1337,handler:function(a,b){b.trigger(this.name,a)}},function(a){function b(b,d){var e=d.options,f=u.current;switch(b.eventType){case m:clearTimeout(c),f.name=a,c=setTimeout(function(){f&&f.name==a&&d.trigger(a,b)},e.holdTimeout);break;case n:b.distance>e.holdThreshold&&clearTimeout(c);break;case p:clearTimeout(c)}}var c;d.gestures.Hold={name:a,index:10,defaults:{holdTimeout:500,holdThreshold:2},handler:b}}("hold"),d.gestures.Release={name:"release",index:1/0,handler:function(a,b){a.eventType==p&&b.trigger(this.name,a)}},d.gestures.Swipe={name:"swipe",index:40,defaults:{swipeMinTouches:1,swipeMaxTouches:1,swipeVelocityX:.6,swipeVelocityY:.6},handler:function(a,b){if(a.eventType==p){var c=a.touches.length,d=b.options;if(c<d.swipeMinTouches||c>d.swipeMaxTouches)return;(a.velocityX>d.swipeVelocityX||a.velocityY>d.swipeVelocityY)&&(b.trigger(this.name,a),b.trigger(this.name+a.direction,a))}}},function(a){function b(b,d){var e,f,g=d.options,h=u.current,i=u.previous;switch(b.eventType){case m:c=!1;break;case n:c=c||b.distance>g.tapMaxDistance;break;case o:!r.inStr(b.srcEvent.type,"cancel")&&b.deltaTime<g.tapMaxTime&&!c&&(e=i&&i.lastEvent&&b.timeStamp-i.lastEvent.timeStamp,f=!1,i&&i.name==a&&e&&e<g.doubleTapInterval&&b.distance<g.doubleTapDistance&&(d.trigger("doubletap",b),f=!0),(!f||g.tapAlways)&&(h.name=a,d.trigger(h.name,b)))}}var c=!1;d.gestures.Tap={name:a,index:100,handler:b,defaults:{tapMaxTime:250,tapMaxDistance:10,tapAlways:!0,doubleTapDistance:20,doubleTapInterval:300}}}("tap"),d.gestures.Touch={name:"touch",index:-1/0,defaults:{preventDefault:!1,preventMouse:!1},handler:function(a,b){return b.options.preventMouse&&a.pointerType==j?void a.stopDetect():(b.options.preventDefault&&a.preventDefault(),void(a.eventType==q&&b.trigger("touch",a)))}},function(a){function b(b,d){switch(b.eventType){case m:c=!1;break;case n:if(b.touches.length<2)return;var e=Math.abs(1-b.scale),f=Math.abs(b.rotation);if(e<d.options.transformMinScale&&f<d.options.transformMinRotation)return;u.current.name=a,c||(d.trigger(a+"start",b),c=!0),d.trigger(a,b),f>d.options.transformMinRotation&&d.trigger("rotate",b),e>d.options.transformMinScale&&(d.trigger("pinch",b),d.trigger("pinch"+(b.scale<1?"in":"out"),b));break;case p:c&&b.changedLength<2&&(d.trigger(a+"end",b),c=!1)}}var c=!1;d.gestures.Transform={name:a,index:45,defaults:{transformMinScale:.01,transformMinRotation:1},handler:b}}("transform"),"function"==typeof define&&define.amd?define(function(){return d}):"undefined"!=typeof module&&module.exports?module.exports=d:a.Hammer=d}(window),YELL.smartphone.carousel=function(a){this.element=QSA(a),this.container=QSA("[data-carousel-group]"),this.panes=QSA("[data-carousel-item]"),this.panes=this.panes.length>1?this.panes:[this.panes],this.pane_width=0,this.pane_count=this.panes.length,this.current_pane=0,this.assets=QSA("[data-carousel-group] [data-src]"),this.assets=this.assets.length>1?this.assets:[this.assets],this.paginator=QSA("[data-carousel-pagination]"),this.pageWidth=window.innerWidth,this.pageHeight=window.innerHeight,this.transitionEndEvents={transition:"transitionend","-webkit-transition":"webkitTransitionEnd"},this.transforms={webkitTransform:"-webkit-transform",OTransform:"-o-transform",msTransform:"-ms-transform",MozTransform:"-moz-transform",transform:"transform"},this.templates={pagination:"{{current}} of {{total}}",element:'<source srcset="{{url}}?t=tr/w:{{width}}/h:{{height}}/q:75, {{url}}?t=tr/w:{{dblWidth}}/h:{{dblHeight}}/q:75 2x" media="(min-device-width : 768px) and (max-device-width : 1024px)"/><source srcset="{{url}}?t=tr/w:{{width}}/h:{{height}}/q:50, {{url}}?t=tr/w:{{dblWidth}}/h:{{dblHeight}}/q:50 2x" media="(min-device-width : 320px) and (max-device-width : 480px)"/><source srcset="{{url}}?t=tr/w:{{width}}/h:{{height}}/q:25, {{url}}?t=tr/w:{{dblWidth}}/h:{{dblHeight}}/q:25 2x"/><img class="lightbox__image" srcset="{{url}}?t=tr/w:{{width}}/h:{{height}}/q:25, {{url}}?t=tr/w:{{dblWidth}}/h:{{dblHeight}}/q:25 2x" alt="{{alt}}"/>',"aria-selected":"{{selected}}","aria-hidden":"{{visible}}",tabindex:"{{focus}}"},this.init()},YELL.smartphone.carousel.prototype.queue=function(){var a=arguments;return function(b){for(var c=a.length-1;c>-1;c--)b=window.requestAnimationFrame(a[c].bind(this,b));return b}},YELL.smartphone.carousel.prototype.handleClick=function(a){var b;b=a.target.parentNode.getAttribute("data-carousel-index"),this.queue(this.preloadAssets.bind(this,[b]))(),this.showPane(b,!0)},YELL.smartphone.carousel.prototype.handlekeydown=function(a){var b;b={27:function(){document.location="#photo-gallery"},37:function(){return this.current_pane-1},39:function(){return this.current_pane+1}},b[a.keyCode]&&"number"==typeof b[a.keyCode]()&&(this.queue(this.preloadAssets.bind(this,[b[a.keyCode].call(this)]))(),this.showPane(b[a.keyCode].call(this),!0))},YELL.smartphone.carousel.prototype.init=function(){var a;0!==this.element.length&&(this.queue(this.setPaneDimensions.bind(this))(),this.handleEvents(),a=Hammer.utils.extend({},Hammer.defaults.behavior),a.touchAction="none",new Hammer(this.element,{drag_lock_to_axis:!0,behavior:a}).on("release dragleft dragright swipeleft swiperight touch",this.handleHammer.bind(this)),"#slider"===document.location.hash&&(this.queue(this.preloadAssets.bind(this,[0]))(),this.showPane(0,!0)))},YELL.smartphone.carousel.prototype.setPaneDimensions=function(){this.pane_width=this.element.offsetWidth,this.panes.forEach(function(a){"object"==typeof a.style&&(a.style.width=this.pane_width+"px")},this),this.container.style.width=this.pane_width*this.pane_count+"px"},YELL.smartphone.carousel.prototype.handleEvents=function(){window.addEventListener("resize",this.queue(this.setPaneDimensions.bind(this))),window.addEventListener("keydown",this.handlekeydown.bind(this)),QSA("body").find("[data-carousel-index]").on("click",this.handleClick.bind(this));for(var a in this.transitionEndEvents)void 0!==this.container.style[a]&&this.transitionEndEvents.hasOwnProperty(a)&&this.element.on(this.transitionEndEvents[a],this.updateTransitions.bind(this));this.element.on(this.transitionEnd,this.updateTransitions.bind(this)),this.updateTransitions()},YELL.smartphone.carousel.prototype.updateTransitions=function(){this.panes[this.current_pane].trigger("focus"),this.queue(this.preloadAssets.bind(this,[this.current_pane,this.current_pane+1,this.current_pane-1]),this.updateView.bind(this))()},YELL.smartphone.carousel.prototype.preloadAssets=function(a){var b,c,d,e,f;d=this.assets,e=this.pageWidth,f=this.pageHeight,this.indices=a,this.indices.forEach(function(a){b=[].slice.apply(d)[a],b&&!b.attr("src")&&(c=this.render(this.templates.element,{url:b.attr("data-src"),alt:b.attr("alt"),width:e,height:f,dblWidth:2*e,dblHeight:2*f}),b.innerHTML=c,b.attr("src",b.attr("data-src")))}.bind(this)),window.HTMLPictureElement||picturefill({reevaluate:!0})},YELL.smartphone.carousel.prototype.next=function(){return this.showPane(this.current_pane+1,!0)},YELL.smartphone.carousel.prototype.prev=function(){return this.showPane(this.current_pane-1,!0)},YELL.smartphone.carousel.prototype.render=function(a,b){return a.replace(/\{{ *([\w_]+) *\}}/g,function(a,c){var d=b[c];return d})},YELL.smartphone.carousel.prototype.paginate=function(){var a;return a=this.render(this.templates.pagination,{current:this.current_pane+1,total:this.panes.length}),this.paginator.innerHTML=a,this},YELL.smartphone.carousel.prototype.updateView=function(){var a;this.indices=this.indices||[Number(this.current_pane),Number(this.current_pane+1),Number(this.current_pane-1)],this.indices.forEach(function(b){if($asset=[].slice.apply(this.panes)[b],$asset){a={selected:b===this.current_pane,visible:b!==this.current_pane,focus:b===this.current_pane?0:-1};for(var c in $asset.attributes)$asset.attributes.hasOwnProperty(c)&&this.templates[$asset.attributes[c].name]&&($asset.attributes[c].value=this.render(this.templates[$asset.attributes[c].name],a))}}.bind(this))},YELL.smartphone.carousel.prototype.showPane=function(a,b){var c;a=Math.max(0,Math.min(a,this.pane_count-1)),this.current_pane=a,c=-(100/this.pane_count*this.current_pane),this.setContainerOffset(c,b),this.queue(this.paginate.bind(this))()},YELL.smartphone.carousel.prototype.setContainerOffset=function(a,b){this.container.removeClass("carousel__animate"),b&&this.container.addClass("carousel__animate");for(var c in this.transforms)void 0!==this.container.style[c]&&this.transforms.hasOwnProperty(c)&&(this.container.style[this.transforms[c]]=YELL.smartphone.utils.has3d()?"translate3d("+a+"%,0,0) scale3d(1,1,1)":"translate("+a+"%,0)")},YELL.smartphone.carousel.prototype.handleHammer=function(a){var b,c;switch(a.gesture.preventDefault(),a.type){case"dragright":case"dragleft":b=-(100/this.pane_count)*this.current_pane,c=100/this.pane_width*a.gesture.deltaX/this.pane_count,(0===this.current_pane&&"right"===a.gesture.direction||this.current_pane===this.pane_count-1&&"left"===a.gesture.direction)&&(c*=.4),this.setContainerOffset(c+b);break;case"swipeleft":this.next(),a.gesture.stopDetect();break;case"swiperight":this.prev(),a.gesture.stopDetect();break;case"release":Math.abs(a.gesture.deltaX)>this.pane_width/10?"right"===a.gesture.direction?this.prev():this.next():this.showPane(this.current_pane,!0)}},new YELL.smartphone.carousel("[data-carousel]");

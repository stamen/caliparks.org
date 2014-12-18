define(["require","exports","module","block-activity-filter","block-search-box","slippymap", "stamen-super-classy", "routes", "content-fetcher","../../js/helpers/paginationLast.js","../../js/helpers/paginationNext.js","../../js/helpers/formatActivityList.js"], function(
  require,
  exports,
  module,
  BlockActivityFilter,
  BlockSearchBox,
  Slippymap,
  StamenSuperClassy,
  Routes,
  ContentFetcher
) {

  "use strict";

  var routes      = new Routes(),
      searchState = routes.getParamStateFromLocationObject(),
      blocks      = {};

  function View(options) {

    var that = this,
        bodyNode, cleanBounds, mapTabNode, resultsNode, selectedPark, infowindow, infoWindowData, searchStateView,
        state = {};

    StamenSuperClassy.apply(that, arguments);

    bodyNode = that.utils.get("body")[0];

    function lock() {
      state.locked = true;
    }

    function unLock() {
      state.locked = false;
    }

    function initMap() {

      mapTabNode = that.utils.get(".map-tab-pane")[0];

      that.slippyMap = new Slippymap(".slippymap", {
        "data" : options.parks,
        "contextBounds" : (options.bounds.length) ? options.bounds : viewData.parks.bbox
      }, function(err, slippyMap) {
        that.slippyMap = slippyMap;
        that.fire("map-initialized");
      });

      that.slippyMap.once("idle",function(e) {

        cleanBounds = that.slippyMap.map.getBounds(); //Saving the current bounds as clean to be used to check against other bounds for state changes
        mapTabNode.classList.remove("slippy-map-bounds-dirty");

      });

      that.slippyMap.on("bounds-changed",function(e) {

        if (cleanBounds && !cleanBounds.equals(that.slippyMap.map.getBounds())) {
          mapTabNode.classList.add("slippy-map-bounds-dirty");
        }

      });

      that.utils.get(".search-this-area-action",mapTabNode)[0].addEventListener("click", function() {
        var newSearchState = JSON.parse(JSON.stringify(searchState));
        if (newSearchState["near"]) {
          delete newSearchState["near"];
        }
        newSearchState["bbox"] = that.slippyMap.getBounds().join(",");
        location.href="/parks/search" + routes.stringifyUrlSearchParams(newSearchState);
      }, that);

      that.on("route", function(e) {
        that.slippyMap.pinLayer.updateData(e.caller.parksGeoJSON);
      });
    }

    function targetIsSearchResult(eventResponse) {
      return that.utils.parentHasClass(eventResponse.target, "search-result");
    }

    function getParkById(id) {

      for (var i=0; options.parks.features.length > i; i++) {
        if ((options.parks.features[i].properties.superunit_id|0) === (id|0)) {
          return options.parks.features[i];
        }
      }

      return false;
    }

    function selectPark(id, options) {

      if ((!selectedPark || ((selectedPark.properties.superunit_id|0) !== (id|0))) && id) {
        var park         = getParkById(id),
            listItemNode = that.utils.get(".search-results .result-"+id)[0],
            isInBounds   = (park.geometry) ? that.slippyMap.map.getBounds().contains(new google.maps.LatLng(parseFloat(park.geometry.coordinates[1]), parseFloat(park.geometry.coordinates[0]))) : null;

        selectedPark = park;

        // Add selected class to list item dom element
        if (listItemNode) {
          listItemNode.classList.add("selected");
        }

        // Set pin on map as selected
        that.slippyMap.pinLayer.setMarkersAsSelected([id]);

        if (!isInBounds && park.geometry) {
          that.slippyMap.setCenter(park.geometry);
        }

        that.fire("park-selected", {
          newPark : park
        });
      }

    }

    function initInfoWindow() {
      infowindow = new google.maps.InfoWindow({
        "maxWidth" : 400,
        "minHeight": 400
      });

      infoWindowData = new ContentFetcher("#gmap-info-window","block-park-name");

      that.on("tab-toggle", function() {
        infowindow.close();
      });
    }

    //
    // Anything having to do with interacting with a park
    //
    function initPark() {

      resultsNode = that.utils.get("#content .search-results")[0];

      that.slippyMap.on("marker-click", function(e) {
        that.slippyMap.pinLayer.clearMarkerSelections();
        selectPark(e.caller.marker.feature.properties.superunit_id, {
          "center" : false
        });
      });

      that.slippyMap.on("select-markers", function(e) {

        infowindow.open(that.slippyMap.map,e.caller.selectedMarkers[0].pin);
        infowindow.setContent(
          infoWindowData.compileTemplate(e.caller.selectedMarkers[0].feature.properties)
        );
      });

      resultsNode.addEventListener("mouseover", function(e) {
        state.hoverActionPause = setTimeout(that.utils.debounce(function() {
          if (state.hoverActionPause) {
            var resultNode = targetIsSearchResult(e);
            if (resultNode) {
              that.slippyMap.pinLayer.clearMarkerSelections();
              selectPark(resultNode.getAttribute("data-id"));
            }

            state.hoverActionPause = null;
          }
        }, 400), 400);
      }, true);

      resultsNode.addEventListener("mouseout", function() {
        clearTimeout(state.hoverActionPause);
        state.hoverActionPause = null;
      }, true);

    }

    //
    // Anything having to do with interacting with a group of parks
    //
    function initParks() {
      var direction, perpage, startat, href, parksData;

      if (history && history.pushState) { //Only if the browser supports pushstate
        resultsNode.addEventListener("click", function(e) {

          //
          // Pagination Button behavior
          //
          if (e.target && e.target.getAttribute("data-pagination")) {

            e.preventDefault();

            if (!state.locked) {
              e.target.classList.add("wait");

              direction = e.target.getAttribute("data-pagination");
              href      = e.target.getAttribute("href");
              perpage   = (href.match(/perpage=(\d+[0-10000])/)||[])[1]|0;
              startat   = (href.match(/startat=(\d+[0-10000])/)||[])[1]|0;

              setTimeout(function() {
                loadParks({
                  "perpage" : perpage,
                  "startat" : startat
                });
              }, 50);
            }

          }

          //
          // Search result behavior
          //
          var searchResult = that.utils.parentHasClass(e.target,"search-result"),
              link;
          if (searchResult) {
            e.preventDefault();

            link = that.utils.get(".park-name a",searchResult)[0];

            if (link) {
              location.href = link.href;
            }

          }

        }, false);
      }

      parksData = new ContentFetcher("#content .search-results","parks-results");

      that.on("route", function(e) {
        resultsNode.innerHTML = parksData.compileTemplate(e.caller);
        resultsNode.scrollTop = 0;
      });
    }

    function initRoutes() {
      that.on("route", function(e) {
        if (history && history.pushState) {
          history.pushState({},null,"/parks/search" + routes.stringifyUrlSearchParams(e.caller.query));
        }
      });
    }

    function initSinlepageFiltering() {

      blocks.blockActivityFilter.on("filter-select",function(e) {

        if (history && history.pushState) { //Only if the browser supports pushstate
          e.caller.element.classList.add("wait");
          blocks.blockActivityFilter.lock();
          that.once("route", function() {
            e.caller.element.classList.remove("wait");
            blocks.blockActivityFilter.unLock();
          });
          setTimeout(function() {
            loadParks({
              "with" : e.caller.params.with,
              "startat" : 0
            });
          },50);
        } else {
          location.href = "/parks/search" + routes.stringifyUrlSearchParams(e.caller.params);
        }

      });
    }

    function initSearchStatus() {
      searchStateView = new ContentFetcher("#content .search-state","search-state");

      that.on("route", function(e) {
        if (history && history.pushState) {
          that.utils.get("#content .search-state")[0].innerHTML = searchStateView.compileTemplate(e.caller);
        }
      });
    }

    function loadParks(stateChanges) {

      var urlState = routes.getParamStateFromLocationObject(),
          keys     = Object.keys(stateChanges);

      for(var i=0; keys.length > i; i++) {
        urlState[keys[i]] = stateChanges[keys[i]];
      }

      lock();

      that.utils.request("/parks/search.geojson" + routes.stringifyUrlSearchParams(urlState), function(err, r) {

        unLock();

        var responseObject;

        if (err) {
          return that.fire("error",err);
        }

        try {
          responseObject = JSON.parse(r.responseText);
        } catch (err) {
          return that.fire("error",err);
        }

        if (responseObject.status === "ok") {

          return that.fire("route", {
            "parks":responseObject.response.features.map(function(feature) {
              return feature.properties;
            }),
            "query":urlState,
            "total":responseObject.response.features.length,
            "parksGeoJSON":responseObject.response
          });
        } else {
          return that.fire("error",{"message":"Response body not okay", "response" : responseObject});
        }

      });

    }

    function initTabControl() {
      var rootNode = that.utils.get(".tab-actions")[0];

      if (location.hash === "#tab-map") {
        bodyNode.classList.toggle("tab-map");
      }

      rootNode.addEventListener("click", function() {
        bodyNode.classList.toggle("tab-map");

        if (bodyNode.classList.contains("tab-map")) {
          that.slippyMap.resize();
          location.hash = "#tab-map";
          that.fire("tab-toggle", {"view":"map"});
        } else {
          if (location.hash === "#tab-map") {
            location.hash = "";
          }
          that.fire("tab-toggle", {"view":"list"});
        }

      }, false);
    }

    function init() {

      initMap();
      initTabControl();
      initPark();
      initParks();
      initInfoWindow();
      initSinlepageFiltering();
      initRoutes();
      initSearchStatus();

      that.on("error", function(e) {
        console.log("error",e);
      });

    }

    init();
  }

  blocks.blockSearchBox      = new BlockSearchBox(".block-search-box",{}, function(err, blockSearchBox) {});
  blocks.blockActivityFilter = new BlockActivityFilter(".block-activity-filter",{}, function(err, blockActivityFilter) {});

  module.exports = new View({
    "geojsonURI" : "/parks/search.geojson"+routes.stringifyUrlSearchParams(searchState),
    "bounds"     : viewData.bounds,
    "parks"      : viewData.parks
  });

});

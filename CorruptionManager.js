var showing = true;
var filter = 0;
var remove = false;

var downCoord = void 0;
var currentCoord = void 0;

function CorruptionState(state) {
  for (var y = 0; y < map.size.y; y++) {
    for (var x = 0; x < map.size.x; x++) {
      var tile = map.getTile(x, y);
      if (tile.numElements>0) {
        for (var i = 0; i < tile.numElements; i++) {
          var element = tile.getElement(i);
          if ((element.isHidden)&&(state==true)) {
            element.isHidden = false;
          }
        }
      }
    }
  }
}

function selectTheMap() {
    var left = Math.min(downCoord.x, currentCoord.x);
    var right = Math.max(downCoord.x, currentCoord.x);
    var top = Math.min(downCoord.y, currentCoord.y);
    var bottom = Math.max(downCoord.y, currentCoord.y);
    ui.tileSelection.range = {
        leftTop: { x: left, y: top },
        rightBottom: { x: right, y: bottom }
    };
}

function finishSelection() {
  var left = Math.floor(Math.min(downCoord.x, currentCoord.x) / 32);
  var right = Math.floor(Math.max(downCoord.x, currentCoord.x) / 32);
  var top = Math.floor(Math.min(downCoord.y, currentCoord.y) / 32);
  var bottom = Math.floor(Math.max(downCoord.y, currentCoord.y) / 32);

  for (var x = left; x <= right; x++) {
    for (var y = top; y <= bottom; y++) {
      var tile = map.getTile(x, y);

      for (var i = 0; i < tile.numElements; i++) {
        var element = tile.getElement(i);
        if (filters[filter]=="all") {
          if (remove) {
            if (element.isHidden) {
              element.isHidden = false;
            }
          } else {
            if (element.type!="surface") {
              element.isHidden = true;
            }
          }
        } else {
          if (remove) {
            if (element.type==filters[filter]) {
              element.isHidden = false;
            }
          } else {
            if (element.type==filters[filter]) {
              element.isHidden = true;
            }
          }
        }
      }
    }
  }
}

var filters = ["track","footpath","small_scenery","all"]

function ct_window() {
  window = ui.openWindow({
      classification: 'park',
      title: "Corruption Manager",
      width: 220,
      height: 80,
      x: 20,
      y: 50,
      widgets: [{
          type: 'label',
          name: 'label-description',
          x: 3,
          y: 20,
          width: 300,
          height: 60,
          text: "Drag area to be affected."
      },{
          type: 'label',
          name: 'label-description',
          x: 3,
          y: 62,
          width: 300,
          height: 60,
          text: "Remove:"
      },{
          type: 'label',
          name: 'label-description',
          x: 3,
          y: 42,
          width: 300,
          height: 60,
          text: "Filter:"
      },{
          type: "dropdown",
          x: 60,
          y: 40,
          width: 140,
          height: 15,
          name: "filter_dropdown",
          text: "",
          items: ["Tracks", "Paths", "Small Sceneary", "All"],
          selectedIndex: filter,
          onChange: function onChange(e) {
              filter = e;
          }
      },{
          type: "checkbox",
          x: 60,
          y: 60,
          width: 50,
          height: 15,
          isChecked: remove,
          name: "add_remove_toggle",
          text: "",
          selectedIndex: filter,
          onChange: function onChange(e) {
              remove = e;
          }
      },],
      onClose: function onClose() {
        window = null;
        if (ui.tool && ui.tool.id == "corruption-manager-tool") {
          ui.tool.cancel();
        }
      }
  });
}


function main() {
  ui.registerMenuItem("Corruption Manager", function() {
    ui.activateTool({ // Well done Oli! This is some good code
        id: "corruption-manager-tool",
        cursor: "cross_hair",
        onStart: function onStart(e) {
            ui.mainViewport.visibilityFlags |= 1 << 7;
        },
        onDown: function onDown(e) {
            if (e.mapCoords.x === 0 && e.mapCoords.y === 0) {
                return;
            }
            downCoord = e.mapCoords;
            currentCoord = e.mapCoords;
        },
        onMove: function onMove(e) {
            if (e.mapCoords.x === 0 && e.mapCoords.y === 0) {
                return;
            }
            if (e.isDown) {
                currentCoord = e.mapCoords;
                selectTheMap();
            } else {
                downCoord = e.mapCoords;
                currentCoord = e.mapCoords;
                selectTheMap();
            }
        },
        onUp: function onUp(e) {
            finishSelection();
            ui.tileSelection.range = null;
        },
        onFinish: function onFinish() {
            ui.tileSelection.range = null;
            ui.mainViewport.visibilityFlags &= ~(1 << 7);
            if (window != null) window.close();
        }
    });

    ct_window()
  });
}

registerPlugin({
    name: 'Hidden Object Corruption Manager',
    version: '1.0',
    authors: ['Willby'],
    type: 'local',
    main: main
});
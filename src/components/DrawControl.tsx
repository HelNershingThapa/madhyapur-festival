import * as React from "react";
import { useControl } from "react-map-gl/maplibre";

import MapboxDraw from "@mapbox/mapbox-gl-draw";
import DrawRectangle from "mapbox-gl-draw-rectangle-mode";

const modes = MapboxDraw.modes;
modes.draw_rectangle = DrawRectangle;
MapboxDraw.constants.classes.CONTROL_BASE = "maplibregl-ctrl";
MapboxDraw.constants.classes.CONTROL_PREFIX = "maplibregl-ctrl-";
MapboxDraw.constants.classes.CONTROL_GROUP = "maplibregl-ctrl-group";

// Add the extendDrawBar class here
class extendDrawBar {
  constructor(opt) {
    let ctrl = this;
    ctrl.draw = opt.draw;
    ctrl.buttons = opt.buttons || [];
    ctrl.onAddOrig = opt.draw.onAdd;
    ctrl.onRemoveOrig = opt.draw.onRemove;
  }
  onAdd(map) {
    let ctrl = this;
    ctrl.map = map;
    ctrl.elContainer = ctrl.onAddOrig(map);
    ctrl.buttons.forEach((b) => {
      ctrl.addButton(b);
    });
    return ctrl.elContainer;
  }
  onRemove(map) {
    this.buttons.forEach((b) => {
      this.removeButton(b);
    });
    this.onRemoveOrig(map);
  }
  addButton(opt) {
    let ctrl = this;
    var elButton = document.createElement("button");
    elButton.className = "mapbox-gl-draw_ctrl-draw-btn";
    if (opt.classes instanceof Array) {
      opt.classes.forEach((c) => {
        elButton.classList.add(c);
      });
    }
    if (opt.content) {
      if (opt.content instanceof Element) {
        elButton.appendChild(opt.content);
      } else {
        elButton.innerHTML = opt.content;
      }
    }
    elButton.addEventListener(opt.on, opt.action);
    ctrl.elContainer.appendChild(elButton);
    opt.elButton = elButton;
  }
  removeButton(opt) {
    opt.elButton.removeEventListener(opt.on, opt.action);
    opt.elButton.remove();
  }
}

// Modify the DrawControl component
export const DrawControl = React.forwardRef((props, ref) => {
  const draw = new MapboxDraw({ ...props, modes });
  const drawBar = new extendDrawBar({
    draw: draw,
    buttons: [
      {
        on: "click",
        action: () => draw.changeMode("draw_rectangle"),
        classes: [],
        content:
          "<svg class='MuiSvgIcon-root MuiSvgIcon-fontSizeMedium css-1iirmgg' focusable='false' aria-hidden='true' viewBox='0 0 28 28' data-testid='Crop32Icon'><path d='M19 6H5c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2m0 10H5V8h14z'></path></svg>", // Button content
      },
    ],
  });

  const drawRef = useControl(() => drawBar, {
    position: props.position,
  });

  React.useImperativeHandle(ref, () => drawRef, [drawRef]); // This way I exposed drawRef outside the component

  return null;
});

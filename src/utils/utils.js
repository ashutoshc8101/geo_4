export function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  let angleInRadians = (angleInDegrees) * Math.PI / 180.0;

  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY - (radius * Math.sin(angleInRadians))
  };
}

export function describeArc(x, y, radius, vector1, vector2, largeArcFlag) {
    let start = {x : x + radius * vector1[0], y : y + radius * vector1[1]}
    let end = {x: x + radius * vector2[0], y: y + radius * vector2[1]}

    let d = [
        "M", start.x, start.y,
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");

    return d;
}

export function nextChar(c) {
  return String.fromCharCode(c.charCodeAt(0) + 1);
};

export function checkProximity(rect, x, y) {
  return (x >= rect.x - 3.4 &&
    x <= rect.x + rect.width + 3.4 &&
    y >= rect.y - 3.4 &&
    y <= rect.y + rect.height + 3.4);
}


export const getNearestGridPoint = (e, offsetX, offsetY, rects) => {
  let mouseX = parseInt(e.clientX - offsetX);
  let mouseY = parseInt(e.clientY - offsetY);

  for (let i = 0; i < rects.current.length; i++) {
    let rect = rects.current[i];
    if (checkProximity(rect, mouseX, mouseY)) {
        return rect;
    }
  }

  return;
}

export const getOffsetCoordinates = (event, svgDiv) => {

  if (!event.pageX && event.changedTouches) {
    event.pageX = event.changedTouches[0].pageX;
  }
  if (!event.pageY && event.changedTouches) {
    event.pageY = event.changedTouches[0].pageY;
  }

  let pageX = event.pageX - svgDiv.offsetLeft;
  let pageY = event.pageY - svgDiv.offsetLeft;

  let cx = Math.round(pageX / 8) * 8;
  let cy = Math.round(pageY / 8) * 8;

  return [cx, cy]
}

export const translateVertex = (event, e, svgDiv) => {
  // Translates vertex with the mouse pointer while dragging.
  let [cx, cy] = getOffsetCoordinates(event, svgDiv)

  e.target.setAttribute("cx", cx);
  e.target.setAttribute("cy", cy);

  return [cx, cy]
}


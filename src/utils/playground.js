import { checkProximity } from './utils'
import { describeArc } from './utils';

export const drawVertex = (vertex) => {
  const vertexEle1 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  vertexEle1.setAttribute("r", vertex.radius)
  vertexEle1.setAttribute("cx", vertex.x)
  vertexEle1.setAttribute("cy", vertex.y)
  vertexEle1.setAttribute("fill", vertex.fill)
  vertexEle1.setAttribute("style", vertex.style)
  vertexEle1.setAttribute("id", vertex.id)

  return vertexEle1
}

export const drawLabel = ({x, y, className, id, textContent}) => {
  const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
  label.setAttribute("x", x)
  label.setAttribute("y", y)
  label.setAttribute("class", className + " unselectable")
  label.setAttribute("id", id)
  label.textContent = textContent

  return label
};

export const drawLine = (vertex1, vertex2) => {
  // drawline
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", vertex1.x)
  line.setAttribute("y1", vertex1.y)
  line.setAttribute("x2", vertex2.x)
  line.setAttribute("y2", vertex2.y)
  line.setAttribute("style", "stroke:#4F4F4F;stroke-width:1;cursor:pointer")
  line.setAttribute("id", "line")

  return line;
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

export const buildGrid = (playgroundWidth, playgroundHeight, cellWidth, cellHeight, radius, rects) => {
  for (let x = 0; x < playgroundWidth; x += cellWidth) {
    for (let y = 0; y < playgroundHeight; y += cellHeight) {

      let rect = {
        x: x,
        y: y,
        width: radius,
        height: radius
      };
      rects.current.push(rect);
    }
  }
};

export const translateVertex = (event, e, svgDiv) => {
  if (!event.pageX && event.changedTouches) {
    event.pageX = event.changedTouches[0].pageX;
  }
  if (!event.pageY && event.changedTouches) {
    event.pageY = event.changedTouches[0].pageY;
  }

  let pageX = event.pageX - svgDiv.offsetLeft;
  let pageY = event.pageY - svgDiv.offsetLeft;

  let cx = Math.round(pageX / (8)) * (8);
  let cy = Math.round(pageY / (8)) * (8);

  e.target.setAttribute("cx", cx);
  e.target.setAttribute("cy", cy);

  return [cx, cy]
}

export const buildLengthToVertexLabel = (
  group, cx, cy, cellHeight, length) => {
  let vertex1 = group.querySelector("#vertex1");

  let cx1 = parseInt(vertex1.getAttribute("cx"));
  let cy1 = parseInt(vertex1.getAttribute("cy"));

  let dist = Math.sqrt(Math.pow(cx - cx1, 2) + Math.pow((cy - cy1), 2));

  length.textContent = Math.round(dist / 32) + " cm";
  length.setAttribute("x", cx1 + ((cx - cx1) / 2) - 2 * cellHeight);
  length.setAttribute("y", cy1 + ((cy - cy1) / 2) + 3 * cellHeight);

  return length;
}

export const buildLengthToVertexLabelLeft = (
  group, cx, cy, cellHeight, length) => {
  let vertex1 = group.querySelector("#vertex2");

  let cx2 = parseInt(vertex1.getAttribute("cx"));
  let cy2 = parseInt(vertex1.getAttribute("cy"));

  let dist = Math.sqrt(Math.pow(cx - cx2, 2) + Math.pow((cy - cy2), 2));

  length.textContent = Math.round(dist / 32) + " cm";

  length.setAttribute("x", cx + ((cx2 - cx) / 2) - 2 * cellHeight);
  length.setAttribute("y", cy + ((cy2 - cy) / 2) + 3 * cellHeight);

  return length;
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

export const seperateVertices = (rightVertex, cx, cy, cellWidth, cellHeight, vertexLabel, nextChar, group, graph, currentIndex, index) => {
  if (rightVertex) {
    if (!group.querySelector("#label2")) {
      const label2 = drawLabel({
        x: cx - cellWidth,
        y: cy + 3 * cellHeight,
        class: "label",
        id: "label2",
        textContent: vertexLabel
      });
      vertexLabel = nextChar(vertexLabel);
      group.append(label2);
    }

    let vertex1 = group.querySelector("#vertex1");

    let vx1 = parseInt(vertex1.getAttribute("cx"));
    let vy1 = parseInt(vertex1.getAttribute("cy"));

    const dist = Math.round(Math.sqrt(
      Math.pow(vx1 - cx, 2) + Math.pow(vy1 - cy, 2)
    ) / 8);

    graph.addNode(currentIndex);
    graph.addEdge(vx1 + "," + vy1, currentIndex, dist);
    if (index !== currentIndex) graph.removeEdge(vx1 + "," + vy1, index);
  } else {
    if (!group.querySelector("#label1")) {
      const label1 = drawLabel({
        x: cx - cellWidth,
        y: cy + 3 * cellHeight,
        class: "label",
        id: "label1",
        textContent: vertexLabel
      });

      vertexLabel = nextChar(vertexLabel);
      group.append(label1);
    }

    let vertex2 = group.querySelector("#vertex2");

    let vx2 = parseInt(vertex2.getAttribute("cx"));
    let vy2 = parseInt(vertex2.getAttribute("cy"));
    const dist = Math.round(Math.sqrt(
      Math.pow(vx2 - cx, 2) + Math.pow(vy2 - cy, 2)
    ) / 8);

    graph.addNode(currentIndex);
    graph.addEdge(vx2 + "," + vy2, currentIndex, dist);
    if (index !== currentIndex) graph.removeEdge(vx2 + "," + vy2, index);
  }
};

export const mergeVertices = (rightVertex, group, index, currentIndex, graph, cx, cy) => {
  if (rightVertex) {
    let rightLabel = group.querySelector("#label2");
    if (index !== currentIndex && rightLabel)
      group.removeChild(rightLabel);

    let lengthLabel = group.querySelector("#length");

    if (lengthLabel) {
      let line = group.querySelector("#line");

      let cx1 = parseInt(line.getAttribute("x1"));
      let cy1 = parseInt(line.getAttribute("y1"));

      if (index !== currentIndex && graph.hasEdge(cx1 + "," + cy1, currentIndex)) {
        group.removeChild(lengthLabel);
      }
    }

    const graphNeighbours = graph.getNeighboors(index);

    if (graphNeighbours) {
      for (let [neighbour, _] of graphNeighbours) {
        if (!graph.hasEdge(currentIndex, neighbour)) {
          let n_x = parseInt(neighbour.split(",")[0]);
          let n_y = parseInt(neighbour.split(",")[1]);
          let dist = Math.round(
            Math.sqrt(Math.pow(
              cx - n_x, 2) +
              Math.pow((cy - n_y), 2))
            / 8);
          graph.addEdge(currentIndex, neighbour, dist);
        }
      }
    }

    if (currentIndex !== index) {
      graph.removeNode(index);
    }


    if (graph.getNeighboors(currentIndex).size === 2) {
      let keys = graph.getNeighboors(currentIndex).keys();
      let s1 = keys.next().value;
      let s2 = keys.next().value;

      let x2 = parseInt(s1.split(",")[0]);
      let y2 = parseInt(s1.split(",")[1]);

      let x3 = parseInt(s2.split(",")[0]);
      let y3 = parseInt(s2.split(",")[1]);
      let cellWidth = 8, cellHeight = 8;

      // console.log(x2, y2)
      // console.log(x3, y3)
      // console.log(currentIndex)

      let x = parseInt(currentIndex.split(",")[0])
      let y = parseInt(currentIndex.split(",")[1])

      let [angleLabel, path] = drawAngle(
        x2, x3, y2, y3, { x: x , y: y}, cellWidth, cellHeight)

      group.append(angleLabel)
      group.append(path)
    }

  } else {
    let leftLabel = group.querySelector("#label1");
    if (index !== currentIndex && leftLabel)
      group.removeChild(leftLabel);

    let lengthLabel = group.querySelector("#length");

    if (lengthLabel) {
      let line = group.querySelector("#line");

      let cx2 = parseInt(line.getAttribute("x2"));
      let cy2 = parseInt(line.getAttribute("y2"));

      if (index !== currentIndex && graph.hasEdge(cx2 + "," + cy2, currentIndex)) {
        group.removeChild(lengthLabel);
      }
    }


    const graphNeighbours = graph.getNeighboors(index);

    if (graphNeighbours) {
      for (let [neighbour, _] of graphNeighbours) {
        if (!graph.hasEdge(currentIndex, neighbour)) {
          let n_x = parseInt(neighbour.split(",")[0]);
          let n_y = parseInt(neighbour.split(",")[1]);
          let dist = Math.round(
            Math.sqrt(Math.pow(
              cx - n_x, 2) +
              Math.pow((cy - n_y), 2))
            / 8);
          graph.addEdge(currentIndex, neighbour, dist);
        }
      }
    }

    if (currentIndex !== index) {
      graph.removeNode(index);
    }

  }
}

export const getD = (x2, x3, y2, y3, vertex1) => {
  let slope1 = Math.atan((vertex1.y - y2) / (x2 - vertex1.x)) * 180 / Math.PI;
  let slope2 = Math.atan((vertex1.y - y3) / (x3 - vertex1.x)) * 180 / Math.PI;

  if (x3 < vertex1.x) {
    slope2 += 180;
  }

  if (x2 < vertex1.x) {
    slope1 += 180;
  }

  if (x3 >= vertex1.x && y3 > vertex1.y) {
    slope2 += 360;
  }

  if (x2 >= vertex1.x && y2 > vertex1.y) {
    slope1 += 360;
  }

  // console.log('slope1', slope1)
  // console.log('slope2', slope2)

  let degrees = Math.abs(slope1 - slope2);

  if (degrees > 180) {
    degrees = 360 - degrees;
  }

  let d = describeArc(vertex1.x, vertex1.y, 25, slope1, slope2);

  return [d, degrees]
}

export const drawAngle = (
  x2, x3, y2, y3, vertex1, cellWidth, cellHeight) => {

    let [d, degrees] = getD(x2, x3, y2, y3, vertex1)

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "#000000");
    path.setAttribute("stroke-width", 1);
    path.setAttribute("d", d);
    path.setAttribute("id", "angle")

    const angleLabel = drawLabel({
      x: vertex1.x + 3 * cellWidth,
      y: vertex1.y - 2 * cellHeight,
      className: "label",
      id: "angleLabel",
      textContent: Math.round(degrees)
    });

    return [angleLabel, path];
  // }
}
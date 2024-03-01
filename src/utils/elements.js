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


export const buildGrid = (
  playgroundWidth, playgroundHeight, cellWidth,
  cellHeight, radius, rects) => {
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


export const getNearestVertex = (e, graph) => {
  // Computes distances to all vertices in the diagram and
  // returns the nearest if lies in radius of 3 grid points.

  let minDist = Number.MAX_VALUE;
  const minVertex = {
    x: null,
    y: null
  }
  for (let [key, val] of graph.adjacencyList) {
    let vx = parseInt(key.split(",")[0]);
    let vy = parseInt(key.split(",")[1]);

    let dist = Math.sqrt(
      Math.pow(vx - e.clientX, 2) + Math.pow(vy - e.clientY, 2)
    );
    if (dist <= 24 && dist < minDist) {
      minDist = Math.min(minDist, dist);
      minVertex.x = vx;
      minVertex.y = vy;
    }
  }
  return minVertex;
};

export const buildLineSegmentGroup = (vertex1, vertex2) => {
  const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
  const vertexEle1 = drawVertex(vertex1);
  const vertexEle2 = drawVertex(vertex2);
  const line = drawLine(vertex1, vertex2);
  group.append(vertexEle1);
  group.append(vertexEle2);
  group.append(line);

  return [group, vertexEle1, vertexEle2];
}


export const createDefaultVertices = (rect, cellWidth) => {
  // Configuration for vertices when line segment is dropped
  // without translation.

  let radius = 4;
  let vertex1 = {
    x: rect.x - 10 * cellWidth,
    y: rect.y,
    width: radius,
    height: radius,
    radius: radius,
    fill: "#4F4F4F",
    style: "cursor:pointer",
    id: "vertex1"
  };

  let vertex2 = {
    x: rect.x,
    y: rect.y,
    width: radius,
    height: radius,
    radius: radius,
    fill: "#4F4F4F",
    style: "cursor:pointer",
    id: "vertex2"
  };

  return [vertex1, vertex2]
}

export const createLineSegmentLabels = (noLabel1, vertex1, vertexLabel, nextVertexLabel, group, cellWidth, cellHeight) => {
  if (!noLabel1) {
    const label1 = drawLabel({
      x: vertex1.x - cellWidth,
      y: vertex1.y + 3 * cellHeight,
      class: "label",
      id: "label1",
      textContent: vertexLabel()
    });

    nextVertexLabel()
    group.append(label1);
  }

  const label2 = drawLabel({
    x: vertex1.x + 10 * cellWidth,
    y: vertex1.y + 3 * cellHeight,
    class: "label",
    id: "label2",
    textContent: vertexLabel()
  });

  nextVertexLabel()

  const label3 = drawLabel({
    x: vertex1.x + 3 * cellWidth,
    y: vertex1.y + 3 * cellHeight,
    className: "label",
    id: "length",
    textContent: "2 cm"
  });
  group.append(label2);
  group.append(label3);
}

export const createPathElement = (d, id) => {
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", "#000000");
  path.setAttribute("stroke-width", 1);
  path.setAttribute("d", d);
  path.setAttribute("id", id)

  return path;
}

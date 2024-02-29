import { nextChar } from '../utils/utils';
import { useEffect, useRef } from 'react';
import { buildGrid, buildLengthToVertexLabel,
  buildLengthToVertexLabelLeft, drawAngle, drawLabel,
  drawLine, drawVertex, getNearestGridPoint, getOffsetCoordinates,
  mergeVertices, seperateVertices, translateVertex, getD } from '../utils/playground';
import segment from '../assets/segment.png';
import grid from '../assets/grid.png';


export default function Playground({ graph }) {
  const svgRef = useRef(null);
  const rects = useRef([]);

  let dropLineSegment = false;
  let vertexLabel = 'A';
  let offsetX = 0;
  let offsetY = 0;
  let playgroundWidth = 500;
  let playgroundHeight = 400;
  let radius = 1, cellWidth = 8, cellHeight = 8;

  useEffect(() => {
    drawGrid();
  }, []);

  const onDropLine = () => {
    dropLineSegment = true;
  };

  const drawGrid = (e) => {
    const svgElement = svgRef.current;

    svgElement.setAttribute("width", 500);
    svgElement.setAttribute("height", 400);

    // const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    // rect.setAttribute("width", "100%");
    // rect.setAttribute("height", "100%");
    // rect.setAttribute("fill", "#d9d9d933");
    // svgElement.append(rect)
    const bbox = svgElement.getBoundingClientRect();
    offsetX = bbox.left;
    offsetY = bbox.top;

    buildGrid(
      playgroundWidth, playgroundHeight, cellWidth,
      cellHeight, radius, rects)
  };


  const onMouseMove = (event, svgDiv, e, group, rightVertex) => {
    let [cx, cy] = translateVertex(event, e, svgDiv)

    let line = group.querySelector("#line");
    let label = group.querySelector("#label1");
    let length = group.querySelector("#length");

    // Add length label if it is missing.
    let noLength = false;
    if (!length) {
      length = drawLabel({
        x: cx + 9 * cellWidth,
        y: cy + 3 * cellHeight,
        class: "label",
        id: "length",
        textContent: "5 cm"
      });
      noLength = true;
    }

    if (rightVertex) {
      line.setAttribute("x2", cx);
      line.setAttribute("y2", cy);
      label = group.querySelector("#label2");

      if (label) {
        label.setAttribute("x", cx);
        label.setAttribute("y", cy + 3 * cellHeight);
      }

      length = buildLengthToVertexLabel(
        group, cx, cy, cellHeight, length)

      if (noLength) group.append(length);

      let cx1 = line.getAttribute("x1")
      let cy1 = line.getAttribute("y1")

      let vertex1Index = cx1 + "," + cy1;

      if (graph.getNeighboors(vertex1Index).size === 2) {
        let keys = graph.getNeighboors(vertex1Index).keys();
        let s1 = keys.next().value;
        let s2 = keys.next().value;

        let x2 = parseInt(s1.split(",")[0]);
        let y2 = parseInt(s1.split(",")[1]);

        // console.log(x2, y2)
        // console.log(x3, y3)
        // console.log(cx, cy)

        const path = group.querySelector("#angle");
        const label = group.querySelector("#angleLabel")

        let [d, angles] = getD(
           x2,cx, y2, cy, { x: parseInt(cx1), y: parseInt(cy1) },)

        path.setAttribute("d", d)
        label.textContent = (Math.round(angles) + "°");
      }

    } else {
      line.setAttribute("x1", cx);
      line.setAttribute("y1", cy);

      if (label) {
        label.setAttribute("x", cx);
        label.setAttribute("y", cy + 3 * cellHeight);
      }

      length = buildLengthToVertexLabelLeft(group, cx, cy, cellHeight, length)

      if (noLength) group.append(length);


      let cx1 = line.getAttribute("x2")
      let cy1 = line.getAttribute("y2")

      let vertex1Index = cx1 + "," + cy1;

      if (graph.getNeighboors(vertex1Index).size === 2) {
        let keys = graph.getNeighboors(vertex1Index).keys();
        let s2 = keys.next().value;

        let x2 = parseInt(s2.split(",")[0]);
        let y2 = parseInt(s2.split(",")[1]);

        const group2 = svgRef.current.querySelector(`line[x1="${cx1}"][y1="${cy1}"]`).parentElement;
        const path = group2.querySelector('#angle')
        const label = group2.querySelector("#angleLabel")

        let [d, angles] = getD(
           x2,cx, y2, cy, { x: parseInt(cx1), y: parseInt(cy1) },)

        path.setAttribute("d", d)
        label.textContent = Math.round(angles) + "°"
      }
    }
  };

  const vertexDragListener = (rightVertex = false) => {
    return (e) => {
      let svgDiv = document.getElementById("playDiv");

      if (dropLineSegment) return;
      let index = e.target.getAttribute("cx") + "," + e.target.getAttribute("cy");
      const group = e.target.parentElement;

      const onMoveMoveWrapper = (event) => {
        onMouseMove(event, svgDiv, e, group, rightVertex)
      }

      document.addEventListener('mousemove', onMoveMoveWrapper);
      document.addEventListener('touchmove', onMoveMoveWrapper);

      const onMouseUp = (event) => {
        document.removeEventListener("mousemove", onMoveMoveWrapper);
        document.removeEventListener("touchmove", onMoveMoveWrapper);

        let [cx, cy] = getOffsetCoordinates(event, svgDiv);

        const group = e.target.parentElement;

        let currentIndex = cx + "," + cy;
        if (!graph.search(currentIndex)) {
          // console.log('Diverge');
          seperateVertices(rightVertex, cx, cy, cellWidth, cellHeight, vertexLabel, nextChar, group, graph, currentIndex, index)
          // vertices.set(currentIndex, 1);
        } else {
          // console.log("Merge");
          mergeVertices(rightVertex, group, index, currentIndex, graph, cx, cy)
        }

        // console.log(graph.adjacencyList);
        document.onmouseup = null;
        document.ontouchend = null;
        document.ontouchcancel = null;
      };

      document.onmouseup = onMouseUp;
      document.ontouchend = onMouseUp;
      document.ontouchcancel = onMouseUp;

      return true;
    };
  };


  const drawLineSegment = (e) => {
    e.preventDefault();

    if (!dropLineSegment) return;

    const svgEle = svgRef.current;
    const rect = getNearestGridPoint(e, offsetX, offsetY, rects);

    let radius = 3;
    let vertex1 = {
      x: rect.x,
      y: rect.y,
      width: radius,
      height: radius,
      radius: radius,
      fill: "#4F4F4F",
      style: "cursor:pointer",
      id: "vertex1"
    };

    let vertex2 = {
      x: rect.x + 22 * cellWidth,
      y: rect.y,
      width: radius,
      height: radius,
      radius: radius,
      fill: "#4F4F4F",
      style: "cursor:pointer",
      id: "vertex2"
    };

    // Check if vertices are already present in the diagram.
    let noLabel1 = graph.search(vertex1.x + "," + vertex1.y);
    let nolabel2 = graph.search(vertex2.x + "," + vertex2.y);

    if (noLabel1 && nolabel2) {
      vertex2.y -= 5 * cellHeight;
    }

    // Injects line segment in the DOM.
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    const vertexEle1 = drawVertex(vertex1);
    const vertexEle2 = drawVertex(vertex2);
    const line = drawLine(vertex1, vertex2);
    group.append(vertexEle1);
    group.append(vertexEle2);
    group.append(line);

    // Add labels to vertices.
    if (!noLabel1) {
      const label1 = drawLabel({
        x: vertex1.x - cellWidth,
        y: vertex1.y + 3 * cellHeight,
        class: "label",
        id: "label1",
        textContent: vertexLabel
      });

      vertexLabel = nextChar(vertexLabel);
      group.append(label1);
    }

    const label2 = drawLabel({
      x: vertex1.x + 22 * cellWidth,
      y: vertex1.y + 3 * cellHeight,
      class: "label",
      id: "label2",
      textContent: vertexLabel
    });

    vertexLabel = nextChar(vertexLabel);

    const label3 = drawLabel({
      x: vertex1.x + 9 * cellWidth,
      y: vertex1.y + 3 * cellHeight,
      className: "label",
      id: "length",
      textContent: "5 cm"
    });

    // Registers vertices in the graph and also injects into the DOM.
    graph.addNode(vertex1.x + "," + vertex1.y);
    graph.addNode(vertex2.x + "," + vertex2.y);
    group.append(label2);
    group.append(label3);

    // Register side of triangles as an edge in the graph.
    let vertex1Index = vertex1.x + "," + vertex1.y;
    let vertex2Index = vertex2.x + "," + vertex2.y;

    graph.addEdge(
      vertex1Index,
      vertex2Index,
      Math.round((22 * cellWidth) / 8)
    );

    // Register touch and mouse events to modify shape.
    // eslint-disable-next-line no-loop-func
    vertexEle1.addEventListener("mousedown", vertexDragListener());
    vertexEle1.addEventListener("touchstart", vertexDragListener());
    vertexEle2.addEventListener("mousedown", vertexDragListener(true));
    vertexEle2.addEventListener("touchstart", vertexDragListener(true));

    if (graph.getNeighboors(vertex1Index).size === 2) {
      let keys = graph.getNeighboors(vertex1Index).keys();
      let s1 = keys.next().value;
      let s2 = keys.next().value;

      let x2 = parseInt(s1.split(",")[0]);
      let y2 = parseInt(s1.split(",")[1]);

      let x3 = parseInt(s2.split(",")[0]);
      let y3 = parseInt(s2.split(",")[1]);

      let [angleLabel, path] = drawAngle(
        x2, x3, y2, y3, vertex1, cellWidth, cellHeight)

      group.append(angleLabel)
      group.append(path)
    }

    svgEle.append(group);
    dropLineSegment = false;
  };

  return <>
    <div className='footer'>
      <span className="segment-button" onClick={onDropLine}>
        <img src={segment} alt='segment' />
      </span>
    </div>

    <div id="playDiv">
      <svg id="playground"
           ref={svgRef}
           style={{ backgroundImage: `url(${grid})` }}
           onMouseDown={drawLineSegment}
      />
    </div>
  </>;
}

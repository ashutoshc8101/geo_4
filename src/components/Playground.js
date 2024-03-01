import { useEffect, useRef } from 'react';
import { nextChar } from "../utils/utils";
import {
  mergeVertices, seperateVertices,
  onMouseUpOnCreatingSegment,
} from '../utils/playground';
import { drawLabel, buildGrid, buildLengthToVertexLabel, buildLengthToVertexLabelLeft, getNearestVertex,
  buildLineSegmentGroup, createLineSegmentLabels, createDefaultVertices,
} from '../utils/elements';

import { translateVertex } from '../utils/utils';
import { createAngleWithExistingVertex,
  removeAngleElements, calculateAngleToNeighbours
} from '../utils/angles';
import { getOffsetCoordinates, getNearestGridPoint } from '../utils/utils';

import segment from '../assets/segment.png';
import grid from '../assets/grid.png';

export default function Playground({ graph }) {
  const svgRef = useRef(null);
  const rects = useRef([]);

  let dropLineSegment = false;
  let vertex = 'A';

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

  const vertexLabel = () => vertex;
  const nextVertexLabel = () => {
    vertex = nextChar(vertex);
  };

  const drawGrid = (e) => {
    const svgElement = svgRef.current;
    svgElement.setAttribute("width", 500);
    svgElement.setAttribute("height", 400);

    const bbox = svgElement.getBoundingClientRect();
    offsetX = bbox.left;
    offsetY = bbox.top;

    buildGrid(
      playgroundWidth, playgroundHeight, cellWidth,
      cellHeight, radius, rects)
  };

  const _updateVertex = (line, cx, cy, group, label, length, noLength, index, rightVertex) => {
    line.setAttribute(rightVertex ? "x2" : "x1", cx);
    line.setAttribute(rightVertex ? "y2" : "y1", cy);
    label = group.querySelector(rightVertex ? "#label2" : "#label1");

    if (label) {
      label.setAttribute("x", cx);
      label.setAttribute("y", cy + 3 * cellHeight);
    }

    length = rightVertex ? buildLengthToVertexLabel(
      group, cx, cy, cellHeight, length) : buildLengthToVertexLabelLeft(
        group, cx, cy, cellHeight, length);

    if (noLength) group.append(length);

    let cx1 = line.getAttribute(rightVertex ? "x1" : "x2")
    let cy1 = line.getAttribute(rightVertex ? "y1" : "y2")

    let vertex1Index = cx1 + "," + cy1;

    if (graph.getNeighboors(vertex1Index).size === 2) {
      calculateAngleToNeighbours(vertex1Index, index, cx, cy, graph)
    }
  }

  const onMouseMove = (event, svgDiv, e, group, rightVertex, index) => {
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

    _updateVertex(line, cx, cy, group, label, length, noLength, index, rightVertex)
  };

  const onMouseUp = (event, e, onMoveWrapper, svgDiv, rightVertex, index) => {
    document.removeEventListener("mousemove", onMoveWrapper);
    document.removeEventListener("touchmove", onMoveWrapper);

    let [cx, cy] = getOffsetCoordinates(event, svgDiv);

    const group = e.target.parentElement;

    let currentIndex = cx + "," + cy;
    if (!graph.search(currentIndex)) {
      seperateVertices(
        rightVertex, cx, cy, cellWidth,
        cellHeight, vertexLabel, nextVertexLabel, group,
        graph, currentIndex, index)
    } else {
      mergeVertices(rightVertex, group, index, currentIndex, graph, cx, cy)
    }

    document.onmouseup = null;
    document.ontouchend = null;
    document.ontouchcancel = null;
  };

  const vertexDragListener = (rightVertex = false) => {
    return (e) => {
      let svgDiv = document.getElementById("playDiv");
      if (dropLineSegment) return;

      let index = e.target.getAttribute("cx") + "," + e.target.getAttribute("cy");
      const group = e.target.parentElement;

      removeAngleElements(index)

      const onMoveWrapper = (event) => {
        onMouseMove(event, svgDiv, e, group, rightVertex, index)
      }

      const onMouseUpWrapper = (event) => {
        onMouseUp(event, e, onMoveWrapper, svgDiv, rightVertex, index)
      }

      // Add event listener for drag and drop.
      document.addEventListener('mousemove', onMoveWrapper);
      document.addEventListener('touchmove', onMoveWrapper);
      document.onmouseup = onMouseUpWrapper;
      document.ontouchend = onMouseUpWrapper;
      document.ontouchcancel = onMouseUpWrapper;

      return true;
    };
  };


  const drawLineSegment = (e) => {
    e.preventDefault();
    if (!dropLineSegment) return;

    if (!e.pageX && e.changedTouches) {
      e.pageX = e.changedTouches[0].pageX;
      e.clientX = e.pageX
    }
    if (!e.pageY && e.changedTouches) {
      e.pageY = e.changedTouches[0].pageY;
      e.clientY = e.pageY
    }

    const svgEle = svgRef.current;
    const nearestVertex = getNearestVertex(e, graph);

    let rect = getNearestGridPoint(e, offsetX, offsetY, rects);

    let [vertex1, vertex2] = createDefaultVertices(rect, cellWidth)

    // If there is a vertex in proximity, connects the side to the triangle.
    if (nearestVertex.x !== null) {
      rect = nearestVertex;
      vertex1.x = rect.x
      vertex1.y = rect.y
      vertex2.x = e.clientX
    }

    // Check if vertices are already present in the diagram.
    let noLabel1 = graph.search(vertex1.x + "," + vertex1.y);
    let nolabel2 = graph.search(vertex2.x + "," + vertex2.y);

    if (noLabel1 && nolabel2) {
      vertex2.y -= 5 * cellHeight;
    }

    // Injects line segment in the DOM.
    let [group, vertexEle1, vertexEle2] = buildLineSegmentGroup(vertex1, vertex2)

    // Add labels to vertices.
    createLineSegmentLabels(noLabel1, vertex1, vertexLabel, nextVertexLabel, group, cellWidth, cellHeight)

    // Registers vertices in the graph and also injects into the DOM.
    graph.addNode(vertex1.x + "," + vertex1.y);
    graph.addNode(vertex2.x + "," + vertex2.y);

    // Register side of triangles as an edge in the graph.
    let vertex1Index = vertex1.x + "," + vertex1.y;
    let vertex2Index = vertex2.x + "," + vertex2.y;

    graph.addEdge(
      vertex1Index,
      vertex2Index,
      Math.round((22 * cellWidth) / 8)
    );

    createAngleWithExistingVertex(
      graph, group, vertex1Index,
      vertex1, cellWidth, cellHeight)

    svgEle.append(group);
    dropLineSegment = false;

    let svgDiv = document.getElementById("playDiv");
    let rightVertex = true;
    let index = vertex2.x + "," + vertex2.y;

    const onMoveWrapper = (event) => {
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

      vertexEle2.setAttribute("cx", cx);
      vertexEle2.setAttribute("cy", cy);

      onMouseMove(event, svgDiv, e, group, rightVertex, index)
    }

    const onMouseUp = (event) => onMouseUpOnCreatingSegment(
      onMoveWrapper, event, group, svgDiv, graph,
      rightVertex, cellWidth, cellHeight, vertexLabel, nextVertexLabel,
      index, vertexEle1, vertexEle2, vertexDragListener);

    document.addEventListener('mousemove', onMoveWrapper);
    document.addEventListener('touchmove', onMoveWrapper);
    document.onmouseup = onMouseUp;
    document.ontouchend = onMouseUp;
    document.ontouchcancel = onMouseUp;

    // Register touch and mouse events to modify shape.
    // eslint-disable-next-line no-loop-func
    vertexEle1.addEventListener("mousedown", vertexDragListener());
    vertexEle1.addEventListener("touchstart", vertexDragListener());
    vertexEle2.addEventListener("mousedown", vertexDragListener(true));
    vertexEle2.addEventListener("touchstart", vertexDragListener(true));
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
           onTouchStart={drawLineSegment}
      />
    </div>
  </>;
}

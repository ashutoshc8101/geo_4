import { getOffsetCoordinates } from './utils';
import { drawLabel } from './elements';
import { drawAngleAndLabel } from './angles';

const _createLabelIfDoesNotExist = (group, vertexLabel, nextVertexLabel, cx, cy, cellWidth, cellHeight, id) => {
  if (!group.querySelector("#" + id)) {
    const label = drawLabel({
      x: cx - cellWidth,
      y: cy + 3 * cellHeight,
      class: "label",
      id: id,
      textContent: vertexLabel()
    });
    nextVertexLabel()
    group.append(label);
  }
}

const _createNewSideForTriangle = (group, graph, cx, cy, currentIndex, index, id) => {

  let vertex1 = group.querySelector("#" + id);
  let vx1 = parseInt(vertex1.getAttribute("cx"));
  let vy1 = parseInt(vertex1.getAttribute("cy"));

  // Calculate euclidean distance with moving point and connected vertex.
  const dist = Math.round(Math.sqrt(
    Math.pow(vx1 - cx, 2) + Math.pow(vy1 - cy, 2)
  ) / 8);

  graph.addNode(currentIndex);
  graph.addEdge(vx1 + "," + vy1, currentIndex, dist);

  if (graph.hasEdge(vx1 + "," + vy1, index) && index !== currentIndex) {
    graph.removeEdge(vx1 + "," + vy1, index);
  }
}

export const seperateVertices = (
  rightVertex, cx, cy, cellWidth, cellHeight,
  vertexLabel, nextVertexLabel, group, graph, currentIndex, index
  ) => {
  if (rightVertex) {
    _createLabelIfDoesNotExist(group, vertexLabel, nextVertexLabel, cx, cy, cellWidth, cellHeight, "label2")
    _createNewSideForTriangle(group, graph, cx, cy, currentIndex, index, "vertex1")
  } else {
    _createLabelIfDoesNotExist(group, vertexLabel, nextVertexLabel, cx, cy, cellWidth, cellHeight, "label1")
    _createNewSideForTriangle(group, graph, cx, cy, currentIndex, index, "vertex2")
  }
};

const _removeLengthAndVertexLabelOnMerging = (
  group, index, currentIndex, graph, rightVertex) => {
  let rightLabel = group.querySelector(rightVertex ? "#label2" : "#label1");
  if (index !== currentIndex && rightLabel)
    group.removeChild(rightLabel);

  let lengthLabel = group.querySelector("#length");

  if (lengthLabel) {
    let line = group.querySelector("#line");

    let cx = parseInt(line.getAttribute(rightVertex ? "x1" : "x2"));
    let cy = parseInt(line.getAttribute(rightVertex ? "y1" : "y2"));

    if (index !== currentIndex && graph.hasEdge(cx + "," + cy, currentIndex)) {
      group.removeChild(lengthLabel);
    }
  }
}

const _removeGraphNodeAndMergeEdges = (graph, index, currentIndex, cx, cy) => {
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

const _addAngleArcAndLabelToMergedVertex = (graph, currentIndex, group) => {
  if (graph.getNeighboors(currentIndex).size === 2) {
    let neighbours = graph.getNeighboors(currentIndex).keys();
    let neighbours1 = neighbours.next().value;
    let neighbours2 = neighbours.next().value;

    let x2 = parseInt(neighbours1.split(",")[0]);
    let y2 = parseInt(neighbours1.split(",")[1]);

    let x3 = parseInt(neighbours2.split(",")[0]);
    let y3 = parseInt(neighbours2.split(",")[1]);
    let cellWidth = 8, cellHeight = 8;

    let x = parseInt(currentIndex.split(",")[0])
    let y = parseInt(currentIndex.split(",")[1])

    let [angleLabel, path] = drawAngleAndLabel(
      x2, x3, y2, y3, { x: x , y: y}, cellWidth, cellHeight)

    group.append(angleLabel)
    group.append(path)
  }
};

export const mergeVertices = (
  rightVertex, group, index,
  currentIndex, graph, cx, cy
  ) => {
  _removeLengthAndVertexLabelOnMerging(group, index, currentIndex, graph, rightVertex)
  _removeGraphNodeAndMergeEdges(graph, index, currentIndex, cx, cy)
  _addAngleArcAndLabelToMergedVertex(graph, currentIndex, group)
}


export const onMouseUpOnCreatingSegment = (
  onMoveWrapper, event, group, svgDiv, graph,
  rightVertex, cellWidth, cellHeight, vertexLabel, nextVertexLabel,
  index) => {
  {
    document.removeEventListener("mousemove", onMoveWrapper);
    document.removeEventListener("touchmove", onMoveWrapper);

    let [cx, cy] = getOffsetCoordinates(event, svgDiv);

    let currentIndex = cx + "," + cy;
    if (!graph.search(currentIndex)) {
      seperateVertices(
        rightVertex, cx, cy, cellWidth,
        cellHeight, vertexLabel, nextVertexLabel, group,
        graph, currentIndex, index)
    } else {
      mergeVertices(
        rightVertex, group, index,
        currentIndex, graph, cx, cy)
    }

    document.onmouseup = null;
    document.ontouchend = null;
    document.ontouchcancel = null;
  };
}

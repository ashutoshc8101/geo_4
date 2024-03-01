import { describeArc } from './utils';
import { createPathElement, drawLabel } from './elements';

export const getUnitVector = (vector) => {
  let mag = Math.sqrt(Math.pow(vector[0], 2) + Math.pow(vector[1], 2));

  vector[0] /= mag;
  vector[1] /= mag;

  return vector;
}

export const getD = (x2, x3, y2, y3, vertex1) => {
  let vector1 = [x3 - vertex1.x, y3 - vertex1.y];
  vector1 = getUnitVector(vector1)

  let vector2 = [x2 - vertex1.x, y2 - vertex1.y]
  vector2 = getUnitVector(vector2)

  // Compute angles between two vectors using dot product.
  let degrees = Math.acos(
    (vector1[0] * vector2[0]) + (vector1[1] * vector2[1])
  ) * 180 / Math.PI

  // calculate order of two vector using cross product.
  let cross = (vector2[0] * vector1[1] - vector1[0] * vector2[1]);

  // largeArcFlag decides the direction of arc between two sides.
  let largeArcFlag = cross >= 0 ? "0" : "0";

  let d = cross <= 0 ? describeArc(
    vertex1.x, vertex1.y, 25, vector2, vector1, largeArcFlag) :
    describeArc(vertex1.x, vertex1.y, 25, vector1, vector2, largeArcFlag);

  return [d, degrees];
};

export const drawAngleAndLabel = (x2, x3, y2, y3, vertex1) => {
  // Construct arc and label for angle using two sides as vectors.

  const [d, degrees] = getD(x2, x3, y2, y3, vertex1);
  const path = createPathElement(d, "angle_" + vertex1.x + vertex1.y)

  const textContent = isNaN(degrees) ? "" : Math.round(degrees) + "°"

  const angleLabel = drawLabel({
    x: vertex1.x + 25,
    y: vertex1.y - 10,
    className: "label",
    id: "angleLabel_" + vertex1.x + vertex1.y,
    textContent: textContent
  });

  return [angleLabel, path];
}

export const calculateAngleToNeighbours = (
  vertex1Index, index, cx, cy, graph) => {

  let cx1 = vertex1Index.split(",")[0]
  let cy1 = vertex1Index.split(",")[1]

  let neighbours = graph.getNeighboors(vertex1Index).keys();
  let neighbour1 = neighbours.next().value;
  let neighbour2 = neighbours.next().value;

  // Select the neighbour vertex which is not being dragged.
  let s = neighbour1 === index ? neighbour2 : neighbour1;

  let x2 = parseInt(s.split(",")[0]);
  let y2 = parseInt(s.split(",")[1]);

  // Update the angle arc and its label.
  const path = document.querySelector("#angle_" + cx1 + cy1);
  const label = document.querySelector("#angleLabel_" + cx1 + cy1)

  const [d, degrees] = getD(cx, x2, cy, y2, { x: parseInt(cx1), y: parseInt(cy1) });

  path.setAttribute("d", d)
  const textContent = isNaN(degrees) ? "" : Math.round(degrees) + "°"

  label.textContent = textContent;
};

export const removeAngleElements = (index) => {
  // Remove angle arc and label elements when a line seperates from vertex.

  let angle = document.getElementById(
    "angle_" + index.split(",")[0] + index.split(",")[1])

  let angleLabel = document.getElementById(
    "angleLabel_" + index.split(",")[0] + index.split(",")[1])

  if (angle) angle.remove()
  if (angleLabel) angleLabel.remove()
};


export const createAngleWithExistingVertex = (graph, group, vertex1Index, vertex1, cellWidth, cellHeight) => {
  if (graph.getNeighboors(vertex1Index).size === 2) {
    let neighbours = graph.getNeighboors(vertex1Index).keys();
    let neighbour1 = neighbours.next().value;
    let neighbour2 = neighbours.next().value;

    let x2 = parseInt(neighbour1.split(",")[0]);
    let y2 = parseInt(neighbour1.split(",")[1]);

    let x3 = parseInt(neighbour2.split(",")[0]);
    let y3 = parseInt(neighbour2.split(",")[1]);

    let [angleLabel, path] = drawAngleAndLabel(
      x2, x3, y2, y3, vertex1, cellWidth, cellHeight)

    group.append(angleLabel)
    group.append(path)
  }
}

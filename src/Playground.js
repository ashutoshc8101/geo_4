
import { describeArc, nextChar, checkProximity } from './utils';
import { useEffect, useRef } from 'react';
import segment from './assets/segment.png';

export default function Playground({graph}) {
  const myRef = useRef(null)
  let dropLineSegment = false;
  let granuality = 4;

  const rects = useRef([]);
  // const vertices = new Map();
  let vertexLabel = 'A';
  let offsetX = 0;
  let offsetY = 0;
  let vw = 500
  let vh = 500
  let r = 1, cw = 8, ch = 8;


  useEffect(() => {
    drawGrid();
  }, []);


  const onDropLine = () => {
    dropLineSegment = true;
  };

  const drawGrid = (e) => {
    const svgElement = myRef.current;

    svgElement.setAttribute("width", 500);
    svgElement.setAttribute("height", 500);

    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("width", "100%");
    rect.setAttribute("height", "100%");
    rect.setAttribute("fill", "#d9d9d933");

    svgElement.append(rect)

    const bbox = svgElement.getBoundingClientRect()
    offsetX = bbox.left;
    offsetY = bbox.top;

    for (let x = 0; x < vw; x+=cw) {
      for (let y = 0; y < vh; y+=ch) {
        const rectEle = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rectEle.setAttribute("fill", "#828282")
        let rect = {
          x: x,
          y: y,
          width: r,
          height: r
        };
        rectEle.setAttribute("width", r)
        rectEle.setAttribute("height", r)
        rectEle.setAttribute("x", x - r / 2)
        rectEle.setAttribute("y", y - r / 2)

        rects.current.push(rect);

        svgElement.append(rectEle)
      }
    }

  }

  const drawVertex = (vertex) => {
    const vertexEle1 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    vertexEle1.setAttribute("r", vertex.r)
    vertexEle1.setAttribute("cx", vertex.x)
    vertexEle1.setAttribute("cy", vertex.y)
    vertexEle1.setAttribute("fill", vertex.fill)
    vertexEle1.setAttribute("style", vertex.style)
    vertexEle1.setAttribute("id", vertex.id)

    return vertexEle1
  }

  const vertexDragListener = (rightVertex = false) => {
    return (e) => {
      if (dropLineSegment) return;
      let index = e.target.getAttribute("cx") + "," + e.target.getAttribute("cy");
      const group = e.target.parentElement;
      const onMouseMove = (event) => {
        if (!event.pageX) {
          event.pageX = event.changedTouches[0].pageX
        }
        if (!event.pageY) {
          event.pageY = event.changedTouches[0].pageY
        }

        let cx = Math.round(event.pageX / (8 * granuality)) * (8 * granuality)
        let cy = Math.round(event.pageY / (8 * granuality)) * (8 * granuality)

        e.target.setAttribute("cx", cx)
        e.target.setAttribute("cy", cy)

        let line = group.querySelector("#line");
        let label = group.querySelector("#label1");

        if (rightVertex) {
          line.setAttribute("x2", cx)
          line.setAttribute("y2", cy)
          label = group.querySelector("#label2");
        } else {
          line.setAttribute("x1", cx)
          line.setAttribute("y1", cy)
        }

        let length = group.querySelector("#length")
        let noLength = false;
        if (!length) {
          length = drawLabel({
            x: cx + 9 * cw,
            y: cy + 3 * ch,
            class: "label",
            id: "length",
            textContent: "5 cm"
          });
          noLength = true;
        }

        if (label) {
          label.setAttribute("x", cx)
          label.setAttribute("y", cy + 3 * ch)
        }
        if (rightVertex) {
          let vertex1 = group.querySelector("#vertex1")

          let cx1 = parseInt(vertex1.getAttribute("cx"))
          let cy1 = parseInt(vertex1.getAttribute("cy"))

          let dist = Math.sqrt(Math.pow(cx - cx1, 2) + Math.pow((cy - cy1), 2))

          length.textContent = Math.round(dist / 32) + " cm"
          length.setAttribute("x", cx1 + ((cx - cx1) / 2) - 2 * ch)
          length.setAttribute("y", cy1 + ((cy - cy1) / 2) + 3 * ch)

          if (noLength) group.append(length)

        } else {
          let vertex1 = group.querySelector("#vertex2")

          let cx2 = parseInt(vertex1.getAttribute("cx"))
          let cy2 = parseInt(vertex1.getAttribute("cy"))

          let dist = Math.sqrt(Math.pow(cx - cx2, 2) + Math.pow((cy - cy2), 2))

          length.textContent = Math.round(dist / 32) + " cm"

          length.setAttribute("x", cx + ((cx2 - cx) / 2) - 2 * ch)
          length.setAttribute("y", cy + ((cy2 - cy) / 2) + 3 * ch)

          if (noLength) group.append(length)
        }
      }

      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('touchmove', onMouseMove)

      const onMouseUp = (event) => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("touchmove", onMouseMove);

        if (!event.pageX) {
          event.pageX = event.changedTouches[0].pageX
        }
        if (!event.pageY) {
          event.pageY = event.changedTouches[0].pageY
        }

        let cx = Math.round(event.pageX / 8) * 8
        let cy = Math.round(event.pageY / 8) * 8

        const group = e.target.parentElement;

        let currentIndex = cx + "," + cy;
        if (!graph.search(currentIndex)) {
          console.log('Diverge')
          if (rightVertex) {
            if (!group.querySelector("#label2")) {
              const label2 = drawLabel({
                x: cx - cw,
                y: cy + 3 * ch,
                class: "label",
                id: "label2",
                textContent: vertexLabel
              })
              vertexLabel = nextChar(vertexLabel)
              group.append(label2)
            }

              let vertex1 = group.querySelector("#vertex1")

              let vx1 = parseInt(vertex1.getAttribute("cx"))
              let vy1 = parseInt(vertex1.getAttribute("cy"))

              const dist = Math.round(Math.sqrt(
                Math.pow(vx1 - cx, 2) + Math.pow(vy1 - cy, 2)
              ) / 8)

              graph.addNode(currentIndex)
              graph.addEdge(vx1 + "," + vy1, currentIndex, dist)
              graph.removeEdge(vx1 + "," + vy1, index)

          } else if (!group.querySelector("#label1")) {
            const label1 = drawLabel({
              x: cx - cw,
              y: cy + 3 * ch,
              class: "label",
              id: "label1",
              textContent: vertexLabel
            })

            let vertex2 = group.querySelector("#vertex2")

            let vx2 = parseInt(vertex2.getAttribute("cx"))
            let vy2 = parseInt(vertex2.getAttribute("cy"))
            const dist = Math.round(Math.sqrt(
              Math.pow(vx2 - cx, 2) + Math.pow(vy2 - cy, 2)
            ) / 8)

            graph.addNode(currentIndex)
            graph.addEdge(vx2 + "," + vy2, currentIndex, dist)
            graph.removeEdge(vx2 + "," + vy2, index)

            vertexLabel = nextChar(vertexLabel)
            group.append(label1)
          }

          // vertices.set(currentIndex, 1);
        } else {
          console.log("Merge")
          if (rightVertex) {
            let rightLabel = group.querySelector("#label2")
            if (rightLabel)
              group.removeChild(rightLabel)

            let lengthLabel = group.querySelector("#length")

            if (lengthLabel) {

              let line = group.querySelector("#line")

              let cx1 = parseInt(line.getAttribute("x1"))
              let cy1 = parseInt(line.getAttribute("y1"))

              if (graph.search(cx1 + "," + cy1) && graph.hasEdge(cx1 + "," + cy1, currentIndex)) {
                group.removeChild(lengthLabel)
              }
            }

            const graphNeighbours = graph.getNeighboors(index)

            if (graphNeighbours) {
              for (let [neighbour, _] of graphNeighbours) {
                if (!graph.hasEdge(currentIndex, neighbour)) {
                  let n_x = parseInt(neighbour.split(",")[0])
                  let n_y = parseInt(neighbour.split(",")[1])
                  let dist = Math.round(
                    Math.sqrt(Math.pow(
                      cx - n_x, 2) +
                      Math.pow((cy - n_y), 2))
                    / 8)
                  graph.addEdge(currentIndex, neighbour, dist)
                }
              }
            }
            graph.removeNode(index)

          } else {
            let leftLabel = group.querySelector("#label1")
            if (leftLabel)
              group.removeChild(leftLabel)

            let lengthLabel = group.querySelector("#length")

            if (lengthLabel) {
              let line = group.querySelector("#line")

              let cx2 = parseInt(line.getAttribute("x2"))
              let cy2 = parseInt(line.getAttribute("y2"))

              if (graph.search(cx2 + "," + cy2) && graph.hasEdge(cx2 + "," + cy2, currentIndex)) {
                group.removeChild(lengthLabel)
              }
            }

            graph.addNode(currentIndex)

            const graphNeighbours = graph.getNeighboors(index)

            if (graphNeighbours) {
              for (let [neighbour, _] of graphNeighbours) {
                if (!graph.hasEdge(currentIndex, neighbour)) {
                  let n_x = parseInt(neighbour.split(",")[0])
                  let n_y = parseInt(neighbour.split(",")[1])
                  let dist = Math.round(
                    Math.sqrt(Math.pow(
                      cx - n_x, 2) +
                      Math.pow((cy - n_y), 2))
                    / 8)
                  graph.addEdge(currentIndex, neighbour, dist)
                }
              }
            }
            graph.removeNode(index)

          }
        }

        console.log(graph.adjacencyList)
        document.onmouseup = null;
        document.ontouchend = null;
        document.ontouchcancel = null;
      };

      document.onmouseup = onMouseUp;
      document.ontouchend = onMouseUp;
      document.ontouchcancel = onMouseUp;

      return true;
    }
  }

  const drawLabel = ({x, y, className, id, textContent}) => {
    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", x)
    label.setAttribute("y", y)
    label.setAttribute("class", className + " unselectable")
    label.setAttribute("id", id)
    label.textContent = textContent

    return label
  };


  const mouseDown = (e) => {
    if (dropLineSegment) {
      e.preventDefault()
      const svgEle = myRef.current

      let mouseX = parseInt(e.clientX - offsetX);
      let mouseY = parseInt(e.clientY - offsetY);
      for (let i = 0; i < rects.current.length; i++) {
        let rect = rects.current[i];
        if (checkProximity(rect, mouseX, mouseY)) {
          let r = 3
          let vertex1 = {
            x: rect.x,
            y: rect.y,
            width: r,
            height: r,
            r: r,
            fill: "#4F4F4F",
            style: "cursor:pointer",
            id: "vertex1"
          };

          let vertex2 = {
            x: rect.x + 22 * cw,
            y: rect.y,
            width: r,
            height: r,
            r: r,
            fill: "#4F4F4F",
            style: "cursor:pointer",
            id: "vertex2"
          };

          let noLabel1 = graph.search(vertex1.x + "," + vertex1.y)
          let nolabel2 = graph.search(vertex2.x + "," + vertex2.y)

          if (noLabel1 && nolabel2) {
            vertex2.y -= 5 * ch
          }

          const vertexEle1 = drawVertex(vertex1)

          const vertexEle2 = drawVertex(vertex2)


          // eslint-disable-next-line no-loop-func
          vertexEle1.addEventListener("mousedown", vertexDragListener());
          vertexEle1.addEventListener("touchstart", vertexDragListener())
          vertexEle2.addEventListener("mousedown", vertexDragListener(true));
          vertexEle2.addEventListener("touchstart", vertexDragListener(true));

          // drawline
          const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
          line.setAttribute("x1", vertex1.x)
          line.setAttribute("y1", vertex1.y)
          line.setAttribute("x2", vertex2.x)
          line.setAttribute("y2", vertex2.y)
          line.setAttribute("style", "stroke:#4F4F4F;stroke-width:1;cursor:pointer")
          line.setAttribute("id", "line")

          const group = document.createElementNS("http://www.w3.org/2000/svg", "g");

          const label3 = drawLabel({
            x: vertex1.x + 9 * cw,
            y: vertex1.y + 3 * ch,
            class: "label",
            id: "length",
            textContent: "5 cm"
          });

          group.append(vertexEle1)
          group.append(vertexEle2)
          group.append(line)

          if (!noLabel1) {
            const label1 = drawLabel({
              x: vertex1.x - cw,
              y: vertex1.y + 3 * ch,
              class: "label",
              id: "label1",
              textContent: vertexLabel
            })

            vertexLabel = nextChar(vertexLabel)
            group.append(label1)
          }

          graph.addNode(vertex1.x + "," + vertex1.y)

          const label2 = drawLabel({
            x: vertex1.x + 22 * cw,
            y: vertex1.y + 3 * ch,
            class: "label",
            id: "label2",
            textContent: vertexLabel
          })

          vertexLabel = nextChar(vertexLabel)
          group.append(label2)

          graph.addNode(vertex2.x + "," + vertex2.y)
          group.append(label3)

          let vertex1Index = vertex1.x + "," + vertex1.y
          let vertex2Index = vertex2.x + "," + vertex2.y

          graph.addEdge(
            vertex1Index,
            vertex2Index,
            Math.round((22 * cw) / 8)
          )

          if(noLabel1 && graph.getNeighboors(vertex1Index).size === 2) {
            let keys = graph.getNeighboors(vertex1Index).keys();
            let s1 = keys.next().value
            let s2 = keys.next().value

            let x2 = parseInt(s1.split(",")[0])
            let y2 = parseInt(s1.split(",")[1])

            let x3 = parseInt(s2.split(",")[0])
            let y3 = parseInt(s2.split(",")[1])

            let slope1 = Math.atan(Math.abs((y2 - vertex1.y) / (x2 - vertex1.x))) * 180 / Math.PI
            let slope2 = Math.atan(Math.abs((y3 - vertex1.y) / (x3 - vertex1.x))) * 180 / Math.PI

            let degrees = Math.abs(slope1 - slope2)

            let d = describeArc(vertex1.x, vertex1.y, 25, 90 - slope2, 90 - slope1)

            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute("fill", "none")
            path.setAttribute("stroke", "#000000")
            path.setAttribute("stroke-width", 1)
            path.setAttribute("d", d)

            const angleLabel = drawLabel({
              x: vertex1.x + 5 * cw,
              y: vertex1.y - 0.5 * ch,
              className: "label",
              id: "#angle",
              textContent: Math.round(degrees)
            })

            // group.append(angleLabel)
            // group.append(path)
          }

          svgEle.append(group)
        }
      }

      dropLineSegment = false;
    }
  }

  return <>
    <div className='footer'>
      <span className="segment-button" onClick={onDropLine}>
        <img src={segment} alt='segment' />
      </span>
    </div>
    <svg ref={myRef} onMouseDown={mouseDown} />
  </>;

}
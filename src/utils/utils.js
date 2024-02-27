export function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  var angleInRadians = (angleInDegrees) * Math.PI / 180.0;

  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY - (radius * Math.sin(angleInRadians))
  };
}

export function describeArc(x, y, radius, startAngle, endAngle){

    var start = polarToCartesian(x, y, radius, startAngle);
    var end = polarToCartesian(x, y, radius, endAngle);

    let endAngleComp = endAngle >= 180 && endAngle <= 360 ? endAngle - 360 : endAngle;
    let startAngleComp = startAngle >= 180 && startAngle <= 360 ? startAngle - 360 : startAngle;

    if (endAngleComp - startAngleComp > 180) {
      var temp = start;
      start = end;
      end = temp;
    }

    var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "0";

    var d = [
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

export function getText(constraint) {
  switch (constraint.name) {
    case 'SHAPE':
        return 'Must be ' + constraint.value.toLowerCase();
    case 'ANGLE_SHAPE':
        return 'Must be ' + constraint.value.toLowerCase()
    case 'LENGTH':
        return 'Length of one side must be ' + constraint.value + ' cm'
    case 'ANGLE':
        return 'Angle of one side must be ' + constraint.value + ' degrees'
    default: return ''
  }
};

export const dfs = (adjL, start) => {
  const stack = [start];
  const visited = new Set();
  const result = [];
  let parent = null;

  while (stack.length) {
    const vertex = stack.pop();

    if (!visited.has(vertex)) {
      visited.add(vertex);

      for (const [key, weight] of adjL.get(vertex)) {
        if (key !== parent && !visited.has(key)) {
          stack.push(key);
          result.push(weight);
        }
      }

      parent = vertex;
    }
  }

  return result;
}

export const validTriangle = (adjL) => {
  let validTriangle = adjL.size === 3;

  for (let [key, val] of adjL) {
    validTriangle &= val.size === 2;
  }

  return validTriangle;
}
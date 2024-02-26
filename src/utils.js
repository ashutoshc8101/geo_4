export function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

export function describeArc(x, y, radius, startAngle, endAngle){

    var start = polarToCartesian(x, y, radius, endAngle);
    var end = polarToCartesian(x, y, radius, startAngle);

    var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

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
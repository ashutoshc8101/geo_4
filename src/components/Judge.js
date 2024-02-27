import { useState } from 'react';
import { dfs, validTriangle } from '../utils/utils';

export default function Judge({graph, constraints, setConstraints, setSuccess}) {
  const [error, setError] = useState("")

  const invalidateConstraint = (constraintName) => {
    let newConstraints = [...constraints];
    for (let i = 0; i < constraints.length; i++) {
      if (newConstraints[i].name === constraintName) {
        newConstraints[i].invalid = true;
      }
    }

    setConstraints(newConstraints)
  }

  const judge = (e) => {
    e.preventDefault()

    setError("")

    if(!validTriangle(graph.adjacencyList)) {
      setError("Input is not valid triangle")
      return false;
    } else {
      setError("")
    }

    const edges = dfs(
      graph.adjacencyList,
      graph.adjacencyList.keys().next().value
    );

    let success = true;

    for (let i in constraints) {
      let set = new Set(edges)
      if (constraints[i].name === 'SHAPE') {
        switch (constraints[i].value) {
          case 'SCALENE':
            if (set.size !== 3) {
              success = false;
              invalidateConstraint('SHAPE')
            }
            break;
          case 'ISOSCELES':
            if (set.size !== 2) {
              success = false;
              invalidateConstraint('SHAPE')
            }
            break
          case 'EQUILATERAL':
            if (set.size !== 1) {
              success = false;
              invalidateConstraint('SHAPE')
            }
            break
          default: ;
        }
      }

      if (constraints[i].name === 'LENGTH') {
        let result = false;
        for (const value of set) {
          if (Math.floor(value / 4) === constraints[i].value) {
            result |= true;
          }
        }

        if (result === false) {
          success = false;
          invalidateConstraint('LENGTH')
        }
      }

      if (constraints[i].name === 'ANGLE') {
        let result = false;
        for (let [key, neighbours] of graph.adjacencyList) {
          let x = key.split(',')[0]
          let y = key.split(',')[1]
          let keys = neighbours.keys();
          let s1 = keys.next().value;
          let s2 = keys.next().value;

          let x2 = parseInt(s1.split(",")[0]);
          let y2 = parseInt(s1.split(",")[1]);

          let x3 = parseInt(s2.split(",")[0]);
          let y3 = parseInt(s2.split(",")[1]);


          let slope1 = Math.atan((y - y2) / (x2 - x)) * 180 / Math.PI;
          let slope2 = Math.atan((y - y3) / (x3 - x)) * 180 / Math.PI;

          if (x3 < x) {
            slope2 += 180;
          }

          if (x2 < x) {
            slope1 += 180;
          }

          if (x3 >= x && y3 > y) {
            slope2 += 360;
          }

          if (x2 >= x && y2 > y) {
            slope1 += 360;
          }

          if (Math.round(Math.abs(slope1 - slope2)) === constraints[i].value) {
            result |= true;
          }
        }

        if (!result) {
          success = false;
          invalidateConstraint('ANGLE')
        }
      }
    }

    if (success) {
      setSuccess(success)
    }
  };

  return <>
    { error && <div className='error-message'>{error}</div> }
    <button className='submit-button' onClick={judge}>Submit & check!</button>
  </>;
};
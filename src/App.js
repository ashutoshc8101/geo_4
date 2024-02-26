import './App.css';
import { useState } from 'react';

import { getText } from './utils';
import Graph from './Graph';
import Playground from './Playground';

function App() {

  let graph = new Graph();

  const [error, setError] = useState("")

  const [constraints, setConstraints] = useState([
    {
      name: 'SHAPE',
      value: 'SCALENE',
      invalid: false
    },
    {
      name: 'LENGTH',
      value: 5,
      invalid: false
    },
    {
      name: 'ANGLE',
      value: 50,
      invalid: false
    }
  ])


  const validTriangle = (adjL) => {
    let validTriangle = adjL.size === 3;

    for (let [key, val] of adjL) {
      validTriangle &= val.size === 2;
    }

    return validTriangle;
  }

  const dfs = (adjL, start) => {
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
      graph.adjacencyList, graph.adjacencyList.keys().next().value);

    for (let i in constraints) {
      let set = new Set(edges)
      if (constraints[i].name === 'SHAPE') {
        switch (constraints[i].value) {
          case 'SCALENE':
            if (set.size !== 3) {
              let newConstraints = [...constraints];
              for (let i = 0; i < constraints.length; i++) {
                if (newConstraints[i].name === 'SHAPE') {
                  newConstraints[i].invalid = true;
                }
              }


              setConstraints(newConstraints)
            }
            break;
          case 'ISOSCELES':
            if (set.size !== 2) {
              let newConstraints = [...constraints];
              for (let i = 0; i < constraints.length; i++) {
                if (newConstraints[i].name === 'SHAPE') {
                  newConstraints[i].invalid = true;
                }
              }

              setConstraints(newConstraints)
            }
            break

          case 'EQUILATERAL':
            if (set.size !== 1) {
              let newConstraints = [...constraints];
              for (let i = 0; i < constraints.length; i++) {
                if (newConstraints[i].name === 'SHAPE') {
                  newConstraints[i].invalid = true;
                }
              }

              setConstraints(newConstraints)
            }
          default:
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
          let newConstraints = [...constraints];
            for (let i = 0; i < constraints.length; i++) {
              if (newConstraints[i].name === 'LENGTH') {
                newConstraints[i].invalid = true;
              }
            }

            setConstraints(newConstraints)
        }
      }

      if (constraints[i].name === 'ANGLE') {
        // similar implemention.
      }
    }
  };


  return (
    <div className="App">

      <Playground graph={graph} />

      <div className='problem-text'>
        <p>Draw a triangle following the below conditions</p>
        <ul>
        { constraints.map((value, index) => {
          return <li className="list-item" key={value.name}>
            <span className={
              'question-number ' + (value.invalid ? 'invalid': '')} >{ index + 1 }</span>
            {getText(value)}</li>
        }) }
        </ul>

        {error && <div className='error-message'>{error}</div> }
      </div>
      <br />

      <button className='submit-button' onClick={judge}>Submit & check!</button>
    </div>
  );
}

export default App;

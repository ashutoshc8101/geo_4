import './App.css';
import Graph from './utils/Graph';
import Playground from './components/Playground';
import ProblemStatement from './components/ProblemStatement';
import Judge from './components/Judge';
import { useState } from 'react';

function App() {
  let graph = new Graph();
  const [success, setSuccess] = useState(false);

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

  return (
    <div className="App">
      <Playground graph={graph} />

      <ProblemStatement constraints={constraints} success={success} />

      <Judge graph={graph} constraints={constraints} setConstraints={setConstraints} setSuccess={setSuccess} />
    </div>
  );
}

export default App;

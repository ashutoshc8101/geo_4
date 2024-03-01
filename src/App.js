import './App.css';
import Graph from './utils/graph';
import Playground from './components/Playground';

function App() {
  let graph = new Graph();

  return (
    <div className="App">
      <Playground graph={graph} />
    </div>
  );
}

export default App;

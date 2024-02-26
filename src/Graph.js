
class Graph {
  adjacencyList;

  constructor(){
    this.adjacencyList = new Map();
  }

  addNode(node){
    if (!this.adjacencyList.has(node)) this.adjacencyList.set(node, new Map());
  }

  removeNode(node) {
    this.adjacencyList.delete(node)

    // clean edges
    for (let [key, neighbours] of this.adjacencyList) {
      for (let [key2, _] of neighbours) {
        if (key2 === node) {
          neighbours.delete(node)
        }
      }
    }
  }

  addEdge(node1, node2, weight){
    this.adjacencyList.get(node1).set(node2, weight);
    this.adjacencyList.get(node2).set(node1, weight);
  }

  removeEdge(node1, node2) {
    this.adjacencyList.get(node1).delete(node2)
    this.adjacencyList.get(node2).delete(node1)

    // clean stray vertices
    for (let [key, neighbours] of this.adjacencyList) {
      if(neighbours.size === 0) {
        this.adjacencyList.delete(key)
      }
    }
  }

  getNeighboors(node){
    return this.adjacencyList.get(node);
  }

  hasEdge(node1, node2){
    return this.adjacencyList.get(node1).has(node2);
  }

  search(node) {
    return this.adjacencyList.has(node)
  }
}

export default Graph;
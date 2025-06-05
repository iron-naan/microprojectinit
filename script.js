function mockOpenAIResponse(risks) {
  const effects = [
    'unexpected market collapse',
    'supply shortages',
    'widespread disruption',
    'loss of public trust',
    'environmental damage'
  ];
  const effect = effects[Math.floor(Math.random() * effects.length)];
  return `Combined, ${risks.join(' + ')} may lead to ${effect}.`;
}

function generateGraph(risks, description) {
  const nodes = risks.map((risk, i) => ({ id: `risk${i}`, label: risk }));
  nodes.push({ id: 'outcome', label: 'Outcome' });
  const links = risks.map((risk, i) => ({ source: `risk${i}`, target: 'outcome' }));

  const svg = d3.select('#graph').html('').append('svg')
    .attr('width', '100%')
    .attr('height', '100%');

  const width = document.getElementById('graph').clientWidth;
  const height = document.getElementById('graph').clientHeight;

  const simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(d => d.id).distance(100))
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(width / 2, height / 2));

  const link = svg.append('g')
    .attr('stroke', '#999')
    .attr('stroke-opacity', 0.6)
    .selectAll('line')
    .data(links)
    .join('line');

  const node = svg.append('g')
    .attr('stroke', '#fff')
    .attr('stroke-width', 1.5)
    .selectAll('circle')
    .data(nodes)
    .join('circle')
    .attr('r', 20)
    .attr('fill', d => d.id === 'outcome' ? '#f66' : '#69b')
    .call(drag(simulation));

  const label = svg.append('g')
    .selectAll('text')
    .data(nodes)
    .join('text')
    .attr('text-anchor', 'middle')
    .attr('dy', 4)
    .text(d => d.label);

  simulation.on('tick', () => {
    link.attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

    node.attr('cx', d => d.x)
        .attr('cy', d => d.y);

    label.attr('x', d => d.x)
         .attr('y', d => d.y);
  });
}

function drag(simulation) {
  function dragstarted(event) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  function dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  function dragended(event) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }

  return d3.drag()
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended);
}

function visualize() {
  const input = document.getElementById('risks').value.trim();
  if (!input) return;
  const risks = input.split(',').map(r => r.trim()).filter(r => r);
  if (risks.length < 2) {
    alert('Please enter at least two risks.');
    return;
  }
  const description = mockOpenAIResponse(risks);
  document.getElementById('description').textContent = description;
  generateGraph(risks, description);
}

document.getElementById('visualize').addEventListener('click', visualize);

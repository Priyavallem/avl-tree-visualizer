const svg = document.getElementById("treeCanvas");
const msg = document.getElementById("message");
let root = null;
const delay = ms => new Promise(r => setTimeout(r, ms));

class Node {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
    this.height = 1;
    this.x = 0;
    this.y = 0;
  }
}

function height(n) {
  return n ? n.height : 0;
}

function balance(n) {
  return n ? height(n.left) - height(n.right) : 0;
}

function updateHeight(n) {
  n.height = 1 + Math.max(height(n.left), height(n.right));
}

/* ================= ROTATIONS ================= */

async function rightRotate(y) {
  msg.innerText = `Rotation: LL at node ${y.val}`;
  highlightRotate(y.val);
  await delay(1500);

  const x = y.left;
  const T2 = x.right;

  x.right = y;
  y.left = T2;

  updateHeight(y);
  updateHeight(x);

  clearHighlights();
  msg.innerText = "";
  return x;
}

async function leftRotate(x) {
  msg.innerText = `Rotation: RR at node ${x.val}`;
  highlightRotate(x.val);
  await delay(1500);

  const y = x.right;
  const T2 = y.left;

  y.left = x;
  x.right = T2;

  updateHeight(x);
  updateHeight(y);

  clearHighlights();
  msg.innerText = "";
  return y;
}

/* ================= INSERT ================= */

async function insert(node, val) {
  if (!node) {
    await delay(800);
    return new Node(val);
  }

  msg.innerText = `Compare ${val} with ${node.val}`;
  highlightCompare(node.val);
  await delay(1200);

  if (val < node.val)
    node.left = await insert(node.left, val);
  else if (val > node.val)
    node.right = await insert(node.right, val);
  else
    return node;

  updateHeight(node);
  const bf = balance(node);

  // LL
  if (bf > 1 && val < node.left.val)
    return await rightRotate(node);

  // RR
  if (bf < -1 && val > node.right.val)
    return await leftRotate(node);

  // LR
  if (bf > 1 && val > node.left.val) {
    msg.innerText = `Rotation: LR at node ${node.val}`;
    highlightRotate(node.val);
    await delay(1500);
    node.left = await leftRotate(node.left);
    return await rightRotate(node);
  }

  // RL
  if (bf < -1 && val < node.right.val) {
    msg.innerText = `Rotation: RL at node ${node.val}`;
    highlightRotate(node.val);
    await delay(1500);
    node.right = await rightRotate(node.right);
    return await leftRotate(node);
  }

  return node;
}

/* ================= UI HANDLERS ================= */

async function insertValue() {
  const input = document.getElementById("insertValue");
  const val = parseInt(input.value);
  if (isNaN(val)) return;

  input.value = "";
  root = await insert(root, val);
  draw();
}

function deleteValue() {
  alert("Delete operation visualization is planned as a future enhancement.");
}

/* ================= DRAW ================= */

function draw() {
  svg.innerHTML = "";
  if (!root) return;
  setPosition(root, 500, 40, 200);
  drawNode(root);
}

function setPosition(n, x, y, gap) {
  if (!n) return;
  n.x = x;
  n.y = y;
  setPosition(n.left, x - gap, y + 80, gap / 1.6);
  setPosition(n.right, x + gap, y + 80, gap / 1.6);
}

function drawNode(n) {
  if (n.left) drawLine(n, n.left);
  if (n.right) drawLine(n, n.right);

  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");

  const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  c.setAttribute("cx", n.x);
  c.setAttribute("cy", n.y);
  c.setAttribute("r", 20);
  c.setAttribute("class", "node");
  c.setAttribute("id", `node-${n.val}`);

  const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
  t.setAttribute("x", n.x);
  t.setAttribute("y", n.y + 5);
  t.setAttribute("text-anchor", "middle");
  t.textContent = n.val;

  const bf = document.createElementNS("http://www.w3.org/2000/svg", "text");
  bf.setAttribute("x", n.x);
  bf.setAttribute("y", n.y - 25);
  bf.setAttribute("class", "balance");
  bf.setAttribute("text-anchor", "middle");
  bf.textContent = balance(n);

  g.appendChild(c);
  g.appendChild(t);
  g.appendChild(bf);
  svg.appendChild(g);

  if (n.left) drawNode(n.left);
  if (n.right) drawNode(n.right);
}

function drawLine(p, c) {
  const l = document.createElementNS("http://www.w3.org/2000/svg", "line");
  l.setAttribute("x1", p.x);
  l.setAttribute("y1", p.y);
  l.setAttribute("x2", c.x);
  l.setAttribute("y2", c.y);
  l.setAttribute("stroke", "white");
  svg.appendChild(l);
}

/* ================= HIGHLIGHTS ================= */

function highlightCompare(val) {
  clearHighlights();
  const n = document.getElementById(`node-${val}`);
  if (n) n.classList.add("compare");
}

function highlightRotate(val) {
  clearHighlights();
  const n = document.getElementById(`node-${val}`);
  if (n) n.classList.add("rotate");
}

function clearHighlights() {
  document.querySelectorAll(".compare, .rotate")
    .forEach(e => e.classList.remove("compare", "rotate"));
}

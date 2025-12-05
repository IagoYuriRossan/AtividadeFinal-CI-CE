const express = require('express');
const router = express.Router();


let items = [
  { id: 1, name: 'Laptop Dell', description: 'Notebook profissional 16GB RAM', price: 4500 },
  { id: 2, name: 'Mouse Logitech', description: 'Mouse wireless ergonômico', price: 150 },
  { id: 3, name: 'Teclado Mecânico', description: 'Teclado RGB switches blue', price: 350 },
  { id: 4, name: 'Monitor LG 27"', description: 'Monitor Full HD IPS', price: 1200 },
  { id: 5, name: 'Headset Gamer', description: 'Headset 7.1 surround', price: 280 }
];

router.get('/items', (req, res) => res.json(items));

router.get('/items/:id', (req, res) => {
  const it = items.find(i => i.id === Number(req.params.id));
  if (!it) return res.status(404).json({ message: 'Not found' });
  res.json(it);
});

router.post('/items', (req, res) => {
  const id = items.length ? items.at(-1).id + 1 : 1;
  const item = { id, ...req.body };
  items.push(item);
  res.status(201).json(item);
});

router.put('/items/:id', (req, res) => {
  const idx = items.findIndex(i => i.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ message: 'Not found' });
  items[idx] = { ...items[idx], ...req.body };
  res.json(items[idx]);
});

router.delete('/items/:id', (req, res) => {
  items = items.filter(i => i.id !== Number(req.params.id));
  res.status(204).send();
});

module.exports = router;

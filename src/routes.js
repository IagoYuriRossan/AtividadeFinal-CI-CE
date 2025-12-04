const express = require('express');
const router = express.Router();

// In-memory store for demo CRUD (replace with real DB calls)
let items = [ { id: 1, name: 'item-1' } ];

router.get('/items', (req, res) => res.json(items));

router.get('/items/:id', (req, res) => {
  const it = items.find(i => i.id === Number(req.params.id));
  if (!it) return res.status(404).json({ message: 'Not found' });
  res.json(it);
});

router.post('/items', (req, res) => {
  const id = items.length ? items[items.length-1].id + 1 : 1;
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

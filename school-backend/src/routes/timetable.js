const express = require('express');

const router = express.Router();

// GET all timetables
router.get('/', (req, res) => {
    res.json({ message: 'Get all timetables' });
});

// GET timetable by ID
router.get('/:id', (req, res) => {
    res.json({ message: `Get timetable ${req.params.id}` });
});

// POST create new timetable
router.post('/', (req, res) => {
    res.json({ message: 'Create new timetable' });
});

// PUT update timetable
router.put('/:id', (req, res) => {
    res.json({ message: `Update timetable ${req.params.id}` });
});

// DELETE timetable
router.delete('/:id', (req, res) => {
    res.json({ message: `Delete timetable ${req.params.id}` });
});

module.exports = router;
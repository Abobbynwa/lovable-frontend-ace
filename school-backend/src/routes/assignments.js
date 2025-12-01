const express = require('express');

const router = express.Router();

// GET all assignments
router.get('/', (req, res) => {
    try {
        // TODO: Fetch assignments from database
        res.json({ message: 'Get all assignments' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET assignment by ID
router.get('/:id', (req, res) => {
    try {
        const { id } = req.params;
        // TODO: Fetch assignment by ID from database
        res.json({ message: `Get assignment ${id}` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST create new assignment
router.post('/', (req, res) => {
    try {
        const { title, description, dueDate } = req.body;
        // TODO: Save assignment to database
        res.status(201).json({ message: 'Assignment created', data: { title, description, dueDate } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT update assignment
router.put('/:id', (req, res) => {
    try {
        const { id } = req.params;
        // TODO: Update assignment in database
        res.json({ message: `Assignment ${id} updated` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE assignment
router.delete('/:id', (req, res) => {
    try {
        const { id } = req.params;
        // TODO: Delete assignment from database
        res.json({ message: `Assignment ${id} deleted` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
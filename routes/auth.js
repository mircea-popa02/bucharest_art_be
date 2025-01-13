const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const User = require('../models/user')
const auth = require('../middleware/auth')
const router = express.Router()

router.post('/register', async (req, res) => {
    const { name, password } = req.body
    if (!name || !password) return res.status(400).json({ error: 'Name and password must be provided' })
    try {
        const existing_user = await User.findOne({ name })
        if (existing_user) return res.status(400).json({ error: 'User already exists' })

        if (name.length <= 2 || password.length <= 4) {
            return res.status(400).json({ error: 'Name or password too short' })
        }

        const user = new User({ name, password })
        await user.save()
        const token = jwt.sign({ id: user._id, name: user.name }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION })

        res.status(201).json({ token })
    } catch (error) {
        res.status(500).json({ error: 'Server error', message: error.message })
    }
})

router.post('/login', async (req, res) => {
    const { name, password } = req.body
    if (!name || !password) return res.status(400).json({ error: 'Name and password must be provided' })
    try {
        const user = await User.findOne({ name })
        if (!user || !(await bcrypt.compare(password, user.password)))
            return res.status(400).json({ error: 'Invalid credentials' })

        const token = jwt.sign({ id: user._id, name: user.name }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION })
        res.json({ token })
    } catch (error) {
        res.status(500).json({ error: 'Server error', message: error.message })
    }
})

router.put('/change', auth, async (req, res) => {
    const { name, password } = req.body
    if (!name && !password) return res.status(400).json({ error: 'Name or password must be provided' })
    const { id } = req.user
    try {
        const user = await User.findById(id)
        if (!user) return res.status(400).json({ error: 'User not found' })

        const changes = Object.keys(req.body).length
        if (changes !== 1) return res.status(400).json({ error: 'Only one field can be changed at a time' })

        if (name) {
            if (typeof name !== 'string' || name.trim() === '') {
                return res.status(400).json({ error: 'Invalid name' })
            }
            user.name = name
        }

        if (password) {
            if (typeof password !== 'string' || password.trim() === '') {
                return res.status(400).json({ error: 'Invalid password' })
            }
            user.password = password
        }

        await user.save()
        res.json({ message: 'User updated successfully' })
    } catch (error) {
        res.status(500).json({ error: 'Server error', message: error.message })
    }
})

router.delete('/delete', auth, async (req, res) => {
    const { id } = req.user;
    try {
        const user = await User.findById(id);
        if (!user) return res.status(400).json({ error: 'User not found' });

        await User.findByIdAndDelete(id);

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error', message: error.message });
    }
});

module.exports = router

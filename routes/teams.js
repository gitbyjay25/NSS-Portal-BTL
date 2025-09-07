const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const { auth } = require('../middleware/auth');
const logger = require('../utils/logger');

// Get all active teams (public)
router.get('/', async (req, res) => {
  try {
    // Only fetch from database
    const teams = await Team.find({ isActive: true })
      .sort({ order: 1, name: 1 })
      .select('-__v');
    
    if (teams && teams.length > 0) {
      return res.json(teams);
    }
    
    // Return empty array if no teams found
    res.json([]);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ message: 'Server error' });
  }
 });

// Get all teams (admin only)
router.get('/admin', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const teams = await Team.find()
      .sort({ order: 1, name: 1 })
      .select('-__v');
    
    res.json(teams);
  } catch (error) {
    console.error('Error fetching teams for admin:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new team (admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { name, description, members, order } = req.body;

    // Validate required fields
    if (!name || !members || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ message: 'Name and members are required' });
    }

    // Check if team name already exists
    const existingTeam = await Team.findOne({ name });
    if (existingTeam) {
      return res.status(400).json({ message: 'Team name already exists' });
    }

    // Validate members
    for (const member of members) {
      if (!member.name || !member.role || !member.department || !member.experience) {
        return res.status(400).json({ 
          message: 'Each member must have name, role, department, and experience' 
        });
      }
    }

    const team = new Team({
      name,
      description,
      members,
      order: order || 0
    });

    await team.save();
    res.status(201).json(team);
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update team (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { name, description, members, order, isActive } = req.body;
    const teamId = req.params.id;

    // Validate required fields
    if (!name || !members || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ message: 'Name and members are required' });
    }

    // Check if team name already exists (excluding current team)
    const existingTeam = await Team.findOne({ name, _id: { $ne: teamId } });
    if (existingTeam) {
      return res.status(400).json({ message: 'Team name already exists' });
    }

    // Validate members
    for (const member of members) {
      if (!member.name || !member.role || !member.department || !member.experience) {
        return res.status(400).json({ 
          message: 'Each member must have name, role, department, and experience' 
        });
      }
    }

    const updatedTeam = await Team.findByIdAndUpdate(
      teamId,
      {
        name,
        description,
        members,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true
      },
      { new: true, runValidators: true }
    );

    if (!updatedTeam) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.json(updatedTeam);
  } catch (error) {
    console.error('Error updating team:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete team (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const teamId = req.params.id;
    const deletedTeam = await Team.findByIdAndDelete(teamId);

    if (!deletedTeam) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Error deleting team:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle team status (admin only)
router.patch('/:id/toggle', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const teamId = req.params.id;
    const team = await Team.findById(teamId);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    team.isActive = !team.isActive;
    await team.save();

    res.json(team);
  } catch (error) {
    console.error('Error toggling team status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

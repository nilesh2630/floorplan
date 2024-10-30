const FloorPlan = require('../models/FloorPlan');

exports.createFloorPlan = async (req, res) => {
  try {
    
    const { name, data } = req.body;
    const floorPlan = await FloorPlan.create({
      name,
      data,
      lastModifiedBy: req.user.id
    });
    res.status(201).json(floorPlan);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAllFloorPlans = async (req, res) => {
  try {

    const floorPlans = await FloorPlan.find()
      .populate('lastModifiedBy', 'email')
      .sort('-lastModifiedAt');
    res.json(floorPlans);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getFloorPlan = async (req, res) => {
  try {
    const floorPlan = await FloorPlan.findById(req.params.id)
      .populate('lastModifiedBy', 'email');
    if (!floorPlan) {
      return res.status(404).json({ error: 'Floor plan not found' });
    }
    res.json(floorPlan);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// exports.updateFloorPlan = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { data, name } = req.body;
    
//     const currentPlan = await FloorPlan.findById(id);
//     if (!currentPlan) {
//       return res.status(404).json({ error: 'Floor plan not found' });
//     }

//     // Check for conflicts
//     if (currentPlan.lastModifiedAt > new Date(req.body.lastModifiedAt)) {
//       return res.status(409).json({ 
//         error: 'Conflict detected', 
//         serverVersion: currentPlan 
//       });
//     }

//     const updatedPlan = await FloorPlan.findByIdAndUpdate(
//       id,
//       {
//         data,
//         name,
//         version: currentPlan.version + 1,
//         lastModifiedBy: req.user.id,
//         lastModifiedAt: Date.now()
//       },
//       { new: true }
//     );
    
//     res.json(updatedPlan);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

exports.updateFloorPlan = async (req, res) => {
    const { id } = req.params;
    const { name, data, versione } = req.body;
  
    try {
      const floorPlan = await FloorPlan.findById(id);
  
      if (!floorPlan) {
        return res.status(404).json({ message: 'Floor plan not found' });
      }
  
      
      if (floorPlan.version !== versione) {
        return res.status(409).json({
          message: 'Conflict detected. The floor plan has been modified by another user.',
          latestPlan: floorPlan,
        });
      }
  
   
      floorPlan.name = name;
      floorPlan.data = data;
      floorPlan.version += 1;
      await floorPlan.save();
  
      res.json(floorPlan);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update floor plan' });
    }
  };
  

exports.deleteFloorPlan = async (req, res) => {
  try {
    const floorPlan = await FloorPlan.findByIdAndDelete(req.params.id);
    if (!floorPlan) {
      return res.status(404).json({ error: 'Floor plan not found' });
    }
    res.json({ message: 'Floor plan deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.syncOfflineChanges = async (req, res) => {
  try {
    const { id } = req.params;
    const { offlineChanges } = req.body;
    
    const floorPlan = await FloorPlan.findById(id);
    if (!floorPlan) {
      return res.status(404).json({ error: 'Floor plan not found' });
    }


    const sortedChanges = offlineChanges.sort((a, b) => a.timestamp - b.timestamp);
    
  
    let currentData = { ...floorPlan.data };
    for (const change of sortedChanges) {
      currentData = mergeChanges(currentData, change.data);
    }

    floorPlan.data = currentData;
    floorPlan.version += 1;
    floorPlan.lastModifiedAt = Date.now();
    floorPlan.lastModifiedBy = req.user.id;
    
    await floorPlan.save();
    res.json(floorPlan);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


const mergeChanges = (originalData, changes) => {
  return { ...originalData, ...changes };
}
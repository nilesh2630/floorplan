const express = require('express');
const router = express.Router();
const floorPlanController = require('../controllers/floorPlanController');
const auth = require('../middleware/auth');
console.log("previous");
router.use(auth);
console.log("after");
router.post('/', floorPlanController.createFloorPlan);
router.get('/', floorPlanController.getAllFloorPlans);
router.get('/:id', floorPlanController.getFloorPlan);
router.put('/:id', floorPlanController.updateFloorPlan);
router.delete('/:id', floorPlanController.deleteFloorPlan);
router.post('/:id/sync', floorPlanController.syncOfflineChanges);

module.exports = router;
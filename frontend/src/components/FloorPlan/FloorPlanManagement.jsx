import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Save, Upload, Grid, Edit, Trash2 } from 'lucide-react';
import axios from 'axios';

const API_URL = 'https://floorplan.onrender.com';

// Custom hook for managing offline state
const useOfflineStatus = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
      
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOffline;
};


const useOfflineChanges = () => {
  const [offlineChanges, setOfflineChanges] = useState([]);

  useEffect(() => {
    const storedChanges = localStorage.getItem('offlineChanges');
    if (storedChanges) {
      setOfflineChanges(JSON.parse(storedChanges));
    }
  }, []);

  const addOfflineChange = (floorPlanId, change) => {
    const newChanges = [...offlineChanges, {
      floorPlanId,
      change,
      timestamp: Date.now()
    }];
    setOfflineChanges(newChanges);
    localStorage.setItem('offlineChanges', JSON.stringify(newChanges));
  };

  const clearOfflineChanges = (floorPlanId) => {
    const newChanges = offlineChanges.filter(
      change => change.floorPlanId !== floorPlanId
    );
    setOfflineChanges(newChanges);
    localStorage.setItem('offlineChanges', JSON.stringify(newChanges));
  };

  return { offlineChanges, addOfflineChange, clearOfflineChanges };
};

const FloorPlanManagement = () => {
  const [floorPlans, setFloorPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");
  const isOffline = useOfflineStatus();
  const [versions, setVersions]=useState(null);
  const { offlineChanges, addOfflineChange, clearOfflineChanges } = useOfflineChanges();
  const navigate = useNavigate();
 
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchFloorPlans();
  }, [token, navigate]);

  const fetchFloorPlans = async () => {
    try {
      const response = await axios.get(`${API_URL}/floorplans`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setFloorPlans(response.data);
    } catch (err) {
      setError('Failed to fetch floor plans');
    }
  };

  const handleCreatePlan = async (name, data) => {
    if (isOffline) {
      addOfflineChange('new', { name, data, type: 'create' });
      setError('Changes saved offline. Will sync when online.');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/floorplans`, 
        { name, data }, 
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      fetchFloorPlans();
    } catch (err) {
      setError('Failed to create floor plan');
    }
  };

  const handleUpdatePlan = async (id, updates) => {
    if (isOffline) {
      addOfflineChange(id, { ...updates, type: 'update' });
      setError('Changes saved offline. Will sync when online.');
      return;
    }

    try {
      const response = await axios.put(`${API_URL}/floorplans/${id}`, 
        {...updates,versione:versions}, 
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.status === 409) {
        setError('Conflict detected. Please refresh and try again.');
        return;
      }

      fetchFloorPlans();
    } catch (err) {
        if (err.response && err.response.status === 409) {
            const latestPlan = err.response.data.latestPlan;
            setError('Conflict detected. Please review the latest changes.');
      
          
            setSelectedPlan(latestPlan); // Load the latest plan for review
          } else {
            setError('Failed to update floor plan');
          }
    
    }
  };

  const changes=(plan)=>{
    setSelectedPlan(plan);
    setVersions(plan.version)
  }

  const handleDeletePlan = async (id) => {
    if (isOffline) {
      addOfflineChange(id, { type: 'delete' });
      setError('Delete operation saved offline. Will sync when online.');
      return;
    }

    try {
      const response = await axios.delete(`${API_URL}/floorplans/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      fetchFloorPlans();
    } catch (err) {
      setError('Failed to delete floor plan');
    }
  };


  const syncOfflineChanges = async () => {
    if (isOffline) return;

    for (const { floorPlanId, change } of offlineChanges) {
      try {
        if (change.type === 'create') {
          await handleCreatePlan(change.name, change.data);
        } else if (change.type === 'update') {
          await handleUpdatePlan(floorPlanId, change);
        } else if (change.type === 'delete') {
          await handleDeletePlan(floorPlanId);
        }
      } catch (err) {
        setError(`Failed to sync changes for plan ${floorPlanId}`);
        continue;
      }
    }

    clearOfflineChanges();
    fetchFloorPlans();
  };

  useEffect(() => {
    if (!isOffline && offlineChanges.length > 0) {
      syncOfflineChanges();
    }
  }, [isOffline]);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Floor Plan Management</h1>
        <div className="flex gap-2">
          {isOffline && (
            <div style={{ backgroundColor: '#ffcccb', padding: '10px', borderRadius: '4px', marginBottom: '16px' }}>
              <AlertCircle className="h-4 w-4" />
              You are currently offline. Changes will be saved locally.
            </div>
          )}
          <button
            onClick={() => setSelectedPlan({})}
            style={{ padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            <Upload className="mr-2 h-4 w-4" />
            New Floor Plan
          </button>
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: '#ffcccb', padding: '10px', borderRadius: '4px', marginBottom: '16px' }}>
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {floorPlans.length > 0 && floorPlans.map((plan) => (
  <div
    key={plan._id}
    style={{
      border: '1px solid #ccc',
      borderRadius: '8px',
      padding: '16px',
      position: 'relative',
    }}
  >
    <h2 className="flex justify-between items-center">
      <span>{plan.name}</span>
      <div className="flex gap-2">
        <button
          style={{ backgroundColor: 'transparent', border: 'none' }}
          onClick={() =>changes(plan) }    
        >
          <Edit className="h-4 w-4" />
        </button>
        <button
          style={{ backgroundColor: 'transparent', border: 'none' }}
          onClick={() => handleDeletePlan(plan._id)}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </h2>
    <div className="flex items-center gap-2 text-sm text-gray-500">
      <Grid className="h-4 w-4" />
      <span>Version: {plan.version}</span>
    </div>
    <div className="text-sm text-gray-500 mt-2">
      Last modified by: {plan.lastModifiedBy?.email}
    </div>

    {/* Displaying the Data field */}
    <div className="mt-2">
      <strong>Data:</strong>
      <pre style={{ background: '#f1f1f1', padding: '8px', borderRadius: '4px' }}>
        {JSON.stringify(plan.data, null, 2)}
      </pre>
    </div>
  </div>
))}

      </div>

      {selectedPlan && (
        <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1000 }}>
          <h2>Edit Floor Plan</h2>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (selectedPlan._id) {
                handleUpdatePlan(selectedPlan._id, { name: selectedPlan.name, data: selectedPlan.data });
              } else {
                handleCreatePlan(selectedPlan.name, selectedPlan.data);
              }
              setSelectedPlan(null); // Close the form
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
          >
            <label>
              Name:
              <input
                type="text"
                value={selectedPlan.name || ''}
                onChange={(e) => setSelectedPlan({ ...selectedPlan, name: e.target.value })}
                required
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </label>
            <label>
              Data:
              <textarea
                value={selectedPlan.data || ''}
                onChange={(e) => setSelectedPlan({ ...selectedPlan, data: e.target.value })}
                required
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </label>
            <button
              type="submit"
              style={{ padding: '10px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              <Save className="mr-2 h-4 w-4" />
              {selectedPlan._id ? 'Update' : 'Create'} Floor Plan
            </button>
            <button
              type="button"
              onClick={() => setSelectedPlan(null)}
              style={{ padding: '10px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Optional: Overlay for modal */}
      {selectedPlan && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 999
        }} />
      )}
    </div>
  );
};

export default FloorPlanManagement;

// ResourcesPage.js
import React, { useState, useEffect } from 'react';
import ResourceTable from '../components/ResourceTable';
import ResourceForm from '../components/ResourceForm';
import { fetchResources, deleteResource } from '../services/resourceService';

export default function ResourcesPage() {
  const [resources, setResources] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  useEffect(() => {
    // Fetch resources from API
    fetchResources().then(data => setResources(data));
  }, []);
  
  const handleEdit = (resource) => {
    setSelectedResource(resource);
    setIsFormOpen(true);
  };
  
  const handleDelete = async (id) => {
    // Confirm delete
    if (window.confirm('Are you sure you want to delete this resource?')) {
      await deleteResource(id);
      setResources(resources.filter(r => r.id !== id));
    }
  };
  
  return (
    <div className="resources-page">
      <div className="page-header">
        <h1>Manage Resources</h1>
        <button 
          className="add-button" 
          onClick={() => {
            setSelectedResource(null);
            setIsFormOpen(true);
          }}
        >
          Add Resource
        </button>
      </div>
      
      <ResourceTable 
        resources={resources} 
        onEdit={handleEdit} 
        onDelete={handleDelete} 
      />
      
      {isFormOpen && (
        <ResourceForm 
          resource={selectedResource} 
          onSave={(savedResource) => {
            // Update list with saved resource
            setResources(resources.map(r => 
              r.id === savedResource.id ? savedResource : r
            ));
            setIsFormOpen(false);
          }}
          onCancel={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
}
// src/pages/OrganizationHierarchyPage.jsx
import { useState, useEffect } from 'react';
import api from '../lib/axios';
import Navbar from '../components/layout/Navbar';

function OrganizationTree({ organization, level = 0 }) {
  return (
    <div style={{ marginLeft: `${level * 20}px` }}>
      <div className="p-2 border-l-2 border-gray-300">
        {organization.name} ({organization.orgId})
      </div>
      {organization.children?.map((child) => (
        <OrganizationTree 
          key={child._id} 
          organization={child} 
          level={level + 1} 
        />
      ))}
    </div>
  );
}

export default function OrganizationHierarchyPage() {
  const [organizations, setOrganizations] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await api.get('/organizations/hierarchy');
        setOrganizations(response.data);
      } catch (err) {
        setError('Failed to load organizations');
      }
    };

    fetchOrganizations();
  }, []);

  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-4">
        <h2 className="text-xl mb-4">Organization Hierarchy</h2>
        
        {error && (
          <div className="text-red-600 mb-4">{error}</div>
        )}

        {organizations && (
          <div className="border rounded p-4">
            <OrganizationTree organization={organizations} />
          </div>
        )}
      </div>
    </div>
  );
}

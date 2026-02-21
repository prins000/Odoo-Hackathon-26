import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import { getOperationErrorMessage } from '../../utils/errorMessages';
import {
  Truck,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  Eye,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Fuel,
  Settings,
  MapPin,
  Calendar
} from 'lucide-react';

const VehicleRegistry = () => {
  const { user } = useSelector((state) => state.auth);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    licensePlate: '',
    make: '',
    model: '',
    year: '',
    vehicleType: 'Truck',
    maxLoadCapacity: '',
    fuelType: 'Diesel',
    status: 'Available',
    odometer: '',
    lastMaintenanceDate: '',
    nextMaintenanceDue: '',
    insuranceExpiry: '',
    registrationExpiry: '',
    acquisitionCost: '',
    currentLocation: {
      latitude: '',
      longitude: '',
      address: ''
    },
    specifications: {
      engine: '',
      transmission: '',
      color: '',
      vin: ''
    }
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVehicles();
  }, [filterStatus, filterType, searchTerm]);

  const fetchVehicles = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/vehicles', {
        params: {
          status: filterStatus !== 'all' ? filterStatus : undefined,
          vehicleType: filterType !== 'all' ? filterType : undefined,
          search: searchTerm || undefined
        }
      });
      setVehicles(response.data?.data || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      const errorMessage = getOperationErrorMessage({ type: 'fetch', resource: 'vehicles' }, error);
      toast.error(errorMessage);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingVehicle) {
        await axios.put(`http://localhost:3000/api/vehicles/${editingVehicle._id}`, formData);
        toast.success('Vehicle updated successfully');
      } else {
        await axios.post('http://localhost:3000/api/vehicles', formData);
        toast.success('Vehicle added successfully');
      }
      
      fetchVehicles();
      setShowModal(false);
      setEditingVehicle(null);
      resetForm();
    } catch (error) {
      const errorMessage = getOperationErrorMessage({ type: editingVehicle ? 'update' : 'create', resource: 'vehicle' }, error);
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      name: vehicle.name || '',
      licensePlate: vehicle.licensePlate || '',
      make: vehicle.make || '',
      model: vehicle.model || '',
      year: vehicle.year || '',
      vehicleType: vehicle.vehicleType || 'Truck',
      maxLoadCapacity: vehicle.maxLoadCapacity || '',
      fuelType: vehicle.fuelType || 'Diesel',
      status: vehicle.status || 'Available',
      odometer: vehicle.odometer || '',
      lastMaintenanceDate: vehicle.lastMaintenanceDate ? new Date(vehicle.lastMaintenanceDate).toISOString().split('T')[0] : '',
      nextMaintenanceDue: vehicle.nextMaintenanceDue ? new Date(vehicle.nextMaintenanceDue).toISOString().split('T')[0] : '',
      insuranceExpiry: vehicle.insuranceExpiry ? new Date(vehicle.insuranceExpiry).toISOString().split('T')[0] : '',
      registrationExpiry: vehicle.registrationExpiry ? new Date(vehicle.registrationExpiry).toISOString().split('T')[0] : '',
      acquisitionCost: vehicle.acquisitionCost || '',
      currentLocation: vehicle.currentLocation || {
        latitude: '',
        longitude: '',
        address: ''
      },
      specifications: vehicle.specifications || {
        engine: '',
        transmission: '',
        color: '',
        vin: ''
      }
    });
    setShowModal(true);
  };

  const handleDelete = async (vehicleId) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await axios.delete(`http://localhost:3000/api/vehicles/${vehicleId}`);
        toast.success('Vehicle deleted successfully');
        fetchVehicles();
      } catch (error) {
        console.error('Error deleting vehicle:', error);
        const errorMessage = getOperationErrorMessage({ type: 'delete', resource: 'vehicle' }, error);
        toast.error(errorMessage);
      }
    }
  };

  const handleStatusChange = async (vehicleId, newStatus, driverId = null) => {
    try {
      await axios.put(`http://localhost:3000/api/vehicles/${vehicleId}/status`, {
        status: newStatus,
        driverId
      });
      toast.success(`Vehicle status updated to ${newStatus}`);
      fetchVehicles();
    } catch (error) {
      console.error('Error updating vehicle status:', error);
      const errorMessage = getOperationErrorMessage({ type: 'update', resource: 'vehicle' }, error);
      toast.error(errorMessage);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      licensePlate: '',
      make: '',
      model: '',
      year: '',
      vehicleType: 'Truck',
      maxLoadCapacity: '',
      fuelType: 'Diesel',
      status: 'Available',
      odometer: '',
      lastMaintenanceDate: '',
      nextMaintenanceDue: '',
      insuranceExpiry: '',
      registrationExpiry: '',
      acquisitionCost: '',
      currentLocation: {
        latitude: '',
        longitude: '',
        address: ''
      },
      specifications: {
        engine: '',
        transmission: '',
        color: '',
        vin: ''
      }
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-800';
      case 'On Trip': return 'bg-blue-100 text-blue-800';
      case 'In Shop': return 'bg-yellow-100 text-yellow-800';
      case 'Out of Service': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Available': return <CheckCircle className="h-4 w-4" />;
      case 'On Trip': return <Clock className="h-4 w-4" />;
      case 'In Shop': return <Settings className="h-4 w-4" />;
      case 'Out of Service': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || vehicle.status === filterStatus;
    const matchesType = filterType === 'all' || vehicle.vehicleType === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vehicle Registry</h1>
          <p className="text-gray-600 mt-1">
            {user?.role === 'Fleet Manager' 
              ? 'Oversee vehicle health and asset lifecycle' 
              : 'View vehicle information'
            }
          </p>
        </div>
        {/* Only show Add Vehicle button for Fleet Manager */}
        {user?.role === 'Fleet Manager' ? (
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Vehicle
          </button>
        ) : null}
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search vehicles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Filter className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="all">All Status</option>
                <option value="Available">Available</option>
                <option value="On Trip">On Trip</option>
                <option value="In Shop">In Shop</option>
                <option value="Out of Service">Out of Service</option>
              </select>
            </div>
            <div className="relative">
              <Truck className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="all">All Types</option>
                <option value="Truck">Truck</option>
                <option value="Van">Van</option>
                <option value="Car">Car</option>
                <option value="Motorcycle">Motorcycle</option>
                <option value="Bus">Bus</option>
                <option value="Trailer">Trailer</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type & Capacity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Odometer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Next Maintenance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVehicles.map((vehicle) => (
                <tr key={vehicle._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Truck className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{vehicle.name || vehicle.licensePlate}</div>
                        <div className="text-sm text-gray-500">{vehicle.make} {vehicle.model}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{vehicle.vehicleType}</div>
                    <div className="text-xs text-gray-500">{vehicle.maxLoadCapacity} tons</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(vehicle.status)}`}>
                      <div className="flex items-center">
                        {getStatusIcon(vehicle.status)}
                        <span className="ml-1">{vehicle.status}</span>
                      </div>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Fuel className="h-4 w-4 text-gray-400 mr-1" />
                      {vehicle.odometer?.toLocaleString() || 'N/A'} km
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                      {vehicle.nextMaintenanceDue ? 
                        new Date(vehicle.nextMaintenanceDue).toLocaleDateString() : 
                        'Not set'
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                      {vehicle.currentLocation?.address || 'Unknown'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(vehicle)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(vehicle._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-2/3 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-bold text-gray-900">
                {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
              </h3>
            </div>

            {error && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Delivery Truck 01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">License Plate</label>
                  <input
                    type="text"
                    name="licensePlate"
                    value={formData.licensePlate}
                    onChange={(e) => setFormData({...formData, licensePlate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="MH12-AB-1234"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
                  <input
                    type="text"
                    name="make"
                    value={formData.make}
                    onChange={(e) => setFormData({...formData, make: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tata"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ace"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <input
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="2022"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                  <select
                    name="vehicleType"
                    value={formData.vehicleType}
                    onChange={(e) => setFormData({...formData, vehicleType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Truck">Truck</option>
                    <option value="Van">Van</option>
                    <option value="Car">Car</option>
                    <option value="Motorcycle">Motorcycle</option>
                    <option value="Bus">Bus</option>
                    <option value="Trailer">Trailer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Load Capacity (tons)</label>
                  <input
                    type="number"
                    name="maxLoadCapacity"
                    value={formData.maxLoadCapacity}
                    onChange={(e) => setFormData({...formData, maxLoadCapacity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="5"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
                  <select
                    name="fuelType"
                    value={formData.fuelType}
                    onChange={(e) => setFormData({...formData, fuelType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Diesel">Diesel</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Electric">Electric</option>
                    <option value="CNG">CNG</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Available">Available</option>
                    <option value="On Trip">On Trip</option>
                    <option value="In Shop">In Shop</option>
                    <option value="Out of Service">Out of Service</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Odometer (km)</label>
                  <input
                    type="number"
                    name="odometer"
                    value={formData.odometer}
                    onChange={(e) => setFormData({...formData, odometer: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="50000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Maintenance Date</label>
                  <input
                    type="date"
                    name="lastMaintenanceDate"
                    value={formData.lastMaintenanceDate}
                    onChange={(e) => setFormData({...formData, lastMaintenanceDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Next Maintenance Due</label>
                  <input
                    type="date"
                    name="nextMaintenanceDue"
                    value={formData.nextMaintenanceDue}
                    onChange={(e) => setFormData({...formData, nextMaintenanceDue: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Expiry</label>
                  <input
                    type="date"
                    name="insuranceExpiry"
                    value={formData.insuranceExpiry}
                    onChange={(e) => setFormData({...formData, insuranceExpiry: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Registration Expiry</label>
                  <input
                    type="date"
                    name="registrationExpiry"
                    value={formData.registrationExpiry}
                    onChange={(e) => setFormData({...formData, registrationExpiry: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingVehicle(null);
                    resetForm();
                    setError('');
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingVehicle ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleRegistry;

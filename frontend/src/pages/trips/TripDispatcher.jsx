import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import { getOperationErrorMessage } from '../../utils/errorMessages';
import {
  Route,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Truck,
  Users,
  DollarSign,
  Package,
  Navigation,
  Play,
  Pause,
  Square
} from 'lucide-react';

const TripDispatcher = () => {
  const { user } = useSelector((state) => state.auth);
  const [error, setError] = useState('');
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    distance: '',
    estimatedDuration: '',
    cargoWeight: '',
    cargoType: '',
    revenue: '',
    estimatedCost: '',
    vehicle: '',
    priority: 'Medium',
    customer: {
      name: '',
      phone: '',
      email: '',
      address: ''
    },
    notes: ''
  });

  useEffect(() => {
    fetchTrips();
    fetchVehicles();
  }, [filterStatus, filterPriority, searchTerm]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/api/trips', {
        params: {
          status: filterStatus !== 'all' ? filterStatus : undefined,
          priority: filterPriority !== 'all' ? filterPriority : undefined,
          search: searchTerm || undefined
        }
      });
      setTrips(response.data?.data || []);
    } catch (error) {
      console.error('Error fetching trips:', error);
      const errorMessage = getOperationErrorMessage({ type: 'fetch', resource: 'trips' }, error);
      toast.error(errorMessage);
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/vehicles', {
        params: { status: 'Available' }
      });
      setVehicles(response.data?.data || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setVehicles([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Validate cargo weight against vehicle capacity
      if (formData.vehicle && formData.cargoWeight) {
        const selectedVehicle = vehicles.find(v => v._id === formData.vehicle);
        if (selectedVehicle && parseFloat(formData.cargoWeight) > parseFloat(selectedVehicle.maxLoadCapacity)) {
          setError(`Cargo weight exceeds vehicle capacity (${selectedVehicle.maxLoadCapacity} tons)`);
          return;
        }
      }

      if (editingTrip) {
        await axios.put(`http://localhost:3000/api/trips/${editingTrip._id}`, formData);
        toast.success('Trip updated successfully');
      } else {
        await axios.post('http://localhost:3000/api/trips', formData);
        toast.success('Trip created successfully');
      }
      
      fetchTrips();
      setShowModal(false);
      setEditingTrip(null);
      resetForm();
    } catch (error) {
      const errorMessage = getOperationErrorMessage({ type: editingTrip ? 'update' : 'create', resource: 'trip' }, error);
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleEdit = (trip) => {
    setEditingTrip(trip);
    setFormData({
      origin: trip.origin,
      destination: trip.destination,
      distance: trip.distance,
      estimatedDuration: trip.estimatedDuration,
      cargoWeight: trip.cargoWeight,
      cargoType: trip.cargoType,
      revenue: trip.revenue,
      estimatedCost: trip.estimatedCost,
      vehicle: trip.vehicle?._id || '',
      priority: trip.priority || 'Medium',
      customer: trip.customer || {
        name: '',
        phone: '',
        email: '',
        address: ''
      },
      notes: trip.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (tripId) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        await axios.delete(`http://localhost:3000/api/trips/${tripId}`);
        toast.success('Trip deleted successfully');
        fetchTrips();
      } catch (error) {
        console.error('Error deleting trip:', error);
        const errorMessage = getOperationErrorMessage({ type: 'delete', resource: 'trip' }, error);
        toast.error(errorMessage);
      }
    }
  };

  const handleStatusChange = async (tripId, action, data = {}) => {
    try {
      if (action === 'complete') {
        await axios.put(`http://localhost:3000/api/trips/${tripId}/complete`, data);
        toast.success('Trip completed successfully');
      } else if (action === 'cancel') {
        await axios.put(`http://localhost:3000/api/trips/${tripId}/cancel`, data);
        toast.success('Trip cancelled successfully');
      } else {
        await axios.put(`http://localhost:3000/api/trips/${tripId}`, { status: action });
        toast.success(`Trip status updated to ${action}`);
      }
      fetchTrips();
    } catch (error) {
      console.error('Error updating trip status:', error);
      const errorMessage = getOperationErrorMessage({ type: 'update', resource: 'trip' }, error);
      toast.error(errorMessage);
    }
  };

  const resetForm = () => {
    setFormData({
      origin: '',
      destination: '',
      distance: '',
      estimatedDuration: '',
      cargoWeight: '',
      cargoType: '',
      revenue: '',
      estimatedCost: '',
      vehicle: '',
      priority: 'Medium',
      customer: {
        name: '',
        phone: '',
        email: '',
        address: ''
      },
      notes: ''
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Draft': return 'bg-gray-100 text-gray-800';
      case 'Dispatched': return 'bg-blue-100 text-blue-800';
      case 'In Transit': return 'bg-yellow-100 text-yellow-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Draft': return <Calendar className="h-4 w-4" />;
      case 'Dispatched': return <Play className="h-4 w-4" />;
      case 'In Transit': return <Navigation className="h-4 w-4" />;
      case 'Completed': return <CheckCircle className="h-4 w-4" />;
      case 'Cancelled': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = (trip.origin && trip.origin.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (trip.destination && trip.destination.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (trip.vehicle?.licensePlate && trip.vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (trip.tripId && trip.tripId.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (trip.customer?.name && trip.customer.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || trip.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || trip.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
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
          <h1 className="text-3xl font-bold text-gray-900">
            {user?.role === 'driver' ? 'My Trips' : 'Trip Management'}
          </h1>
          <p className="text-gray-600 mt-1">
            {user?.role === 'driver' 
              ? 'View and manage your assigned trips' 
              : 'Create and manage all trips'
            }
          </p>
        </div>
        {/* Only show Create Trip button for non-driver roles */}
        {user?.role !== 'driver' && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Trip
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search trips..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Status</option>
              <option value="planned">Planned</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Route
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle & Driver
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cargo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTrips.map((trip) => (
                <tr key={trip._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Navigation className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {trip.origin} → {trip.destination}
                        </div>
                        <div className="text-sm text-gray-500">
                          {trip.distance} km • {trip.estimatedDuration}h
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <Truck className="h-4 w-4 text-gray-400 mr-1" />
                        {trip.vehicle?.licensePlate || 'Unassigned'}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-gray-400 mr-1" />
                        {trip.driver?.name || 'Unassigned'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Package className="h-4 w-4 text-gray-400 mr-1" />
                      <div>
                        <div>{trip.cargoWeight} tons</div>
                        <div className="text-xs text-gray-500">{trip.cargoType}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(trip.status)}`}>
                      <div className="flex items-center">
                        {getStatusIcon(trip.status)}
                        <span className="ml-1 capitalize">{trip.status}</span>
                      </div>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                      ${trip.revenue}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {/* Edit and Delete buttons only for non-drivers */}
                      {user?.role !== 'driver' && (
                        <>
                          <button
                            onClick={() => handleEdit(trip)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit Trip"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(trip._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Trip"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      
                      {/* Status change buttons - different for drivers vs others */}
                      {user?.role === 'driver' ? (
                        // Drivers can only start/stop their own trips
                        <>
                          {trip.status === 'planned' && (
                            <button
                              onClick={() => handleStatusChange(trip._id, 'in-progress')}
                              className="text-green-600 hover:text-green-900"
                              title="Start Trip"
                            >
                              <Play className="h-4 w-4" />
                            </button>
                          )}
                          {trip.status === 'in-progress' && (
                            <button
                              onClick={() => handleStatusChange(trip._id, 'completed')}
                              className="text-blue-600 hover:text-blue-900"
                              title="Complete Trip"
                            >
                              <Square className="h-4 w-4" />
                            </button>
                          )}
                        </>
                      ) : (
                        // Admin/Manager/Dispatcher can change any status
                        <>
                          {trip.status === 'planned' && (
                            <button
                              onClick={() => handleStatusChange(trip._id, 'in-progress')}
                              className="text-green-600 hover:text-green-900"
                              title="Start Trip"
                            >
                              <Play className="h-4 w-4" />
                            </button>
                          )}
                          {trip.status === 'in-progress' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(trip._id, 'paused')}
                                className="text-yellow-600 hover:text-yellow-900"
                                title="Pause Trip"
                              >
                                <Pause className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleStatusChange(trip._id, 'completed')}
                                className="text-blue-600 hover:text-blue-900"
                                title="Complete Trip"
                              >
                                <Square className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          {trip.status === 'paused' && (
                            <button
                              onClick={() => handleStatusChange(trip._id, 'in-progress')}
                              className="text-green-600 hover:text-green-900"
                              title="Resume Trip"
                            >
                              <Play className="h-4 w-4" />
                            </button>
                          )}
                        </>
                      )}
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
                {editingTrip ? 'Edit Trip' : 'Create New Trip'}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Origin</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="origin"
                      value={formData.origin}
                      onChange={(e) => setFormData({...formData, origin: e.target.value})}
                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Mumbai, Maharashtra"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="destination"
                      value={formData.destination}
                      onChange={(e) => setFormData({...formData, destination: e.target.value})}
                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Delhi, Delhi"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Distance (km)</label>
                  <input
                    type="number"
                    name="distance"
                    value={formData.distance}
                    onChange={(e) => setFormData({...formData, distance: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Duration (hours)</label>
                  <input
                    type="number"
                    name="estimatedDuration"
                    value={formData.estimatedDuration}
                    onChange={(e) => setFormData({...formData, estimatedDuration: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="8"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cargo Weight (tons)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="cargoWeight"
                    value={formData.cargoWeight}
                    onChange={(e) => setFormData({...formData, cargoWeight: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="5.5"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cargo Type</label>
                  <input
                    type="text"
                    name="cargoType"
                    value={formData.cargoType}
                    onChange={(e) => setFormData({...formData, cargoType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Electronics"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Revenue ($)</label>
                  <input
                    type="number"
                    name="revenue"
                    value={formData.revenue}
                    onChange={(e) => setFormData({...formData, revenue: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="2500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="planned">Planned</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
                  <select
                    name="vehicle"
                    value={formData.vehicle}
                    onChange={(e) => setFormData({...formData, vehicle: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Vehicle</option>
                    {vehicles.filter(v => v.status === 'Available').map((vehicle) => (
                      <option key={vehicle._id} value={vehicle._id}>
                        {vehicle.licensePlate} - {vehicle.make} {vehicle.model} ({vehicle.capacity} tons)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Driver</label>
                  <select
                    name="driver"
                    value={formData.driver}
                    onChange={(e) => setFormData({...formData, driver: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Driver</option>
                    {drivers.filter(d => d.status === 'On Duty').map((driver) => (
                      <option key={driver._id} value={driver._id}>
                        {driver.name} - {driver.licenseNumber}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="datetime-local"
                    name="startDate"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="datetime-local"
                    name="endDate"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Additional notes about the trip..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingTrip(null);
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
                  {editingTrip ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripDispatcher;

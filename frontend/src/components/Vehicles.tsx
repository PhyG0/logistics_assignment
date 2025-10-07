import { useState, useEffect } from "react";
import { useApi } from "../hooks/useApi";
import { Truck, Plus, CheckCircle, Package, Gauge, AlertCircle } from "lucide-react";

interface Vehicle {
  _id: string;
  number: string;
  type: string;
  capacity: number;
  currentDelivery: string | null;
}

const Vehicles = () => {
  const { sendRequest, loading, error } = useApi();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [newVehicle, setNewVehicle] = useState({ number: "", type: "", capacity: 0 });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    const result = await sendRequest("/api/vehicle", "GET");
    if (result) setVehicles(result);
  };

  const handleAddVehicle = async () => {
    if (!newVehicle.number || !newVehicle.type || newVehicle.capacity <= 0) {
      return;
    }

    setIsAdding(true);
    const result = await sendRequest("/api/vehicle", "POST", newVehicle);
    if (result) {
      setVehicles([...vehicles, result]);
      setNewVehicle({ number: "", type: "", capacity: 0 });
    }
    setIsAdding(false);
  };

  const availableCount = vehicles.filter(v => !v.currentDelivery).length;
  const busyCount = vehicles.filter(v => v.currentDelivery).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Truck className="w-7 h-7 text-indigo-600" />
            </div>
            <h2 className="text-4xl font-bold text-slate-800">Fleet Management</h2>
          </div>
          <p className="text-slate-600 ml-14">Manage and track your delivery vehicles</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Total Vehicles</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{vehicles.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Available</p>
                <p className="text-3xl font-bold text-emerald-600 mt-1">{availableCount}</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">On Delivery</p>
                <p className="text-3xl font-bold text-amber-600 mt-1">{busyCount}</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg">
                <Package className="w-8 h-8 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Add Vehicle Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Plus className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800">Add New Vehicle</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-slate-700 mb-2">Vehicle Number</label>
              <input
                type="text"
                placeholder="e.g., ABC-1234"
                value={newVehicle.number}
                onChange={(e) => setNewVehicle({ ...newVehicle, number: e.target.value })}
                className="border border-slate-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-slate-700 mb-2">Vehicle Type</label>
              <input
                type="text"
                placeholder="e.g., Van, Truck"
                value={newVehicle.type}
                onChange={(e) => setNewVehicle({ ...newVehicle, type: e.target.value })}
                className="border border-slate-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-slate-700 mb-2">Capacity (Kg)</label>
              <input
                type="number"
                placeholder="0"
                value={newVehicle.capacity || ""}
                onChange={(e) => setNewVehicle({ ...newVehicle, capacity: Number(e.target.value) })}
                className="border border-slate-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleAddVehicle}
                disabled={isAdding || !newVehicle.number || !newVehicle.type || newVehicle.capacity <= 0}
                className="w-full bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow"
              >
                {isAdding ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Add Vehicle
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
          </div>
        )}

        {/* Vehicles Grid */}
        {!loading && vehicles.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No vehicles yet</h3>
            <p className="text-slate-500">Add your first vehicle to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {vehicles.map(v => {
              const isAvailable = !v.currentDelivery;

              return (
                <div
                  key={v._id}
                  className="bg-white rounded-2xl shadow-sm border-2 border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  {/* Status Banner */}
                  <div className={`px-5 py-3 flex items-center justify-between ${
                    isAvailable 
                      ? "bg-emerald-50 border-b border-emerald-200" 
                      : "bg-amber-50 border-b border-amber-200"
                  }`}>
                    <div className="flex items-center gap-2">
                      {isAvailable ? (
                        <>
                          <CheckCircle className="w-5 h-5 text-emerald-600" />
                          <span className="font-semibold text-sm text-emerald-700">Available</span>
                        </>
                      ) : (
                        <>
                          <Package className="w-5 h-5 text-amber-600" />
                          <span className="font-semibold text-sm text-amber-700">On Delivery</span>
                        </>
                      )}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      isAvailable 
                        ? "bg-emerald-100 text-emerald-700" 
                        : "bg-amber-100 text-amber-700"
                    }`}>
                      {isAvailable ? "Ready" : "Busy"}
                    </div>
                  </div>

                  {/* Vehicle Details */}
                  <div className="p-5 space-y-4">
                    {/* Vehicle Number - Prominent */}
                    <div className="text-center pb-4 border-b border-slate-200">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg">
                        <Truck className="w-5 h-5 text-slate-600" />
                        <span className="text-2xl font-bold text-slate-800">{v.number}</span>
                      </div>
                    </div>

                    {/* Vehicle Info Grid */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                          <Truck className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Type</p>
                          <p className="text-sm font-semibold text-slate-800">{v.type}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Gauge className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Capacity</p>
                          <p className="text-sm font-semibold text-slate-800">{v.capacity} Kg</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Vehicles;
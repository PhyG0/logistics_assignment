import { useState, useEffect } from "react";
import { useApi } from "../hooks/useApi";
import { Users, User, Mail, Phone, Calendar, CheckCircle, Package, AlertCircle } from "lucide-react";

interface Driver {
  age: string;
  _id: string;
  username: string;
  email: string;
  phone?: string;
  currentDelivery: string | null;
}

const Drivers = () => {
  const { sendRequest, loading, error } = useApi();
  const [drivers, setDrivers] = useState<Driver[]>([]);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    const result = await sendRequest("/api/delivery/drivers", "GET");
    if (result) setDrivers(result);
    console.log(result);
  };

  const availableCount = drivers.filter(d => !d.currentDelivery).length;
  const busyCount = drivers.filter(d => d.currentDelivery).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Users className="w-7 h-7 text-indigo-600" />
            </div>
            <h2 className="text-4xl font-bold text-slate-800">Drivers</h2>
          </div>
          <p className="text-slate-600 ml-14">Manage and track your delivery drivers</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Total Drivers</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{drivers.length}</p>
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

        {/* Empty State */}
        {!loading && drivers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No drivers found</h3>
            <p className="text-slate-500">Drivers will appear here once they register</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {drivers.map((d) => {
              const isAvailable = !d.currentDelivery;

              return (
                <div
                  key={d._id}
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

                  {/* Driver Details */}
                  <div className="p-5 space-y-4">
                    {/* Driver Name - Prominent */}
                    <div className="text-center pb-4 border-b border-slate-200">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mb-3">
                        <User className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800">{d.username}</h3>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                          <Mail className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Email</p>
                          <p className="text-sm font-medium text-slate-800 truncate">{d.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                          <Phone className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Phone</p>
                          <p className="text-sm font-medium text-slate-800">
                            {d.phone || "Not provided"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                          <Calendar className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Age</p>
                          <p className="text-sm font-medium text-slate-800">
                            {d.age || "Not provided"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Status Footer */}
                    <div className={`mt-4 pt-4 border-t flex items-center justify-center gap-2 ${
                      isAvailable ? "border-emerald-200" : "border-amber-200"
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        isAvailable ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                      }`}></div>
                      <span className={`text-sm font-medium ${
                        isAvailable ? "text-emerald-700" : "text-amber-700"
                      }`}>
                        {isAvailable ? "Ready for assignments" : "Currently delivering"}
                      </span>
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

export default Drivers;
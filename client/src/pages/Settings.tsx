import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { user } = useAuth();
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        {user?.role === 'admin' ? 'Settings' : 'User Settings'}
      </h2>
      <div className="bg-gray-50 rounded-xl p-6 max-w-md">
        <p className="text-gray-600"><span className="font-medium">Username:</span> {user?.username}</p>
        <p className="text-gray-600 mt-2"><span className="font-medium">Email:</span> {user?.email}</p>
        <p className="text-gray-600 mt-2"><span className="font-medium">Role:</span> {user?.role}</p>
      </div>
    </div>
  );
}

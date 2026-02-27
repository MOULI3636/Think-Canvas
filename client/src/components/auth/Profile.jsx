import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiEdit2, FiSave, FiX, FiPhone, FiMail, FiUser, FiCalendar } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phoneNumber: user?.phoneNumber || '',
    bio: user?.bio || ''
  });

  useEffect(() => {
    setFormData({
      name: user?.name || '',
      phoneNumber: user?.phoneNumber || '',
      bio: user?.bio || ''
    });
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name.trim()) {
        toast.error('Name is required');
        return;
      }

      const response = await api.put('/users/profile', formData);
      updateUser(response.data);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
        {/* Cover Photo */}
        <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600"></div>
        
        {/* Profile Header */}
        <div className="px-6 pb-6">
          <div className="flex justify-between items-start -mt-12">
            <div className="flex items-end space-x-4">
              <img
                src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&size=128`}
                alt={user?.name}
                className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 bg-white"
              />
              <div className="mb-2">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user?.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {user?.email}
                </p>
              </div>
            </div>
            
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="mt-4 flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <FiEdit2 />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={handleSubmit}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <FiSave />
                  <span>Save</span>
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  <FiX />
                  <span>Cancel</span>
                </button>
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="mt-6 space-y-4">
            <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
              <FiMail className="text-xl" />
              <span>{user?.email}</span>
            </div>
            
            {isEditing ? (
              <>
                <div className="flex items-center space-x-3">
                  <FiUser className="text-xl text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Full Name"
                    className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div className="flex items-center space-x-3">
                  <FiPhone className="text-xl text-gray-400" />
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="Phone Number"
                    className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div className="flex items-start space-x-3">
                  <FiUser className="text-xl text-gray-400 mt-2" />
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell us about yourself"
                    rows="3"
                    className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </>
            ) : (
              <>
                {user?.phoneNumber && (
                  <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                    <FiPhone className="text-xl" />
                    <span>{user.phoneNumber}</span>
                  </div>
                )}
                {user?.bio && (
                  <div className="flex items-start space-x-3 text-gray-600 dark:text-gray-400">
                    <FiUser className="text-xl mt-1" />
                    <p>{user.bio}</p>
                  </div>
                )}
                <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                  <FiCalendar className="text-xl" />
                  <span>Joined {new Date(user?.createdAt).toLocaleDateString()}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

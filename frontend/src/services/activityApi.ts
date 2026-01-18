import axios from "axios";

const API_BASE_URL = "http://localhost:5001/api/activities";

export const getAllActivities = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/getActivities`);
    console.log("Fetched activities:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching activities:", error);
    throw error;
  }
};

export const createActivity = async (activityData: {
  name: string;
  color?: string;
}) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/createActivity`, activityData);
    return response.data;
  } catch (error) {
    console.error("Error creating activity:", error);
    throw error;
  }
};

export const updateActivity = async (
  activityId: string,
  updatedData: { name?: string; description?: string }
) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/updateActivity/${activityId}`,
      updatedData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating activity:", error);
    throw error;
  }
};

export const deleteActivity = async (activityId: string) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/deleteActivity/${activityId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting activity:", error);
    throw error;
  }
};

// TODO: make it more robust with better error handling and possibly retries
// TODO: make it as a service 
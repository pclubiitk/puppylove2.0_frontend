const SERVER_IP = process.env.SERVER_IP;

export const getStats = async () => {
  try {
    const res = await fetch(`${SERVER_IP}/stats`, {
      method: 'GET',
      credentials: 'include', // For CORS
    });
    if (!res.ok) {
      throw new Error(`HTTP Error: ${res.status} - ${res.statusText}`);
    }
    const resJson = await res.json();
    return resJson;
   
  } catch (err) {
    console.log(err);
    throw new Error('Error in Fetching Stats');
  }
};

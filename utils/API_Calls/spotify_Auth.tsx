import {generateRandomString,sha256,base64encode} from '../Encryption';

// Function to handle the authorization flow
export const handleAuthorization = async (
  clientId: string,
  scope: string,
  redirectUri: string
) => {
  const codeVerifier = generateRandomString(64);
  localStorage.setItem("code_verifier", codeVerifier);

  const hashed = await sha256(codeVerifier);
  const codeChallenge = base64encode(hashed);

  const authUrl = new URL("https://accounts.spotify.com/authorize");
  const params = {
    response_type: "code",
    client_id: clientId,
    scope,
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
    redirect_uri: redirectUri,
  };

  authUrl.search = new URLSearchParams(params).toString();
  window.location.href = authUrl.toString();
};



// Function to fetch the access token using the authorization code
export const fetchAccessToken = async (
  code: string,
  clientId: string,
  redirectUri: string,
  setAccessToken: Function
) => {
  try {
    const codeVerifier = localStorage.getItem("code_verifier");
    if (!codeVerifier) {
      console.error("Code verifier not found in localStorage");
      return;
    }

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }),
    });

    const data = await response.json();

    if (data.access_token) {
      const expiresIn = data.expires_in * 1000; 
      const expiryTime = Date.now() + expiresIn;
      setAccessToken(data.access_token);
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      localStorage.setItem("token_expiry", expiryTime.toString());
      window.history.replaceState({}, document.title, "/dashboard");
    } else {
      console.error("Error fetching access token:", data);
    }
  } catch (error) {
    console.error("Error in fetchAccessToken:", error);
  }
};

// Function to refresh the access token
export const getRefreshToken = async (
  clientId: string,
  scope: string,
  redirectUri: string,
  setAccessToken: Function
) => {
  try {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) throw new Error("No refresh token found");

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: clientId,
      }),
    });

    const data = await response.json();

    if (data.access_token) {
      const expiresIn = data.expires_in * 1000;
      const expiryTime = Date.now() + expiresIn; 

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("token_expiry", expiryTime.toString());

      if (data.refresh_token) {
        localStorage.setItem("refresh_token", data.refresh_token);
      }

      setAccessToken(data.access_token);
      return data.access_token;
    } else {
      throw new Error("Failed to refresh access token");
    }
  } catch (error) {
    console.error("Error refreshing token:", error);
    handleAuthorization(clientId, scope, redirectUri);
  }
};
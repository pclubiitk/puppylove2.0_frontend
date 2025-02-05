import { SHA256, Decryption_AES } from '../Encryption';
import {
  Set_PrivK,
  Set_PubK,
  Set_Data,
  Set_Gender,
  Set_Claims,
  Set_Submit,
  Set_Id,
  PrivK,
  PubK,
  setAbout,
  setInterestes,
} from '../UserData';
import { fetchAndDecodeHearts } from './recievedHearts';
import { returnHearts_Late } from './returnHearts';
import { FetchReturnedHearts } from './Matching';
const SERVER_IP = process.env.SERVER_IP;
import Cookies from 'js-cookie';

// Admin Permit to Send Hearts
export var Permit = true;

export const handleLog = async (data: any, recaptchaToken: any) => {
  try {
    const myHeaders = new Headers();
    myHeaders.append('g-recaptcha-response', recaptchaToken);
    const passHash = await SHA256(data.password);
    const bdy = JSON.stringify({
      _id: data.id,
      passHash: passHash,
    });

    const requestOptions: RequestInit = {
      method: 'POST',
      headers: myHeaders,
      credentials: 'include',
      body: bdy,
      redirect: 'follow',
    };

    const res = await fetch(`${SERVER_IP}/captcha/user/login`, requestOptions);

    if (!res.ok) {
      console.log(
        `HTTP Error: ${res.status} - ${res.statusText} - URL: ${SERVER_IP}/captcha/user/login`
      );
      return { success: false, credentialError: true };
    }
    const res_json = await res.json();
    const pvtKey_Enc: string = res_json.pvtKey_Enc;
    const pvtKey_login = await Decryption_AES(pvtKey_Enc, data.password);
    Set_PrivK(pvtKey_login);
    Set_PubK(res_json.pubKey);

    // Store the private key and public key in the session storage
    sessionStorage.setItem(
      'data',
      JSON.stringify({ k1: pvtKey_login, k2: res_json.pubKey })
    );

    return { success: true };
  } catch (err) {
    console.log(err);
    return { success: false, credentialError: false };
  }
};

export const fetchUserData = async () => {
  try {
    // Set the keys from the session storage
    if (PrivK === '' || PubK === '') {
      const data = sessionStorage.getItem('data');
      if (data != null) {
        const keys = JSON.parse(data);
        Set_PrivK(keys.k1);
        Set_PubK(keys.k2);
      } else {
        return { success: false, message: 'Please login again' };
      }
    }
    // Send the request
    const res = await fetch(`${SERVER_IP}/users/data`, {
      method: 'GET',
      credentials: 'include',
    });
    if (!res.ok) {
      throw new Error(`HTTP Error: ${res.status} - ${res.statusText}`);
    }
    const res_json = await res.json();

    // set basic info
    setAbout(res_json.about);
    setInterestes(res_json.interest);

    // Do other calculations
    Permit = res_json.permit;
    Set_Submit(res_json.submit);
    Set_Id(res_json.id);
    Set_Gender(res_json.gender);
    await Set_Data(res_json.data);
    await Set_Claims(res_json.claims);

    await fetchAndDecodeHearts();

    if (res_json.submit === true) {
      if (Permit) {
        await returnHearts_Late();
      }
      await FetchReturnedHearts();
    }

    return {
      success: true,
      permit: res_json.permit,
      publish: res_json.publish,
    };
  } catch (err) {
    console.error(err);
    return { success: false, message: 'Please login again' };
  }
};

export const handle_Logout = async () => {
  try {
    sessionStorage.removeItem('data');
    Cookies.remove('Authorization');
    const res = await fetch(`${SERVER_IP}/session/logout`, {
      method: 'GET',
    });
    if (!res.ok) {
      throw new Error(`HTTP Error: ${res.status} - ${res.statusText}`);
    }
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

export const fetchAllUserInfo = async () => {
  try {
    const res = await fetch(`${SERVER_IP}/users/alluserInfo`, {
      method: 'GET',
    });
    if (!res.ok) {
      throw new Error(`HTTP Error: ${res.status} - ${res.statusText}`);
    }
    const res_json = await res.json();
    localStorage.setItem('about', res_json.about);
    localStorage.setItem('interest', res_json.interests);
    return {
      success: true,
      about: res_json.about,
      interests: res_json.interests,
    };
  } catch (err) {
    return { success: false, message: 'Cannot fetch all users profiles' };
  }
};

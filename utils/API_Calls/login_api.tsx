import {SHA256, Decryption_AES} from "../Encryption"
import {Set_PrivK, Set_PubK, Set_Data, Set_Gender, Set_Claims, Set_Submit, Set_Id} from "../UserData"
import { fetchAndDecodeHearts } from "./recievedHearts"
import { returnHearts_Late } from "./returnHearts"
import { FetchReturnedHearts } from "./Matching"
const SERVER_IP = process.env.SERVER_IP

export const handleLog = async(data: any) => {
    try {
      Set_Id(data.id);
      const passHash = await SHA256(data.password)
      const res = await fetch(
          `${SERVER_IP}/session/login`, {
              method: "POST",
              credentials: "include",  // uncomment this line if server running on same host as frontend (CORS)
              body: JSON.stringify({
                  _id: data.id,
                  passHash: passHash
              }),

              headers: {
                  "Content-type": "application/json; charset=UTF-8"
              }
          }
      );
      if (!res.ok) {
        throw new Error(`HTTP Error: ${res.status} - ${res.statusText}`);
      }
      const res_json = await res.json()
      const pvtKey_Enc: string = res_json.pvtKey_Enc
      const pvtKey_login = await Decryption_AES(pvtKey_Enc, data.password)

      Set_PrivK(pvtKey_login)
      Set_PubK(res_json.pubKey)
      Set_Gender(res_json.gender)
      Set_Submit(res_json.submit)
      await Set_Data(res_json.data, data.id)
      await Set_Claims(res_json.claims)

      await fetchAndDecodeHearts()

      if(res_json.submit === true) {
        await returnHearts_Late()
      }
      
      // await FetchReturnedHearts()

      return true
    }
    catch(err) {
      console.log(err)
      return false
    }
  }

export const handle_Logout = async() => {
  try {
    const res = await fetch(
      `${SERVER_IP}/session/logout`, {
        method: "GET"
      }
    )
    if (!res.ok) {
      throw new Error(`HTTP Error: ${res.status} - ${res.statusText}`);
    }
    return true;
  }
  catch(err) {
    console.log(err)
    return false 
  }
}
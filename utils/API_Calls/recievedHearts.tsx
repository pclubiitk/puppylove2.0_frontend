import { Decryption } from '../Encryption'; 
import { PrivK, Set_heartsMale, Set_heartsFemale, Claims, Submit , Claims_Late} from "../UserData"
const SERVER_IP = process.env.SERVER_IP

export const fetchAndDecodeHearts = async () => {
  const res = await fetch(`${SERVER_IP}/users/fetchall`, {
    method: "GET",
    credentials: "include"  // uncomment this line if server running on same host as frontend (CORS)
  });
  if (!res.ok) {
    throw new Error(`HTTP Error: ${res.status} - ${res.statusText}`);
  } 
  else {
    let heartsMales: number = 0
    let heartsFemales: number = 0
    const data = await res.json();
    // console.log(data)
    await Promise.all(data.map( async (element : any) => {
      const encoded_sha = element.enc;
      const gender = element.genderOfSender;
      const decrypted_sha = await Decryption(encoded_sha, PrivK);

      if(decrypted_sha === 'Fail') {
        return;
      }

      const claim_status = await ClaimHeart(encoded_sha, decrypted_sha, gender);

      if(claim_status === 'true') {
        if(gender === 'F') {
          heartsFemales++;
        }
        else {
          heartsMales++;
        }

        Claims.push({enc: encoded_sha, sha: decrypted_sha, gender: gender})
        if(Submit === true) {
          Claims_Late.push({enc: encoded_sha, sha: decrypted_sha})
        }
      }
    }));
    Set_heartsFemale(heartsFemales)
    Set_heartsMale(heartsMales)
  }
};

const ClaimHeart = async (enc: string, sha: string, gender: string) => {
    const res = await fetch(`${SERVER_IP}/users/claimheart`, {
    method: "POST",
    credentials: "include",  // uncomment this line if server running on same host as frontend (CORS)
    body: JSON.stringify({
      enc: enc,
      sha: sha,
      genderOfSender: gender,
    })
  });
  if (!res.ok) {
    throw new Error(`HTTP Error: ${res.status} - ${res.statusText}`);
  }
  const res_json = await res.json()
  return res_json.claim_status
}
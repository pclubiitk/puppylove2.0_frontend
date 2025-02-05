import { SHA256, Encryption, Encryption_AES, generateRandomString } from '../Encryption';
import { PubK, Gender, ReturnHearts, Set_Submit, PrivK } from '../UserData';
import { returnHearts } from './returnHearts';
const SERVER_IP = process.env.SERVER_IP;

let PublicKeys: Record<string,string> = {};
let isPubliKAvail = false;

async function fetchPubKeys() {
  const res = await fetch(`${SERVER_IP}/users/fetchPublicKeys`, {
    method: 'GET',
    credentials: 'include', // For CORS
  });
  if (!res.ok) {
    throw new Error(`HTTP Error: ${res.status} - ${res.statusText}`);
  }
  const res_json = await res.json();
  PublicKeys = res_json;
}

export const SendHeart = async (
  senderId: string,
  receiverIds: string[],
  selectedSongs: { [key: string]: string | null },
 
  Submit: boolean,
) => {
  try {
    if (!isPubliKAvail) {
      await fetchPubKeys();
      isPubliKAvail = true;
    }
    const enc: string[] = [];
    const sha: string[] = [];
    const sha_encrypt: string[] = [];
    const ids_encrypt: string[] = [];
    const song_encrypt: string[] = [];
    const R1: number = parseInt(senderId);
    for (const id of receiverIds) {
      if (id === '') {
        enc.push('');
        sha.push('');
        ids_encrypt.push('');
        song_encrypt.push('');
        continue;
      }
      const R2: number = parseInt(id);
      // const random = await RandInt();
      // const R3: string = random.toString();
      const random = generateRandomString(128);
      const R3: string = random;
      const pubKey_: string = get_pubKey(id);
      let id_encrypt: string;
      // need to imporove this code, only id_plain is different
      if (R1 < R2) {
        const id_plain: string = R1.toString() + '-' + R2.toString() + '-' + R3;
        id_encrypt = await Encryption(id_plain, PubK); 
        const sha_: string = await SHA256(id_plain);
        sha.push(sha_);
        const sha_encrypt_: string = await Encryption_AES(sha_, PrivK);
        sha_encrypt.push(sha_encrypt_);
        const enc_: string = await Encryption(sha_, pubKey_);
        enc.push(enc_);
      } else {
        const id_plain: string = R2.toString() + '-' + R1.toString() + '-' + R3;
        id_encrypt = await Encryption(id_plain, PubK);
        const sha_: string = await SHA256(id_plain);
        sha.push(sha_);
        const sha_encrypt_: string = await Encryption_AES(sha_, PrivK);
        sha_encrypt.push(sha_encrypt_);
        const enc_: string = await Encryption(sha_, pubKey_);
        enc.push(enc_);
      }
      ids_encrypt.push(id_encrypt);
     // Encrypt song ID
     const songId = selectedSongs[id] || '';
     if (songId) {
       const song_plain: string = `${R1}-${R2}-${songId}-${R3}`;
       
       const song_enc: string = await Encryption(song_plain, PubK);
       song_encrypt.push(song_enc);
     } else {
       song_encrypt.push(''); 
     }
     
    }
    const res = await fetch(`${SERVER_IP}/users/sendheartVirtual`, {
      method: 'POST',
      credentials: 'include', // For CORS
      body: JSON.stringify({
        hearts: {
          heart1: {
            sha_encrypt: sha_encrypt[0],
            id_encrypt: ids_encrypt[0],
            song_id: song_encrypt[0],
          },
          heart2: {
            sha_encrypt: sha_encrypt[1],
            id_encrypt: ids_encrypt[1],
            song_id: song_encrypt[1],
          },
          heart3: {
            sha_encrypt: sha_encrypt[2],
            id_encrypt: ids_encrypt[2],
            song_id: song_encrypt[2],
          },
          heart4: {
            sha_encrypt: sha_encrypt[3],
            id_encrypt: ids_encrypt[3],
            song_id: song_encrypt[3],
          },
        },
      }),
    });
    if (!res.ok) {
      throw new Error(`HTTP Error: ${res.status} - ${res.statusText}`);
    }
    if (Submit) {
      Set_Submit(Submit);
      await returnHearts();
      const res = await fetch(`${SERVER_IP}/users/sendheart`, {
        method: 'POST',
        credentials: 'include', // For CORS
        body: JSON.stringify({
          genderofsender: Gender,
          enc1: enc[0],
          sha1: sha[0],
          enc2: enc[1],
          sha2: sha[1],
          enc3: enc[2],
          sha3: sha[2],
          enc4: enc[3],
          sha4: sha[3],
          returnhearts: ReturnHearts,
        }),
      });
      if (!res.ok) {
        throw new Error(`HTTP Error: ${res.status} - ${res.statusText}`);
      }
    }
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

export function get_pubKey(id: string) {
  if (PublicKeys[id]) {
      return PublicKeys[id];
  }
  throw new Error("Public Key Not Found");
}

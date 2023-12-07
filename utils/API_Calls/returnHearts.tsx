import { Encryption } from '../Encryption'; 
import { Claims, ReturnHearts, ReturnHearts_Late, Claims_Late, pubKeys, receiverIds } from "../UserData"
import { get_pubKey } from "./Send_Heart"
const SERVER_IP = process.env.SERVER_IP

export const returnHearts = async() => {
    console.log(Claims)
    for(let i=0; i < Claims.length; i++) {
        const sha = Claims[i].sha
        for(let j=0; j < 4; j++) {
            if(receiverIds[j] === '') {
                continue
            }
            const enc = await Encryption(sha, pubKeys[j])
            ReturnHearts.push({enc: enc, sha: sha})
        }
    }
}

export const returnHearts_Late = async() => {
    if(Claims_Late.length === 0) {
        return
    }
    console.log(Claims_Late);
    for(let i=0; i < Claims_Late.length; i++) {
        const sha = Claims_Late[i].sha
        for(let j=0; j < 4; j++) {
            if(receiverIds[j] === '') {
                continue;
            }
            const pubKey = await get_pubKey(receiverIds[j])
            const enc = await Encryption(sha, pubKey)
            ReturnHearts_Late.push({enc: enc, sha: sha})
        }
    }
    const res = await fetch(
        `${SERVER_IP}/special/returnclaimedheartlate`, {
            method: "POST",
            credentials: "include",  // uncomment this line if server running on same host as frontend (CORS)
            body: JSON.stringify({
                returnhearts: ReturnHearts_Late
            })
        }
    );
    if (!res.ok) {
      throw new Error(`HTTP Error: ${res.status} - ${res.statusText}`);
    }
}
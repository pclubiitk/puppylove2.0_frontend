import {SHA256, Encryption, RandInt} from "../Encryption"
import { PubK, Gender, ReturnHearts, pubKeys } from "../UserData"
import { returnHearts } from "./returnHearts"
const SERVER_IP = process.env.SERVER_IP

export const SendHeart = async(senderId: string, receiverIds: string [], Submit: boolean) => {
    try {
        const enc : string[] = []
        const sha : string[] = []
        const ids_encrypt: string[] = []
        const R1: number = parseInt(senderId)
        for(const id of receiverIds) {
            const R2: number = parseInt(id)
            const random = await RandInt()
            const R3: string = random.toString()
            const pubKey_: string = await get_pubKey(id)
            pubKeys.push(pubKey_)
            let id_encrypt: string;
            if(R1 < R2) {
                const id_plain:string  = R1.toString() + R2.toString() + R3
                id_encrypt = await Encryption(id_plain, PubK)
                const sha_:string = await SHA256(id_plain)
                sha.push(sha_)
                const enc_:string = await Encryption(sha_, pubKey_)
                enc.push(enc_)
            }
            else {
                const id_plain: string = R2.toString() + R1.toString() + R3
                id_encrypt = await Encryption(id_plain, PubK)
                const sha_:string = await SHA256(id_plain)
                sha.push(sha_)
                const enc_:string = await Encryption(sha_, pubKey_)
                enc.push(enc_)
            }
            ids_encrypt.push(id_encrypt)
        }
        const res = await fetch(
            `${SERVER_IP}/users/sendheartVirtual`, {
                method: "POST",
                credentials: "include",  // uncomment this line if server running on same host as frontend (CORS)
                body: JSON.stringify({
                    hearts: {
                        heart1: {
                            enc: enc[0],
                            sha: sha[0],
                            id_encrypt: ids_encrypt[0]
                        },
                        heart2: {
                            enc: enc[1],
                            sha: sha[1],
                            id_encrypt: ids_encrypt[1]
                        },
                        heart3: {
                            enc: enc[2],
                            sha: sha[2],
                            id_encrypt: ids_encrypt[2]
                        },
                        heart4: {
                            enc: enc[3],
                            sha: sha[3],
                            id_encrypt: ids_encrypt[3]
                        }
                    }
                }),
            }
        );
        if (!res.ok) {
            throw new Error(`HTTP Error: ${res.status} - ${res.statusText}`);
        }
        if(Submit) {
            await returnHearts()
            const res = await fetch(
                `${SERVER_IP}/users/sendheart`, {
                    method: "POST",
                    credentials: "include",  // uncomment this line if server running on same host as frontend (CORS)
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
                        returnhearts: ReturnHearts
                    }),
                }
            );
            if (!res.ok) {
                throw new Error(`HTTP Error: ${res.status} - ${res.statusText}`);
            }
        }
        return true
    }
    catch(err) {
        console.log(err)
        return false
    }
  }

export async function get_pubKey (id: string) {
    const res = await fetch(
        `${SERVER_IP}/users/fetchPublicKeys`, {
            method: "GET",
            credentials: "include"  // uncomment this line if server running on same host as frontend (CORS)
        }
    )
    if (!res.ok) {
        throw new Error(`HTTP Error: ${res.status} - ${res.statusText}`);
    }
    const res_json = await res.json()
    for (const publicKey of res_json) {
        if (publicKey._id === id) {
            return publicKey.pubKey;
        }
    }
    throw new Error("Public Key Not Found");
  }
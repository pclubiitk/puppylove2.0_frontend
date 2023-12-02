import { Decryption } from "../Encryption";
import { PrivK, Sent_Hearts , Heart, Hearts} from "../UserData"
const SERVER_IP = process.env.SERVER_IP

export const FetchReturnedHearts = async() => {
    const res = await fetch(
        `${SERVER_IP}/users/fetchReturnHearts`, {
            method: "GET",
            credentials: "include"  // uncomment this line if server running on same host as frontend (CORS)
        }
    );
    if (!res.ok) {
        throw new Error(`HTTP Error: ${res.status} - ${res.statusText}`);
    }
    const data = await res.json();
    await Promise.all(data.map( async (elem: any) => {
        const encoded_sha = elem.enc
        const sha = await Decryption(encoded_sha, PrivK)

        if(sha === 'Fail') {
            return;
        }

        for(const key in Sent_Hearts) {
            const heart: Heart = Sent_Hearts[key as keyof Hearts];
            if(heart.sha === sha) {
                const id_plain: string = await Decryption(heart.id_encrypt, PrivK)
                await match(encoded_sha, id_plain);
            }
        }
    }));
}

const match = async(enc: string, id_plain: string) => {
    const res = await fetch(
        `${SERVER_IP}/users/verifyreturnhearts`, {
            method: "POST",
            credentials: "include",  // uncomment this line if server running on same host as frontend (CORS)
            body: JSON.stringify({
                enc: enc,
                secret: id_plain
            })
        }
    );
    if (!res.ok) {
        throw new Error(`HTTP Error: ${res.status} - ${res.statusText}`);
    }
}
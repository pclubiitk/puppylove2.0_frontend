import { Decryption } from "./Encryption"

export let Gender = ""
export let PubK = ""
export let PrivK = ""
export let Data = ""
export let Submit = false
// IDs of receivers of heart from User
export let receiverIds: string[] = []

export let pubKeys: string[] = []

export function Set_Gender(gender: string) {
    Gender = gender
}

export function Set_PrivK(pvtKey_login: string) {
    PrivK = pvtKey_login
}

export function Set_PubK(pubKey_login: string) {
    PubK = pubKey_login
}

export function Set_Submit(submit: boolean) {
    Submit = submit
}

// Send Heart
export interface Heart {
    enc: string;
    sha: string;
    id_encrypt: string;
}
  
export interface Hearts {
    heart1: Heart;
    heart2: Heart;
    heart3: Heart;
    heart4: Heart;
}

export let Sent_Hearts: Hearts;

export async function Set_Data(data: string, id: string) {
    if(data === "FIRST_LOGIN") {
        return
    }

    Sent_Hearts = JSON.parse(data) as Hearts;

    const idEncrypts: string[] = []
    for(const key in Sent_Hearts) {
        idEncrypts.push(Sent_Hearts[key as keyof Hearts].id_encrypt);
    }

    for(let i=0; i < 4; i++) {
        const id: string = await Decryption(idEncrypts[i], PrivK)
        if(id === null){
            return
        }
        const parts = id.split("+")
        if(parts[0] === id) {
            receiverIds.push(parts[0])
            console.log(parts[0])
        }
        else {
            receiverIds.push(parts[1])
            console.log(parts[1])
        }
    }
}

export let heartsReceivedFromMales = 0
export let heartsReceivedFromFemales = 0

export function Set_heartsMale(heartsMales : number) {
  heartsReceivedFromMales += heartsMales;
}

export function Set_heartsFemale(heartsFemales : number) {
  heartsReceivedFromFemales += heartsFemales;
}

//Claimed Heart
interface heart {
    enc: string;
    sha: string;
    gender: string;
}

// Return Claimed Hearts
interface ReturnHeart {
    enc: string;
    sha: string;
}

export let ReturnHearts: ReturnHeart[] = [] 
export let ReturnHearts_Late: ReturnHeart[] = []

export let Claims: heart[] = []
export let Claims_Late : ReturnHeart[] = []

export async function Set_Claims(claims: string) {
    if (claims === "") {
        return
    }

    let jsonStrings: string[];

    if(claims.includes("+")) {
        jsonStrings = claims.split('+');
    }
    else {
        jsonStrings = [claims];
    }

    jsonStrings.forEach(jsonString => {
        const claim = JSON.parse(decodeURIComponent(jsonString)) as heart
        if(claim.gender === 'F') {
            heartsReceivedFromFemales++;
        }
        else {
            heartsReceivedFromMales++;
        }
        Claims.push(claim)
    });
}


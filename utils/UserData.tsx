import { Decryption } from "./Encryption"


export let Id = ''
export let Gender = ''
export let PubK = ''
export let PrivK = ''
export let Data = ''
export let Submit = false
// IDs of receivers of heart from User
export let receiverIds: string[] = []

export let pubKeys: string[] = []

export function Set_Id(id: string) {
    Id = id
}

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
        for(let i=0; i < 4; i++) {
            receiverIds[i] = ''
        }
        return
    }

    Sent_Hearts = JSON.parse(data) as Hearts;

    const idEncrypts: string[] = []
    for(const key in Sent_Hearts) {
        idEncrypts.push(Sent_Hearts[key as keyof Hearts].id_encrypt);
    }

    for(let i=0; i < 4; i++) {
        if(idEncrypts[i] === '') {
            receiverIds[i] = ''
            continue
        }
        const id: string = await Decryption(idEncrypts[i], PrivK)
        if(id === null){
            return
        }
        if(id.slice(0,6) === Id) {
            receiverIds[i] = (id.slice(6,12))
            console.log(id.slice(6,12))
        }
        else {
            receiverIds[i] = (id.slice(0,6))
            console.log(id.slice(0,6))
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
    heartsReceivedFromFemales = 0;
    heartsReceivedFromMales = 0;
    
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


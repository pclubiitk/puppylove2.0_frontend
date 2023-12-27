import { Student } from "./API_Calls/search"
import { Decryption } from "./Encryption"

export let Id = ''
export let Gender = ''
export let PubK = ''
export let PrivK = ''
export let Data = ''
export let Submit = false
// IDs of receivers of heart from User
export let receiverIds: string[] = []
export let Matched_Ids: string[] = []
export let Matches: Student[] = []
export let admin_pulished : boolean = true;
export let user = ""

export const setMatches = (student_matched: any) => {
    if (!Matches.includes(student_matched)) {
        Matches.push(student_matched);
    }
};

export const setUser = ( student_user : any) => {
    user = student_user;
};

export const setAdminPublished = (publish : boolean) => {
    admin_pulished = publish;
};

export const setMatchedIds = (newIds: string[]) => {
    Matched_Ids = newIds;
};

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

    // Initializing Every State Varibale to 0 incase user Logins again immediately after Logout
    for(let i=0; i < 4; i++) {
        receiverIds[i] = ''
    }

    if(data === "FIRST_LOGIN") {
        return
    }

    Sent_Hearts = JSON.parse(data) as Hearts;
    console.log(Sent_Hearts)

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
    genderOfSender: string;
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
    // Initializing Every State Varibale to 0 incase user logins again immediately after logout
    heartsReceivedFromFemales = 0;
    heartsReceivedFromMales = 0;
    Claims = []
    Claims_Late = []
    ReturnHearts = []
    ReturnHearts_Late = []
    
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
        console.log(claim)
        if(claim.genderOfSender === 'F') {
            heartsReceivedFromFemales++;
        }
        else {
            heartsReceivedFromMales++;
        }
        Claims.push(claim)
    });
}
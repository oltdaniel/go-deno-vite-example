export function makeApiRequest(url: string) {
    return fetch(url)
}

export async function apiGetPing() {
    const resp = await makeApiRequest('/api/ping').then(r => r.text())
    return resp
}

export async function apiGetRandom() {
    const resp = await makeApiRequest('/api/random').then(r => r.text())
    return resp
}

export interface RandomMessage {
    message: string;
}

export async function apiGetMessage(): Promise<RandomMessage> {
    const resp = await makeApiRequest('/api/message').then(r => r.json())
    return resp
}
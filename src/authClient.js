import { AUTH_LOGIN } from 'admin-on-rest';

export default (type, params) => {
    if (type === AUTH_LOGIN) {
        const { username, password } = params;
        const request = new Request('http://taiga.tag-ip.com/api/v1/auth', {
            method: 'POST',
            body: JSON.stringify({ username, password, type: "normal" }),
            headers: new Headers({ 'Content-Type': 'application/json' }),
        })
        return fetch(request)
            .then(response => {
                if (response.status < 200 || response.status >= 300) {
                    throw new Error(response.statusText);
                }
                return response.json();
            })
            .then(({ auth_token }) => {
                localStorage.setItem('token', auth_token);
            });
    }
    return Promise.resolve();
}

import { io } from 'socket.io-client';

import { BACKEND_URL } from './config';

const URL = BACKEND_URL;

export const socket = io(URL, {
    autoConnect: false,
    withCredentials: true
});

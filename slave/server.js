import axios from "axios";
import {MASTER_URL, REQUESTS_INTERVAL_S, SLAVE_LABEL, SLAVE_SECRET} from "./util/const.js";

const axiosInstance = axios.create({
    baseURL: MASTER_URL,
});

setInterval(async () => {
    const timestamp = new Date().toLocaleString('en-US', { hour12: false });

    try {
        const response = await axiosInstance.post('/', {
            label: SLAVE_LABEL,
            secret: SLAVE_SECRET,
        });

        if (response.data.success) {
            console.log(timestamp, 'Got successful response from master');
        }

    } catch (e) {
        const errorCode = e.response?.status || '';
        const errorMessage = e.response?.data?.message || e.message;

        console.error(timestamp, 'Got error response from master:', errorCode, errorMessage);
    }
}, REQUESTS_INTERVAL_S * 1000);
import axios from "axios";
import * as ImagePicker from "expo-image-picker";

const API_URL = "http://<192.168.0.107>:8000/detect";

async function sendImage() {
    const result = await ImagePicker.launchCameraAsync({ base64: false });
    if (!result.canceled) {
        const formData = new FormData();
        formData.append("file", {
            uri: result.assets[0].uri,
            type: "image/jpeg",
            name: "photo.jpg",
        });

        const res = await axios.post(API_URL, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        console.log(res.data.detections);
    }
}

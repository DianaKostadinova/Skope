import React, { useState } from "react";
import { View, Button, Image, Text, ScrollView } from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
const API_URL = "http://192.168.0.107:8000/detect";

export default function App() {
  const [image, setImage] = useState(null);
  const [detections, setDetections] = useState([]);

  const pickImage = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 1,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImage(uri);

      const form = new FormData();
      form.append("file", {
        uri,
        name: "photo.jpg",
        type: "image/jpeg",
      });

      try {
        const res = await axios.post(API_URL, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setDetections(res.data.detections);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={{ alignItems: "center", padding: 20 }}>
      <Button title="Take a Photo" onPress={pickImage} />
      {image && <Image source={{ uri: image }} style={{ width: 300, height: 400, marginTop: 20 }} />}
      {detections.length > 0 && (
        <View style={{ marginTop: 20 }}>
          {detections.map((d, i) => (
            <Text key={i}>
              {d.class} ({d.confidence})
            </Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

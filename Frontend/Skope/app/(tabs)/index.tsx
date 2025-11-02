import React, { useRef, useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera"; 
import Svg, { Rect, Text as SvgText } from "react-native-svg";
import BottomSheet from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import axios from "axios";

const { width, height } = Dimensions.get("window");


const API_URL = "http://192.168.0.107:8000/detect";

interface Detection {
    class: string;
    confidence: number;
    bbox: number[];
}

export default function App() {
    const [permission, requestPermission] = useCameraPermissions();
    const [detections, setDetections] = useState<Detection[]>([]);
    const [selected, setSelected] = useState<Detection | null>(null);
    const cameraRef = useRef<CameraView>(null);
    const bottomSheetRef = useRef<BottomSheet>(null);

    useEffect(() => {
        if (!permission?.granted) {
            requestPermission();
        }
    }, [permission]);

    const captureAndDetect = async () => {
        if (!cameraRef.current) return;
        const photo = await cameraRef.current.takePictureAsync({ base64: false });

        const form = new FormData();
        form.append("file", {
            uri: photo.uri,
            name: "frame.jpg",
            type: "image/jpeg",
        } as any);

        try {
            const res = await axios.post(API_URL, form, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setDetections(res.data.detections || []);
        } catch (err) {
            console.error("Detection error:", err);
        }
    };

    if (!permission) return <View />;
    if (!permission.granted) {
        return (
            <View style={styles.center}>
                <Text style={{ color: "white" }}>Camera permission required</Text>
                <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
                    <Text style={{ color: "white" }}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}> <View style={styles.container}>
            {/* Live camera feed */}
            <CameraView style={styles.camera} ref={cameraRef} facing="back" />

            {/* Detection overlay */}
            <Svg style={StyleSheet.absoluteFill}>
                {detections.map((d, i) => {
                    const [x1, y1, x2, y2] = d.bbox;
                    return (
                        <React.Fragment key={i}>
                            <Rect
                                x={x1 * (width / 640)}
                                y={y1 * (height / 640)}
                                width={(x2 - x1) * (width / 640)}
                                height={(y2 - y1) * (height / 640)}
                                stroke="lime"
                                strokeWidth="2"
                                fill="transparent"
                                onPress={() => {
                                    setSelected(d);
                                    bottomSheetRef.current?.expand();
                                }}
                            />
                            <SvgText
                                x={x1 * (width / 640)}
                                y={(y1 - 5) * (height / 640)}
                                fill="lime"
                                fontSize="16"
                            >
                                {d.class}
                            </SvgText>
                        </React.Fragment>
                    );
                })}
            </Svg>

            {/* SCAN Button */}
            <TouchableOpacity style={styles.captureButton} onPress={captureAndDetect}>
                <Text style={{ color: "white", fontWeight: "bold" }}>SCAN</Text>
            </TouchableOpacity>

            {/* Bottom Sheet Info */}
            <BottomSheet ref={bottomSheetRef} index={-1} snapPoints={["25%", "50%"]}>
                <View style={styles.sheet}>
                    {selected ? (
                        <>
                            <Text style={styles.title}>{selected.class}</Text>
                            <Text style={styles.conf}>Confidence: {selected.confidence}</Text>
                            <Text style={styles.desc}>
                                (LLM description will appear here later)
                            </Text>
                        </>
                    ) : (
                        <Text style={{ textAlign: "center" }}>No monument selected</Text>
                    )}
                </View>
            </BottomSheet>
        </View>
            

        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "black" },
    camera: { flex: 1 },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    permissionButton: {
        marginTop: 20,
        padding: 12,
        backgroundColor: "gray",
        borderRadius: 10,
    },
    captureButton: {
        position: "absolute",
        bottom: 40,
        alignSelf: "center",
        backgroundColor: "rgba(0,0,0,0.6)",
        padding: 16,
        borderRadius: 40,
    },
    sheet: { padding: 20 },
    title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
    conf: { fontSize: 16, color: "gray" },
    desc: { marginTop: 10, fontSize: 15, lineHeight: 20 },
});

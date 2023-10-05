import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import { BASE_URL } from './constants';

export default function CameraApp({ route, navigation }) {
    const type = CameraType.back;
    const { buttonId } = route.params;
    const [permission, requestPermission] = Camera.useCameraPermissions();
    const [capturedImage, setCapturedImage] = useState(null);
    const [flashMode, setFlashMode] = useState(Camera.Constants.FlashMode.off); // Initialize flash mode as off
    const cameraRef = useRef(null);

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
                <Button onPress={requestPermission} title="Grant Permission" />
            </View>
        );
    }

    const takePicture = async () => {
        if (cameraRef.current) {
            const photo = await cameraRef.current.takePictureAsync();
            setCapturedImage(photo.uri);
        }
    };

    const uploadImage = async () => {
        const formData = new FormData();
        formData.append('image', {
            uri: capturedImage,
            type: 'image/jpeg',
            name: 'image.jpg',
        });

        try {
            const response = await fetch(`${BASE_URL}/upload`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            if (response.ok) {
                const responseData = await response.json();
                navigation.navigate({
                    name: "Home",
                    params: {
                        filename: responseData.filename,
                        buttonId
                    },
                    merge: true
                });
            } else {
                console.error('Image upload failed.');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    };

    const retakePicture = () => {
        setCapturedImage(null);
    };

    const toggleFlash = () => {
        setFlashMode((prevMode) =>
            prevMode === Camera.Constants.FlashMode.off
                ? Camera.Constants.FlashMode.torch
                : Camera.Constants.FlashMode.off
        );
    };

    return (
        <View style={styles.container}>
            {capturedImage ? (
                <View style={styles.previewContainer}>
                    <Image source={{ uri: capturedImage }} style={styles.previewImage} />
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.alterButton} onPress={retakePicture}>
                            <Text style={styles.alterText}>Retake</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button} onPress={uploadImage}>
                            <Text style={styles.text}>Finish</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <View style={styles.previewContainer}>
                    <Camera style={styles.camera} type={type} ref={cameraRef} flashMode={flashMode}>
                        <TouchableOpacity style={styles.flashButton} onPress={toggleFlash}>
                            <Text style={styles.flashText}>
                                {flashMode === Camera.Constants.FlashMode.off ? 'Flash Off' : 'Flash On'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.captureButton} onPress={takePicture} />
                    </Camera>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    camera: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    captureButton: {
        width: 80,
        height: 80,
        backgroundColor: 'white',
        borderRadius: 40,
        marginBottom: 20,
    },
    previewContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewImage: {
        width: '100%',
        aspectRatio: 9 / 16,
        resizeMode: 'contain',
    },
    buttonContainer: {
        flexDirection: 'row',
    },
    button: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
        backgroundColor: '#6B4EFF',
        marginHorizontal: 10,
        borderRadius: 20,
    },
    text: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    alterButton: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
        backgroundColor: 'white',
        marginHorizontal: 10,
        borderRadius: 20,
    },
    alterText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#6B4EFF',
    },
    flashButton: {
        position: 'absolute',
        top: 20, // Adjust the position as needed
        right: 20, // Adjust the position as needed
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 5,
        padding: 10,
    },
    flashText: {
        color: 'white',
    },
});

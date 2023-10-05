import { io } from 'socket.io-client';
import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, TextInput, ScrollView, StatusBar } from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import { BASE_URL } from './constants';

const staticColors = {
    primary: '#6B4EFF'
}

export default function Home({ navigation, route }) {
    const [ocrTextInput, setOcrTextInput] = useState('');
    const [firstInputImage, setFirstInputImage] = useState(null);
    const [secondInputImage, setSecondInputImage] = useState(null);
    const [resultantImagePath, setResultantImagePath] = useState(null);
    const [resultantText, setResultantText] = useState(null);
    const [resultantReferencePath, setResultantReferencePath] = useState(null);
    const [isRadioButtonSelected, setRadioButtonSelected] = useState(true);

    useEffect(() => {
        const socket = io(BASE_URL);
        socket.on('frontend', (results) => {
            const res = JSON.parse(results);
            setResultantImagePath(res?.image_path);
            setResultantReferencePath(res?.ref_image_path);
            setResultantText(res?.texts);
        });
        return () => {
            socket.disconnect();
        };
    }, []);

    useEffect(() => {
        if (route.params?.filename && route.params?.buttonId) {
            if (route.params?.buttonId === 1) {
                setFirstInputImage(route.params?.filename);
            } else {
                setSecondInputImage(route.params?.filename);
            }
        }
    }, [route.params]);

    const toggleRadioButton = () => {
        setRadioButtonSelected(!isRadioButtonSelected);
    };

    const handleRunAnalysis = async () => {
        try {
            if (firstInputImage && (secondInputImage || ocrTextInput.length > 0)) {
                const response = await fetch(`${BASE_URL}/analysis`, {
                    method: 'POST',
                    body: JSON.stringify({
                        input_1_image: firstInputImage,
                        input_2_image: secondInputImage,
                        input_2_text: ocrTextInput
                    }),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                if (response.ok) {
                    const responseData = await response.json();
                    console.log(responseData);
                } else {
                    console.error('Analysis Failed.');
                }
            }
            else {
                console.log("Fields required");
            }
        } catch (error) {
            console.error('Error in running analysis:', error);
        }
    }

    const handleReset = async () => {
        setOcrTextInput('');
        setFirstInputImage(null);
        setSecondInputImage(null);
        setResultantImagePath(null);
        setResultantReferencePath(null);
        setResultantText(null);
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <StatusBar
                translucent
                backgroundColor="transparent"
                barStyle="light-content"
            />
            <Image source={require('./assets/Frinks_logo.png')} contentFit={'cover'} style={{ width: '80%', height: 60, resizeMode: 'contain' }} />
            <View style={styles.space} />
            <Text style={styles.boldText} >Frinks AI OCR Demo</Text>
            <View style={styles.space} />
            <View style={styles.partition}>
                <Text style={styles.partitionText}>Input 1</Text>
            </View>
            <View style={styles.space} />
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[
                        styles.radioButton,
                        styles.radioButtonSelected,
                    ]}
                    onPress={toggleRadioButton}
                >
                    <View style={styles.radioButtonInner} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                        navigation.navigate('CapturePage', { buttonId: 1 })
                    }}
                >
                    <Text style={styles.buttonText}>Capture Image</Text>
                </TouchableOpacity>
                <ScrollView horizontal>
                    <Text>{firstInputImage}</Text>
                </ScrollView>
            </View>

            <View style={styles.space} />
            <View style={styles.partition}>
                <Text style={styles.partitionText}>Input 2</Text>
            </View>
            <View style={styles.space} />
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[
                        styles.radioButton,
                        isRadioButtonSelected && styles.radioButtonSelected,
                    ]}
                    onPress={toggleRadioButton}
                >
                    {isRadioButtonSelected && <View style={styles.radioButtonInner} />}
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                        navigation.navigate('CapturePage', { buttonId: 2 })
                    }}
                    disabled={!isRadioButtonSelected}
                >
                    <Text style={styles.buttonText}>Capture Image</Text>
                </TouchableOpacity>
                <ScrollView horizontal>
                    <Text>{secondInputImage}</Text>
                </ScrollView>
            </View>
            <View style={styles.space} />
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[
                        styles.radioButton,
                        !isRadioButtonSelected && styles.radioButtonSelected,
                    ]}
                    onPress={toggleRadioButton}
                >
                    {!isRadioButtonSelected && <View style={styles.radioButtonInner} />}
                </TouchableOpacity>
                <Text style={styles.plainText}>Manual Entry: </Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter text..."
                    placeholderTextColor="gray"
                    editable={!isRadioButtonSelected}
                    value={ocrTextInput}
                    onChangeText={(e) => setOcrTextInput(e)}
                />
            </View>
            <View style={styles.space} />
            <TouchableOpacity
                style={styles.mainButton}
                onPress={handleRunAnalysis}
                disabled={resultantImagePath!==null}
            >
                <Text style={styles.mainButtonText}>Run Inspection</Text>
            </TouchableOpacity>
            <View style={styles.space} />
            {resultantImagePath ? (
                <>
                    <View style={styles.partition}>
                        <Text style={styles.partitionText}>Results</Text>
                    </View>
                    <View style={styles.resultContainer}>
                        <View style={styles.space} />
                        <Text style={styles.plainText}>Output 1:</Text>
                        <View style={styles.space} />
                        <ImageViewer imageUrls={[{ url: `${BASE_URL}/preview/${resultantImagePath}` }]} style={{ width: '100%', height: 350, resizeMode: 'contain', alignItems: 'center', backgroundColor: 'grey' }} renderIndicator={() => null} />
                        <View style={styles.space} />
                        {isRadioButtonSelected && resultantReferencePath ? (
                            <>
                                <Text style={styles.plainText}>Output 2:</Text>
                                <View style={styles.space} />
                                <ImageViewer imageUrls={[{ url: `${BASE_URL}/preview/${resultantReferencePath}` }]} style={{ width: '100%', height: 350, resizeMode: 'contain', alignItems: 'center', backgroundColor: 'grey' }} renderIndicator={() => null} />
                                <View style={styles.space} />
                            </>
                        ) : (null)}
                        <View style={styles.buttonContainer}>
                            <Text style={styles.plainText}>Text Output:</Text>
                            <Text style={styles.plainText}>{resultantText}</Text>
                        </View>
                        <View style={styles.space} />
                        <View style={styles.buttonContainer}>
                            <Text style={{ ...styles.resultText, color: resultantText ? 'green' : 'red' }} >{resultantText ? 'PASS' : 'FAIL'}</Text>
                            <TouchableOpacity
                                style={styles.button}
                                onPress={handleReset}
                            >
                                <Text style={styles.buttonText}>Reset</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </>
            ) : (null)}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        paddingTop: 60,
        paddingBottom: 40
    },
    boldText: {
        fontWeight: 'bold',
        fontSize: 24,
    },
    space: {
        height: 20,
    },
    partition: {
        width: '90%',
        backgroundColor: 'black',
        paddingVertical: 10,
        alignItems: 'center',
        marginLeft: 20,
        marginRight: 20
    },
    partitionText: {
        color: 'white',
        fontSize: 18,
    },
    buttonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        width: '90%'
    },
    button: {
        backgroundColor: staticColors.primary,
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 20,
        marginRight: 10,
    },
    mainButton: {
        backgroundColor: staticColors.primary,
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 20,
        marginRight: 10,
        width: '50%',
        alignItems: 'center'
    },
    mainButtonText: {
        color: 'white',
        fontSize: 16,
    },
    buttonText: {
        color: 'white',
        fontSize: 14,
    },
    radioButton: {
        width: 20,
        height: 20,
        borderWidth: 1,
        borderRadius: 15,
        borderColor: 'silver',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10
    },
    radioButtonSelected: {
        borderWidth: 10,
        borderColor: staticColors.primary,
        backgroundColor: staticColors.primary,
    },
    radioButtonInner: {
        width: 8,
        height: 8,
        borderRadius: 8,
        backgroundColor: 'white',
    },
    imageNameButton: {
        marginRight: 10,
    },
    imageNameButtonText: {
        color: 'black',
        fontSize: 14,
    },
    plainText: {
        marginRight: 10
    },
    input: {
        width: '50%',
        height: 30,
        borderRadius: 10,
        borderColor: 'silver',
        borderWidth: 1,
        paddingHorizontal: 10,
        fontSize: 14,
    },
    resultContainer: {
        alignItems: 'left',
        width: '90%'
    },
    resultText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginRight: 20
    }
});

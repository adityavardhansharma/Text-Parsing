import React, { useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes } from 'firebase/storage';
import Tesseract from 'tesseract.js';

const firebaseConfig = {
    apiKey: "AIzaSyCD7lA9_EE4BBVgcTdyIiPOVUuvrJU0blY",
    authDomain: "college-1-bd141.firebaseapp.com",
    projectId: "college-1-bd141",
    storageBucket: "college-1-bd141.appspot.com",
    messagingSenderId: "302577741731",
    appId: "1:302577741731:web:51fc2639bf79272296f416",
    measurementId: "G-RHNY40J2MM"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

const App = () => {
    const [file, setFile] = useState(null);
    const [textData, setTextData] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
    };

    const handleUpload = async () => {
        if (!file) {
            alert('Please select an image to upload.');
            return;
        }

        // Upload image to Firebase Storage
        const storageRef = ref(storage, `images/${file.name}`);
        await uploadBytes(storageRef, file);

        const imageUrl = `https://storage.googleapis.com/college-1-bd141.appspot.com/images/${file.name}`;

        try {
            // Use Tesseract to extract text from the loaded image
            const { data: { text } } = await Tesseract.recognize(imageUrl, 'eng');

            // Store data in Firestore
            const docRef = await addDoc(collection(db, '/firestore/college-1-bd141/certificates'), {
                imageUrl,
                extractedText: text,
            });

            const directImageUrl = `https://storage.googleapis.com/college-1-bd141.appspot.com/images/${file.name}`;
            console.log('Direct Image URL:', directImageUrl);
            console.log('Extracted Text:', text);

            setTextData({
                imageUrl,
                extractedText: text,
            });
        } catch (error) {
            console.error('Error during Tesseract recognition:', error);
            alert('Failed to extract text from the image. Please check the console for more details.');
        }
    };

    const fileInputLabelStyle = {
        backgroundColor: 'orange',
        padding: '10px 20px',
        borderRadius: '10px',
        cursor: 'pointer',
        marginRight: '10px',
    };

    const uploadButtonStyle = {
        backgroundColor: 'orange',
        padding: '10px 20px',
        borderRadius: '10px',
        cursor: 'pointer',
    };

    const resultContainerStyle = {
        marginTop: '20px',
        padding: '20px',
        backgroundColor: 'orange',
        borderRadius: '10px',
        textAlign: 'center',
    };

    return (
        <div style={{ backgroundColor: 'black', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                <label htmlFor="fileInput" style={fileInputLabelStyle}>
                    Choose File
                </label>
                <input
                    type="file"
                    id="fileInput"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                />
                <button onClick={handleUpload} style={uploadButtonStyle}>
                    Upload Image
                </button>
            </div>

            {textData && textData.imageUrl ? (
                <div style={resultContainerStyle}>
                    <h2 style={{ color: 'orange' }}>Extracted Text</h2>
                    <p>{textData.extractedText}</p>
                </div>
            ) : (
                <p style={{ color: 'white' }}>Image URL not available</p>
            )}
        </div>
    );
};

export default App;

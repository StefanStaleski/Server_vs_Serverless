import React, { useRef, useState } from 'react';

import {
    Button,
    Box,
} from '@mui/material';

import APIWebService from './APIWebService';

const FileUploader = () => {
    const fileInputRef = useRef(null);
    const [uploadedFile, setUploadedFile] = useState(null);

    const handleUploadClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setUploadedFile(file);

        const reader = new FileReader();

        reader.onload = (e) => {
            const fileContent = e.target.result;
        };

        reader.readAsText(file);
    };

    const handleDownloadClick = () => {
        if (uploadedFile) {
            const downloadLink = document.createElement('a');
            downloadLink.href = URL.createObjectURL(uploadedFile);
            downloadLink.download = uploadedFile.name;

            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
    };

    return (
        <>
            <Box style={{ display: 'flex', justifyContent: 'center' }} >
                <Button variant='contained' onClick={handleUploadClick} style={{ marginRight: '20px' }}>
                    Upload File
                </Button>
                <input
                    type='file'
                    style={{ display: 'none' }}
                    ref={fileInputRef}
                    onChange={handleFileChange}
                />
            </Box>
            <Box style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }} >
                {uploadedFile && (
                    <APIWebService uploadedFile={uploadedFile} />
                )}
            </Box>
        </>
    );
};

export default FileUploader;
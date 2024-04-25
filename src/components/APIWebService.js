import React, { useState } from 'react';
import { Button } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import AWS from 'aws-sdk';

AWS.config.update({
    region: 'eu-north-1',
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_KEY
});

const lambda = new AWS.Lambda();

const APIWebService = ({ uploadedFile }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState([]);
    const [numRequests, setNumRequests] = useState(1);

    const handleAPICall = async () => {
        setIsLoading(true);
        const startTime = performance.now();

        try {
            const formData = new FormData();
            formData.append('file', uploadedFile);

            const randomNumRequests = Math.floor((Math.random() * numRequests) + 1);
            formData.append('numRequests', randomNumRequests);

            const response = await fetch(`${process.env.REACT_APP_API_URL}/calculateAPI`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('API Call Failed');
            }

            const result = await response.json();
            result.totalTime = performance.now() - startTime;

            // Convert uploaded file to base64
            const reader = new FileReader();
            reader.onload = async () => {
                const fileContent = reader.result.split(',')[1]; // Extract base64 content

                const lambdaResponse = await lambda.invoke({
                    FunctionName: 'SortInput', // Replace with your Lambda function name
                    InvocationType: 'RequestResponse',
                    Payload: JSON.stringify({ file: fileContent, /* other payload data if any */ })
                }).promise();

                // Parse the Lambda function response
                const lambdaResult = JSON.parse(lambdaResponse.Payload);
                console.log(lambdaResult.body);

                // Update results state with the processed data
                setResults([...results, result]);
            };
            reader.readAsDataURL(uploadedFile);
        } catch (error) {
            console.error('Error handling API call: ', error);
        } finally {
            setIsLoading(false);
        }
    };

    const downloadSortedFile = () => {
        if (results.length === 0) {
            console.error('No results available to download');
            return;
        }

        const lastResult = results[results.length - 1];
        const sortedFile = new Blob([lastResult.sortedFile], { type: 'text/plain' });
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(sortedFile);
        downloadLink.download = 'sorted-file.txt';
        downloadLink.click();
    };

    const renderTable = () => {
        if (!results.length) return null;

        return (
            <div>
                <Button
                    variant='contained'
                    onClick={downloadSortedFile}
                    style={{ marginTop: '20px', marginBottom: '20px' }}
                >
                    Download Sorted File
                </Button>
                <table style={{ borderCollapse: 'collapse', border: '1px solid black' }}>
                    <thead>
                        <tr style={{ border: '1px solid black' }}>
                            <th style={{ border: '1px solid black', padding: '8px' }}>Number of Requests</th>
                            <th style={{ border: '1px solid black', padding: '8px' }}>Processing Time (ms)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.map((result, index) => (
                            <tr key={index} style={{ border: '1px solid black' }}>
                                <td style={{ border: '1px solid black', padding: '8px' }}>{result.numRequests}</td>
                                <td style={{ border: '1px solid black', padding: '8px' }}>{result.totalTime.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };


    return (
        <div style={{ alignItems: 'left', marginTop: '10px' }}>
            <div style={{ marginRight: '1170px' }}>
                <label htmlFor="thresholdInput">Threshold Value:</label>
                <input
                    id='thresholdInput'
                    type="number"
                    value={numRequests}
                    onChange={(e) => setNumRequests(e.target.value)}
                    style={{ marginBottom: '20px', alignContent: 'left', marginLeft: '5px' }}
                />
                <Button
                    variant='contained'
                    onClick={handleAPICall}
                    disabled={isLoading || !uploadedFile}
                >
                    Start Calculation via API
                </Button>
            </div>
            <div>

            </div>
            {isLoading ? (
                <CircularProgress style={{ marginTop: '20px' }} />
            ) : (
                renderTable()
            )}
        </div>
    );
};

export default APIWebService;

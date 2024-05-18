import React, { useState, useEffect } from 'react';
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
    const [lambdaResults, setLambdaResults] = useState([]);
    const [numRequests, setNumRequests] = useState(1);

    useEffect(() => {
        setIsLoading(false);
    }, [lambdaResults])

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
                    FunctionName: 'SortInput',
                    InvocationType: 'RequestResponse',
                    Payload: JSON.stringify({ file: fileContent, numRequests: randomNumRequests })
                }).promise();

                // Parse the Lambda function response
                const lambdaResult = JSON.parse(lambdaResponse.Payload);

                console.log(lambdaResult);
                console.log(lambdaResult.body);

                // Update results state with the processed data
                setResults([...results, result]);
                setLambdaResults([...lambdaResults, {
                    numRequests: randomNumRequests,
                    processingTime: parseFloat(lambdaResult.body.processingTime)
                }]);
            };
            reader.readAsDataURL(uploadedFile);
        } catch (error) {
            console.error('Error handling API call: ', error);
        } finally {
            // setIsLoading(false);
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
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Button
                        variant='contained'
                        onClick={downloadSortedFile}
                        style={{ marginTop: '20px', marginBottom: '20px' }}
                    >
                        Download Sorted File
                    </Button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                    <table style={{ borderCollapse: 'collapse', border: '1px solid black' }}>
                        <thead>
                            <tr style={{ border: '1px solid black' }}>
                                <th style={{ border: '1px solid black', padding: '8px' }}>Number of Requests</th>
                                <th style={{ border: '1px solid black', padding: '8px' }}>Server Processing Time (ms)</th>
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

                    <table style={{ borderCollapse: 'collapse', border: '1px solid black', marginLeft: '20px' }}>
                        <thead>
                            <tr style={{ border: '1px solid black' }}>
                                <th style={{ border: '1px solid black', padding: '8px' }}>Number of Requests</th>
                                <th style={{ border: '1px solid black', padding: '8px' }}>Serverless Processing Time (ms)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lambdaResults.map((result, index) => (
                                <tr key={index} style={{ border: '1px solid black' }}>
                                    <td style={{ border: '1px solid black', padding: '8px' }}>{result.numRequests}</td>
                                    <td style={{ border: '1px solid black', padding: '8px' }}>{result.processingTime.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };


    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'center', marginRight: '15px' }}>
                <label htmlFor="thresholdInput">Threshold Value:</label>
                <input
                    id='thresholdInput'
                    type="number"
                    value={numRequests}
                    onChange={(e) => setNumRequests(e.target.value)}
                    style={{ marginLeft: '5px' }}
                />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginRight: '27px' }}>
                <Button
                    variant='contained'
                    onClick={handleAPICall}
                    disabled={isLoading || !uploadedFile}
                    style={{
                        marginTop: '20px',
                        marginLeft: '30px'
                    }}
                >
                    Start Calculation via API
                </Button>
            </div>
            {isLoading ? (
                <CircularProgress style={{ marginTop: '20px', marginLeft: '125px' }} />
            ) : (
                renderTable()
            )}
        </div>
    );
};

export default APIWebService;

import React, { useState } from 'react';
import { Button } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';

const APIWebService = ({ uploadedFile }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [totalTime, setTotalTime] = useState(0);

    const handleAPICall = async () => {
        setIsLoading(true);
        const startTime = performance.now();

        try {
            const formData = new FormData();
            formData.append('file', uploadedFile);

            const response = await fetch('http://localhost:5000/calculateAPI', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('API Call Failed');
            };

            const sortedData = await response.json();
            setResult(sortedData);
        } catch (error) {
            console.error('Error handling API call: ', error);
        } finally {
            setIsLoading(false);
            const endTime = performance.now();
            const calculatedTime = endTime - startTime;
            setTotalTime(calculatedTime);
        }
    };

    const renderTable = () => {
        if (!result) return null;

        const rows = [];
        const data = result.data;

        for (let i = 0; i < Math.ceil(data.length / 38); i++) {
            const rowData = data.slice(i * 38, (i + 1) * 38);

            const cells = rowData.map((number, index) => (
                <td key={index} style={{ border: '1px solid black', padding: '5px' }}>{number}</td>
            ));
            rows.push(<tr key={i}>{cells}</tr>);
            console.log('test');
        }

        return (
            <table style={{ borderCollapse: 'collapse', border: '1px solid black' }}>
                <tbody>
                    {rows}
                </tbody>
            </table>
        );
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '10px' }}>
            <Button
                variant='contained'
                onClick={handleAPICall}
                disabled={isLoading || !uploadedFile}
            >
                Start Calculation via API
            </Button>
            <h2>Total time spent calculating the data: {totalTime.toFixed(2)} milliseconds</h2>
            {isLoading ? (
                <CircularProgress style={{ marginTop: '20px' }} />
            ) : (
                renderTable()
            )}
        </div>
    );
};

export default APIWebService;